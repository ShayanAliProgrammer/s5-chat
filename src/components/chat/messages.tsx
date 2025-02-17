"use client";

import React, { useEffect, useRef } from "react";
import AssistantMessageBubble from "./bubbles/assistant-message";
import UserMessageBubble from "./bubbles/user-message";
import { useChatContext } from "./context";

const Messages = React.memo(function Messages() {
  const { messages, error, addToolResult } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // When messages change, scroll to bottom smoothly.
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <div className="mx-auto flex !h-full w-full flex-col gap-3 overflow-auto px-3 py-3">
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
        {error && <p className="text-destructive">{error}</p>}
      </div>
      <div ref={bottomRef} className="mt-10" />
    </>
  );
});

export default Messages;
