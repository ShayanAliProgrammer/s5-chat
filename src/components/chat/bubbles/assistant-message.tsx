import {
  getMessageParts,
  ReasoningUIPart,
  SourceUIPart,
  TextUIPart,
  ToolInvocationUIPart,
} from "@ai-sdk/ui-utils";
import { type UIMessage } from "ai";
import { CheckIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import MarkdownRenderer from "~/components/markdown/renderer";
import { MarkdownProvider } from "~/components/markdown/renderer/context";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "~/components/ui/disclosure";
import { TextShimmer } from "~/components/ui/text-shimmer";
import { Message } from "~/lib/db/dexie";

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
              className="mb-2 w-max cursor-pointer items-center gap-1 hover:underline"
            >
              <span>{part.toolInvocation.toolName}</span>
              <CheckIcon className="ml-1 size-4 text-green-600 dark:text-green-400" />
            </p>
          </DisclosureTrigger>
          <DisclosureContent>
            <div className="border-b-2 text-sm">
              <p>Tool Result:</p>
              <MarkdownProvider markdown={`\`\`\json\n${resultString}\n\`\`\``}>
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
  }: {
    message: Message | UIMessage;
  }) {
    // Memoize the parts array so that re-renders only occur if message.parts changes.
    const parts = useMemo(() => getMessageParts(message), [message]);

    return (
      <div className="mr-auto w-full max-w-full p-5">
        <div className="prose !max-w-full dark:prose-invert">
          <MessageParts parts={parts} />
        </div>
      </div>
    );
  },
  (prev, next) => prev.message.content === next.message.content,
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
