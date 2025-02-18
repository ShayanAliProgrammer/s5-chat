"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "~/components/chat";
import { ChatProvider } from "~/components/chat/context";
import { type Chat as ChatType, dxdb } from "~/lib/db/dexie";

export default function ChatPage() {
  const { chatId } = useParams();
  const [chat, setChat] = useState<ChatType | null>(null);

  useEffect(() => {
    // Fetch chat from database if chatId exists
    if (chatId) {
      dxdb.chats.get(chatId).then((chat) => {
        setChat(chat ?? null);
      });
    }
  }, [chatId]);

  if (!chat) {
    return (
      <div className="grid size-full place-items-center">
        <Loader2Icon className="size-10 animate-spin" />
      </div>
    ); // Show loading until chat data is available
  }

  return (
    <ChatProvider chatId={chat.id}>
      <Chat />
    </ChatProvider>
  );
}
