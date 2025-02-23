import {
  getMessageParts,
  ReasoningUIPart,
  SourceUIPart,
  TextUIPart,
  ToolInvocationUIPart,
} from "@ai-sdk/ui-utils";
import { type UIMessage } from "ai";
import {
  CheckIcon,
  CopyCheckIcon,
  CopyIcon,
  RefreshCcwIcon,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import MarkdownRenderer from "~/components/markdown/renderer";
import { MarkdownProvider } from "~/components/markdown/renderer/context";
import { Button } from "~/components/ui/button";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "~/components/ui/disclosure";
import { TextShimmer } from "~/components/ui/text-shimmer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Message } from "~/lib/db/dexie";
import { useChatContext } from "../context";

// ---------------------------
// Tool invocation component
// ---------------------------
interface ToolInvocationDisclosureProps {
  part: Extract<UIMessage["parts"][number], { type: "tool-invocation" }>;
}
const ToolInvocationDisclosure = React.memo(
  function ToolInvocationDisclosure({ part }: ToolInvocationDisclosureProps) {
    const [open, setOpen] = useState(false);
    const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

    if (part.toolInvocation.state === "result") {
      const result = part.toolInvocation.result;
      const typeofResult = typeof result;
      const resultString = JSON.stringify(
        typeofResult === "object" ? result : { result },
        null,
        2,
      );
      return (
        <Disclosure open={open} onOpenChange={setOpen}>
          <DisclosureTrigger>
            <p
              onClick={toggleOpen}
              className="!mb-0 flex w-max cursor-pointer items-center gap-x-2 !p-0 hover:underline"
            >
              <span>{part.toolInvocation.toolName}</span>
              <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
            </p>
          </DisclosureTrigger>
          <DisclosureContent>
            <div className="border-b-2 text-sm">
              <p>Tool Result:</p>
              <MarkdownProvider
                markdown={`\`\`\`json\n${resultString}\n\`\`\``}
              >
                <MarkdownRenderer />
              </MarkdownProvider>
            </div>
          </DisclosureContent>
        </Disclosure>
      );
    } else {
      return <TextShimmer as="p">{part.toolInvocation.toolName}</TextShimmer>;
    }
  },
  (prev, next) => {
    // Avoid re-rendering if the toolInvocation details haven't changed.
    return (
      JSON.stringify(prev.part.toolInvocation) ===
      JSON.stringify(next.part.toolInvocation)
    );
  },
);

// ---------------------------
// Main component
// ---------------------------
const AssistantMessageBubble = React.memo(
  function AssistantMessageBubble({
    message,
    index,
    messagesCount,
  }: {
    message: Message | UIMessage;
    index: number;
    messagesCount: number;
  }) {
    // Memoize the parts array so that re-renders only occur if message.parts changes.
    const parts = useMemo(() => getMessageParts(message), [message]);

    return (
      <div className="group" data-markdown={message.content}>
        <div className="mr-auto w-full max-w-full p-5 pb-0">
          <div className="prose prose-base !max-w-full dark:prose-invert">
            <MessageParts parts={parts} />
          </div>
        </div>

        <Actions
          index={index}
          messagesCount={messagesCount}
          // message={message}
        />
      </div>
    );
  },
  (prev, next) => prev.message.content === next.message.content,
);

const Actions = React.memo(
  ({
    index,
    messagesCount,
    // message,
  }: {
    index: number;
    messagesCount: number;
    // message: Message | UIMessage;
  }) => {
    const { reload } = useChatContext();
    const [copied, setCopied] = useState(false);

    const copyTextCallback = useCallback(
      (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) =>
        async () => {
          e.currentTarget.parentElement
            ? window.navigator.clipboard
                .writeText(
                  e.currentTarget.parentElement.getAttribute("data-markdown") ??
                    "Something went wrong",
                )
                .then(() => {
                  setCopied(true);
                })
                .catch(() => setCopied(false))
                .finally(() => {
                  setTimeout(() => {
                    setCopied(false);
                  }, 1000);
                })
            : null;
        },
      [],
    );

    return index == messagesCount - 1 ? (
      <div className="w-full px-3 opacity-0 transition-all group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => reload()}
              className="rounded-full"
            >
              <RefreshCcwIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regerate</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyTextCallback}
              className="rounded-full"
            >
              {copied ? <CopyCheckIcon /> : <CopyIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy</p>
          </TooltipContent>
        </Tooltip>
      </div>
    ) : null;
  },
  (prev, next) =>
    // prev.message.content == next.message.content ||
    prev.messagesCount == next.messagesCount,
);

const MessageParts = React.memo(
  ({
    parts,
  }: {
    parts: (
      | TextUIPart
      | ReasoningUIPart
      | ToolInvocationUIPart
      | SourceUIPart
    )[];
  }) => {
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={`${index}-${part.type}`}>
            {part.type === "text" ? (
              <div className="mt-2">
                <MarkdownProvider markdown={part.text}>
                  <MarkdownRenderer />
                </MarkdownProvider>
              </div>
            ) : part.type === "tool-invocation" ? (
              <ToolInvocationDisclosure part={part} />
            ) : null}
          </React.Fragment>
        ))}
      </>
    );
  },
);

export default AssistantMessageBubble;
