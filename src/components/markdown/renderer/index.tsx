"use client";

import "highlight.js/styles/vs2015.min.css";
import React from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGFM from "remark-gfm";
import { useMarkdown } from "./context";

// Define plugins outside to keep the references stable.
const remarkPlugins = [remarkGFM];
const rehypePlugins = [rehypeHighlight];

/**
 * Custom comparator for memoization.
 * Returns true if the text content (children) is the same.
 */
const areEqualText = (prevProps: any, nextProps: any) => {
  return prevProps.children === nextProps.children;
};

// Memoized renderers for common markdown elements:
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

// Map markdown element names to our memoized components.
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
};

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
