"use client";

import "highlight.js";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.min.css";
import "katex/dist/katex.min.css";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { extractTextFromNode, getErrorMessage } from "~/lib/utils";
import { useMarkdown } from "./context";

// Initialize markdown-it with katex plugin
const md = new MarkdownIt({
  html: true, // Allow HTML in Markdown
  linkify: true, // Autoconvert URLs to links
  typographer: true, // Enable typographic replacements
});
md.use(markdownItKatex); // Add math rendering support

// Comparator to avoid unnecessary re-renders for text-based components
const areEqualText = (prevProps: any, nextProps: any) => {
  return (
    (typeof nextProps == "string" &&
      typeof prevProps == "string" &&
      prevProps == nextProps) ||
    extractTextFromNode(prevProps.node) === extractTextFromNode(nextProps.node)
  );
};

// Memoized Markdown Elements
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

// Modified MemoizedPre to handle raw code and language
const MemoizedPre = React.memo(function Pre({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const copyText = useCallback(async () => {
    if (!textRef.current) return;
    try {
      await window.navigator.clipboard.writeText(code);
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error("Copy failed:", error);
      toast(getErrorMessage(error));
    }
  }, [code]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const highlightedCode = hljs.highlightAuto(code);

  return (
    <pre className="!relative !overflow-auto rounded-md border">
      <div className="!sticky !inset-x-0 !top-0 flex items-center justify-between rounded-t-md bg-muted px-3 py-2">
        <p className="m-0 line-clamp-1 truncate text-sm">
          {language || "plaintext"}
        </p>
        <div className="ml-auto size-max">
          <Button
            size="icon"
            variant="ghost"
            onClick={copyText}
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
          </Button>
        </div>
      </div>
      <div className="px-3 py-2">
        <code
          ref={textRef}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </pre>
  );
});

// Component mapping for rendering markdown
const componentsMapping: { [key: string]: React.ComponentType<any> } = {
  h1: MemoizedHeading1,
  h2: MemoizedHeading2,
  h3: MemoizedHeading3,
  h4: MemoizedHeading4,
  h5: MemoizedHeading5,
  h6: MemoizedHeading6,
  p: MemoizedParagraph,
  li: MemoizedListItem,
  ul: MemoizedUnorderedList,
  ol: MemoizedOrderedList,
};

// Recursive function to render tokens to React components
function renderTokens(tokens: any[], idx = 0): [React.ReactNode[], number] {
  const elements: React.ReactNode[] = [];
  while (idx < tokens.length) {
    const token = tokens[idx];
    if (token.nesting === 1) {
      // Opening token (e.g., paragraph_open, heading_open)
      const children: React.ReactNode[] = [];
      idx++;
      while (idx < tokens.length && tokens[idx].nesting !== -1) {
        const [childElements, newIdx] = renderTokens(tokens, idx);
        children.push(...childElements);
        idx = newIdx;
      }
      if (idx < tokens.length && tokens[idx].nesting === -1) {
        idx++; // Skip the closing token
      }
      let Component;
      if (token.type === "paragraph_open") {
        Component = MemoizedParagraph;
      } else if (token.type.startsWith("heading_open")) {
        const level = token.tag.slice(1); // e.g., "h1" from "heading_open" with tag "h1"
        Component = componentsMapping[`h${level}`];
      } else if (token.type === "bullet_list_open") {
        Component = MemoizedUnorderedList;
      } else if (token.type === "ordered_list_open") {
        Component = MemoizedOrderedList;
      } else if (token.type === "list_item_open") {
        Component = MemoizedListItem;
      }
      if (Component) {
        elements.push(<Component key={elements.length}>{children}</Component>);
      }
    } else if (token.nesting === 0) {
      // Self-closing or standalone token
      if (token.type === "inline") {
        // Render inline content (text, links, math, etc.)
        elements.push(
          <span
            key={elements.length}
            dangerouslySetInnerHTML={{
              __html: md.renderer.renderInline(token.children, md.options, {}),
            }}
          />,
        );
      } else if (token.type === "fence") {
        // Render code blocks
        const code = token.content;
        const language = token.info;
        elements.push(
          <MemoizedPre key={elements.length} code={code} language={language} />,
        );
      } else if (token.type === "hr") {
        elements.push(<hr key={elements.length} />);
      }
      idx++;
    } else {
      // Closing token, handled by the opening token logic
      break;
    }
  }
  return [elements, idx];
}

// Main Markdown Renderer Component
const MarkdownRenderer: React.FC = React.memo(function MarkdownRenderer() {
  const markdown = useMarkdown();
  const tokens = md.parse(markdown, {});
  const [elements] = renderTokens(tokens);
  return <div>{elements}</div>;
});

export default MarkdownRenderer;
