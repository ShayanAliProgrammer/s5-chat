"use client";

import "highlight.js/styles/vs2015.min.css";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGFM from "remark-gfm";
import { Button } from "~/components/ui/button";
import { extractTextFromNode } from "~/lib/utils";
import { useMarkdown } from "./context";

// Define plugins outside to keep references stable
const remarkPlugins = [remarkGFM];
const rehypePlugins = [rehypeHighlight];

// Comparator to avoid unnecessary re-renders for text-based components
const areEqualText = (prevProps: any, nextProps: any) => {
  return (
    extractTextFromNode(prevProps.node) === extractTextFromNode(nextProps.node)
  );
};

// Memoized Markdown elements
const MemoizedParagraph = React.memo(
  (props: any) => <p {...props} />,
  areEqualText,
);
const MemoizedHeading1 = React.memo(
  (props: any) => <h1 {...props} />,
  areEqualText,
);
const MemoizedHeading2 = React.memo(
  (props: any) => <h2 {...props} />,
  areEqualText,
);
const MemoizedHeading3 = React.memo(
  (props: any) => <h3 {...props} />,
  areEqualText,
);
const MemoizedHeading4 = React.memo(
  (props: any) => <h4 {...props} />,
  areEqualText,
);
const MemoizedHeading5 = React.memo(
  (props: any) => <h5 {...props} />,
  areEqualText,
);
const MemoizedHeading6 = React.memo(
  (props: any) => <h6 {...props} />,
  areEqualText,
);
const MemoizedListItem = React.memo(
  (props: any) => <li {...props} />,
  areEqualText,
);
const MemoizedUnorderedList = React.memo(
  (props: any) => <ul {...props} />,
  areEqualText,
);
const MemoizedOrderedList = React.memo(
  (props: any) => <ol {...props} />,
  areEqualText,
);

// Optimized Pre component with copy functionality
const MemoizedPre = React.memo(function Pre(props: any) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Extract language from className
  const language =
    props.children?.props?.className?.split("language-")[1] || "plaintext";

  // Copy text handler with memoization
  const copyText = useCallback(async () => {
    if (!textRef.current) return;

    try {
      await window.navigator.clipboard.writeText(
        textRef.current.textContent ?? "Error copying",
      );
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }, []);

  // Cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <pre className="rounded-md border">
      <div className="flex items-center justify-between rounded-t-md bg-background px-3 py-2">
        <p className="m-0 line-clamp-1 truncate text-sm">{language}</p>
        <div className="ml-auto size-max">
          <Button size="icon" variant="ghost" onClick={copyText}>
            {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
          </Button>
        </div>
      </div>
      <div ref={textRef} {...props} />
    </pre>
  );
}, areEqualText);

// Component mapping for rendering markdown
const componentsMapping = {
  p: MemoizedParagraph,
  h1: MemoizedHeading1,
  h2: MemoizedHeading2,
  h3: MemoizedHeading3,
  h4: MemoizedHeading4,
  h5: MemoizedHeading5,
  h6: MemoizedHeading6,
  li: MemoizedListItem,
  ul: MemoizedUnorderedList,
  ol: MemoizedOrderedList,
  pre: MemoizedPre,
};

// Main Markdown Renderer Component
const MarkdownRenderer: React.FC = React.memo(function MarkdownRenderer() {
  const markdown = useMarkdown();

  return (
    <Markdown
      children={markdown}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={componentsMapping}
    />
  );
});

export default MarkdownRenderer;
