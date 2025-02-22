import { useChat } from "@ai-sdk/react";
import type { ChatRequestOptions, UIMessage } from "ai";
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
  setMessages: (messages: UIMessage[]) => void; // Added to allow message updates
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

  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
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
          // @ts-expect-error ignore next line
          content: String(message.parts[message.parts.length - 1]!.text),
          parts: message.parts,
          id: message.id,
          role: message.role,
          createdAt: message.createdAt,
        })) as Message[],
      );
    })();
  }, [chatId, setMessages]);

  // Stop streaming when chatId changes
  useEffect(() => {
    stop();
  }, [chatId, stop]);

  // Sync messages to the database when they change (including edits)
  useEffect(() => {
    if (messages.length > 0) {
      (async () => {
        try {
          const chat = await dxdb.chats.get(chatId);
          if (chat && Array.isArray(chat.messages)) {
            // Update the entire messages array in the database
            const updatedMessages = messages.map((msg) => ({
              chatId,
              createdAt: msg.createdAt ?? new Date(),
              id: msg.id,
              parts: msg.parts?.filter(
                (part) =>
                  part.type === "text" || part.type === "tool-invocation",
              ) || [{ type: "text", text: msg.content }],
              role: msg.role,
            }));
            // @ts-expect-error ignore next line
            chat.messages = updatedMessages;
            await dxdb.chats.put(chat); // Persist to IndexedDB
          }
        } catch (err) {
          console.error("Error syncing messages to database:", err);
        }
      })();
    }
  }, [messages, chatId]);

  const contextValue = useMemo(
    () => ({
      error: errorRef.current,
      setError,
      messages,
      setMessages, // Expose setMessages for editing
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
      setMessages,
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
