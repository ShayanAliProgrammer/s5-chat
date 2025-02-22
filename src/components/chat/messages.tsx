"use client";

import { RefreshCcwIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { getErrorMessage } from "~/lib/utils";
import { Button } from "../ui/button";
import AssistantMessageBubble from "./bubbles/assistant-message";
import UserMessageBubble from "./bubbles/user-message";
import { useChatContext } from "./context";

const Messages = React.memo(function Messages() {
  const { messages, error, reload } = useChatContext();

  // Refs for the message container and the bottom scroll reference
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isNearBottom = React.useCallback(
    ({
      scrollTop,
      container,
    }: {
      scrollTop: number;
      container: HTMLDivElement;
    }) => container.scrollHeight - (scrollTop + container.clientHeight) <= 100,

    [],
  );

  function handleScroll() {
    if (containerRef.current && bottomRef.current) {
      const container = containerRef.current;

      // If the user is near the bottom, scroll to the bottom
      if (isNearBottom({ scrollTop: container.scrollTop, container })) {
        // const timeoutId = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        // }, 50);

        // return () => clearTimeout(timeoutId);
      }
    }
  }

  useEffect(() => {
    handleScroll();
  }, [messages, status]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[calc(100vh_-_210px)] w-full flex-col gap-3 overflow-y-auto px-3 pb-8 pt-4 md:min-h-[calc(100vh_-_140px)] lg:pb-10"
    >
      {messages?.map((message, index) => (
        <div
          key={message.id}
          className="mx-auto w-full max-w-sm md:!max-w-2xl lg:!max-w-4xl"
        >
          {message.role === "user" ? (
            <UserMessageBubble message={message} index={index} />
          ) : (
            <>
              <AssistantMessageBubble message={message} />
              {index == messages.length - 1 ? (
                <div className="w-full rounded-md border bg-secondary/50 p-1.5">
                  <Button size="icon" variant="ghost" onClick={() => reload()}>
                    <RefreshCcwIcon />
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      ))}

      {error && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="mr-auto max-w-xl rounded-md border border-destructive bg-destructive/40 p-5 text-destructive-foreground">
            <p>{getErrorMessage(error)}</p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
});

export default Messages;
