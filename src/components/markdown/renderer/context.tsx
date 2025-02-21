"use client";

import React, { createContext, useContext } from "react";

interface MarkdownContextType {
  markdown: string;
}

const MarkdownContext = createContext<MarkdownContextType>({ markdown: "" });

export const MarkdownProvider: React.FC<{
  markdown: string;
  children: React.ReactNode;
}> = ({ markdown, children }) => (
  <MarkdownContext.Provider value={{ markdown }}>
    {children}
  </MarkdownContext.Provider>
);

export const useMarkdown = () => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error("useMarkdown must be used within a MarkdownProvider");
  }
  return context.markdown;
};
