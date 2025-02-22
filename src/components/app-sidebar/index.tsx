"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { MessageSquarePlusIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { dxdb } from "~/lib/db/dexie";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "../ui/sidebar";
import ChatLink from "./chat-link";

export const AppSidebarTrigger = React.memo(function ToggleSidebar() {
  return (
    <Button asChild variant="outline" size="icon" className="justify-center">
      <SidebarTrigger />
    </Button>
  );
});

export default React.memo(function AppSidebar() {
  const navigate = useNavigate();

  // Function to create a new chat and redirect the user
  const handleNewChat = React.useCallback(async () => {
    const newChat = await dxdb.createChat(crypto.randomUUID());
    navigate(`/chat/${newChat.id}`);
  }, []);

  return (
    <div className="!h-max w-full md:z-20 md:w-max">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <AppSidebarTrigger />

            {/* Button to create new chat and redirect */}
            <Button onClick={handleNewChat} variant="outline">
              <MessageSquarePlusIcon />
              New Chat
            </Button>
          </SidebarHeader>

          <div className="flex h-full max-h-full flex-col gap-1 overflow-y-auto overflow-x-hidden border-t px-2 pb-5 pt-3 *:flex-shrink-0">
            <Chats />
          </div>
        </SidebarContent>
      </Sidebar>

      <header className="bg-backgound mb-auto flex !w-full items-center justify-between gap-1 border-b p-5 py-3 md:hidden">
        <AppSidebarTrigger />

        <Button onClick={handleNewChat} variant="outline" size="icon">
          <MessageSquarePlusIcon />
        </Button>
      </header>
    </div>
  );
});

const Chats = React.memo(() => {
  // Use useLiveQuery to automatically fetch and update the chat list.
  const chats = useLiveQuery(() => dxdb.getAllChats(), []);

  return (
    <>
      {chats && chats.length > 0 ? (
        chats.map((chat) => (
          <ChatLink key={chat.id} id={chat.id} title={chat.title} />
        ))
      ) : (
        <div>No chats available</div>
      )}
    </>
  );
});
