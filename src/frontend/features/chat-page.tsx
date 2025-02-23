"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppSidebar, { AppSidebarTrigger } from "~/components/app-sidebar";
import Chat from "~/components/chat";
import { ChatProvider } from "~/components/chat/context";
import { SidebarProvider } from "~/components/ui/sidebar";
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

  return (
    <div className="flex size-full flex-col md:flex-row">
      <SidebarProvider className="!h-max md:!h-full md:!w-max">
        <AppSidebar />

        <div className="fixed left-0 top-0 z-10 hidden p-2 md:inline-block">
          <AppSidebarTrigger />
        </div>
      </SidebarProvider>

      <main className="my-auto size-full h-max max-h-[calc(100svh_-_61px)] overflow-x-hidden md:max-h-svh">
        {chat ? (
          <ChatProvider chatId={chat.id}>
            <Chat />
          </ChatProvider>
        ) : null}
      </main>
    </div>
  );
}
