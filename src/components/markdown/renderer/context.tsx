"use client";

import React, { createContext, useContext, useMemo } from "react";

interface MarkdownContextType {
  markdown: string;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(
  undefined,
);

export const MarkdownProvider: React.FC<{
  markdown: string;
  children: React.ReactNode;
}> = ({ markdown, children }) => {
  const value = useMemo(() => ({ markdown }), [markdown]);

  return (
    <MarkdownContext.Provider value={value}>
      {children}
    </MarkdownContext.Provider>
  );
};

export const useMarkdown = (): string => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error("useMarkdown must be used within a MarkdownProvider");
  }
  return context.markdown;
};
