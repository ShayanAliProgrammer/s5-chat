"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from "react";

interface ChatContextType {
  error: string | null;
  setError: (error: string | null) => void;

  messages: UIMessage[];
  input: string;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: any,
  ) => void;
  addToolResult: (args: { toolCallId: string; result: any }) => void;

  // status and stop
  status: "error" | "submitted" | "streaming" | "ready";
  stop: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use refs to store mutable values that we don't want to trigger re-renders
  const errorRef = useRef<string | null>(null);
  // A reducer to force a re-render when these refs update
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const setError = useCallback((error: string | null) => {
    errorRef.current = error;
    forceUpdate();
  }, []);

  // Use your chat hook. (Ensure its callbacks are memoized inside the hook or wrap them here.)
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    stop,
    status,
  } = useChat({
    onError(error) {
      setError(error.message);
    },
  });

  // Memoize the context value. (Be cautious—if any value changes, all consumers will re-render.)
  const contextValue = useMemo(() => {
    return {
      error: errorRef.current,
      setError,
      messages,
      input,
      handleInputChange,
      handleSubmit,
      addToolResult,
      status,
      stop,
    };
  }, [
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    // While refs are mutable, forceUpdate ensures a re-render when their values change.
    errorRef.current,

    status,
    stop,
  ]);

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
