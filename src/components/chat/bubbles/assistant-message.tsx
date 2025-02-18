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
import { cn } from "~/lib/utils";

// Helper to extract internal chain-of-thought from markdown text.
function parseThinkTag(markdown: string): {
  chainOfThought: string | null;
  visibleText: string;
} {
  const regex = /<think>([\s\S]*?)<\/think>/i;
  const match = regex.exec(markdown);
  if (match) {
    const chainOfThought = match[1]!.trim();
    const visibleText = markdown.replace(regex, "").trim();
    return { chainOfThought, visibleText };
  }
  return { chainOfThought: null, visibleText: markdown };
}

// ---------------------------
// Text part component
// ---------------------------
interface TextPartProps {
  markdown: string;
}
const TextPart = React.memo(
  function TextPart({ markdown }: TextPartProps) {
    // Memoize parsing so it only recalculates when markdown changes.
    const { chainOfThought, visibleText } = useMemo(
      () => parseThinkTag(markdown),
      [markdown],
    );

    return (
      <>
        {chainOfThought && (
          <Disclosure>
            <DisclosureTrigger>
              <p className="!my-0 !mt-1 w-max cursor-pointer border-b-2 text-sm text-muted-foreground">
                Show internal chain-of-thought
              </p>
            </DisclosureTrigger>
            <DisclosureContent>
              <div className="border-l-2 py-2 pl-5 text-muted-foreground">
                {chainOfThought}
              </div>
            </DisclosureContent>
          </Disclosure>
        )}
        <div
          className={cn({
            "first:*:!mt-2": !!chainOfThought,
            "first:*:!mt-1": !chainOfThought,
          })}
        >
          <MarkdownProvider markdown={visibleText}>
            <MarkdownRenderer />
          </MarkdownProvider>
        </div>
      </>
    );
  },
  (prev, next) => prev.markdown === next.markdown,
);

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
              className="mb-2 flex w-max cursor-pointer items-center gap-1 hover:underline"
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
    const parts = useMemo(() => message.parts, [message.parts]);

    return (
      <div className="mr-auto w-full max-w-full p-5">
        <div className="prose !max-w-full dark:prose-invert">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part.type === "text" ? (
                <TextPart markdown={part.text} />
              ) : part.type === "tool-invocation" ? (
                <ToolInvocationDisclosure part={part} />
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
  (prev, next) => prev.message.content === next.message.content,
);

export default AssistantMessageBubble;
