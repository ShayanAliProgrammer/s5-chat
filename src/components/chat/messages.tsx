"use client";

import React, { useEffect, useRef } from "react";
import AssistantMessageBubble from "./bubbles/assistant-message";
import UserMessageBubble from "./bubbles/user-message";
import { useChatContext } from "./context";

const Messages = React.memo(function Messages() {
  const { messages, error, status } = useChatContext();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && status == "streaming") {
      const timeoutId = setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Adjust debounce delay as needed (e.g., 100ms)

      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  return (
    <div className="flex min-h-[calc(100vh_-_201px)] w-full flex-col gap-3 px-3 pb-5 pt-4 md:min-h-[calc(100vh_-_140px)] lg:pb-10">
      {messages?.map((message) => (
        <div
          key={message.id}
          className="mx-auto w-full md:!max-w-2xl lg:!max-w-4xl"
        >
          {message.role === "user" ? (
            <UserMessageBubble message={message} />
          ) : (
            <AssistantMessageBubble message={message} />
          )}
        </div>
      ))}
      {error && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="mr-auto max-w-xl rounded-md border border-destructive bg-destructive/40 p-5 text-destructive-foreground">
            <p>{error}</p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
});

export default Messages;
