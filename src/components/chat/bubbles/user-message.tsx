import { UIMessage } from "ai";
import React from "react";
import { Message } from "~/lib/db/dexie";

export default React.memo(
  function UserMessageBubble({ message }: { message: Message | UIMessage }) {
    return (
      <div className="ml-auto !w-max max-w-xs whitespace-pre-wrap rounded-3xl bg-muted px-5 py-2.5 text-base lg:max-w-xl">
        {message.content}
      </div>
    );
  },
  (prev, next) => prev.message.content == next.message.content,
);
