"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { cn, getErrorMessage } from "~/lib/utils";
import AssistantMessageBubble from "./bubbles/assistant-message";
import UserMessageBubble from "./bubbles/user-message";
import { useChatContext } from "./context";

const Messages = React.memo(function Messages() {
  const { messages, error, reload, hasMore, isLoading, loadMoreMessages } =
    useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry && entry.isIntersecting && hasMore && !isLoading) {
        loadMoreMessages();
      }
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMoreMessages]);

  const messagesCount = React.useMemo(() => messages.length, [messages.length]);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 overflow-y-auto px-3 pb-8 pt-4 lg:pb-10",
        {
          "md:min-h-[calc(100svh_-_190px)]": messages.length > 0,
        },
      )}
    >
      {messages.length <= 0 ? (
        <div className="my-auto flex h-max w-full flex-col items-center justify-center gap-1.5">
          <h1 className="text-3xl text-foreground lg:text-4xl">
            Welcome to S5 Chat.
          </h1>

          <h2 className="text-2xl text-muted-foreground lg:text-3xl">
            How can I assist you today?
          </h2>
        </div>
      ) : null}

      {messages?.map((message, index) => (
        <div
          key={message.id}
          className="mx-auto w-full max-w-full md:!max-w-2xl lg:!max-w-4xl"
        >
          {message.role === "user" ? (
            <UserMessageBubble message={message} index={index} />
          ) : (
            <AssistantMessageBubble
              message={message}
              index={index}
              messagesCount={messagesCount}
            />
          )}
        </div>
      ))}

      {error && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-lg border border-destructive bg-destructive p-4 text-destructive-foreground">
            {getErrorMessage(error)}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
});

export default Messages;
