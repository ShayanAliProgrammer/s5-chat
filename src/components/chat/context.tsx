"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { dxdb, Message } from "~/lib/db/dexie";

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
  status: "error" | "submitted" | "streaming" | "ready";
  stop: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{
  children: React.ReactNode;
  chatId: string;
}> = ({ children, chatId }) => {
  const errorRef = useRef<string | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const setError = useCallback((error: string | null) => {
    errorRef.current = error;
    forceUpdate();
  }, []);

  const {
    setMessages,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    stop,
    status,

    reload,
  } = useChat({
    id: chatId,
    onError(error) {
      setError(error.message);
    },
  });

  // Load initial messages from the local database
  useEffect(() => {
    (async () => {
      const localMessages = await dxdb.getMessagesByChatId(chatId);
      setMessages(
        localMessages.map((message) => ({
          // @ts-expect-error ignore typecheck for next line
          content: String(message.parts[message.parts.length - 1]!.text),
          parts: message.parts,
          id: message.id,
          role: message.role,
          createdAt: message.createdAt,
        })) as Message[],
      );
    })();
  }, [chatId, setMessages]);

  useEffect(() => {
    stop();
  }, [chatId, stop]); // Stop the stream when navigating to a different chat

  // Fire-and-forget: update the database in the background when messages change
  useEffect(() => {
    if (messages.length > 1) {
      const lastMessageIndex = messages.length - 1;
      const lastMessage = messages[lastMessageIndex]!;
      const { parts, content } = lastMessage;

      if (parts && content && (parts.length > 0 || content.trim())) {
        (async () => {
          try {
            const chat = await dxdb.chats.get(chatId);
            if (chat && Array.isArray(chat.messages)) {
              const updatedMessage = {
                chatId,
                createdAt: lastMessage.createdAt ?? new Date(),
                id: lastMessage.id,
                parts: lastMessage.parts.filter(
                  (part) =>
                    part.type === "text" || part.type === "tool-invocation",
                ),
                role: lastMessage.role,
              };

              // @ts-expect-error Update the message in the local chat record
              chat.messages[lastMessageIndex] = updatedMessage;
              // Fire the database put in the background without awaiting it.
              dxdb.chats.put(chat).catch((err) => {
                console.error("Error saving chat:", err);
              });
            }
          } catch (err) {
            console.error("Error fetching chat:", err);
          }
        })();
      }
    }
  }, [messages, chatId]);

  const contextValue = useMemo(
    () => ({
      error: errorRef.current,
      setError,
      messages,
      input,
      handleInputChange,
      handleSubmit,
      addToolResult,
      status,
      stop,

      reload,
    }),
    [
      messages,
      input,
      handleInputChange,
      handleSubmit,
      addToolResult,
      status,
      stop,

      reload,
    ],
  );

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
