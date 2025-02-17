"use client";

import React, { useEffect, useRef } from "react";
import AssistantMessageBubble from "./bubbles/assistant-message";
import UserMessageBubble from "./bubbles/user-message";
import { useChatContext } from "./context";

const Messages = React.memo(function Messages() {
  const { messages, addToolResult, error } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Debounce smooth scrolling to the bottom when messages change.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // Adjust debounce delay as needed (e.g., 100ms)

    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <>
      <div className="mx-auto mb-auto flex !size-full min-h-[calc(100vh_-_164px)] flex-col gap-3 overflow-auto px-3 py-4">
        {messages.map((message) => (
          <div key={message.id} className="mx-auto w-full max-w-4xl">
            {message.role === "user" ? (
              <UserMessageBubble message={message} />
            ) : (
              <AssistantMessageBubble
                addToolResult={addToolResult}
                message={message}
              />
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
    </>
  );
});

export default Messages;
