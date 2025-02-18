import { UIMessage } from "ai";
import { Message } from "~/lib/db/dexie";

export default function UserMessageBubble({
  message,
}: {
  message: Message | UIMessage;
}) {
  return (
    <div className="ml-auto !w-max max-w-sm whitespace-pre-wrap rounded-3xl bg-muted px-5 py-2.5 text-base lg:max-w-xl">
      {message.content}
    </div>
  );
}
