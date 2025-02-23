"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Loader2Icon, MessageSquarePlusIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import { Chat, dxdb } from "~/lib/db/dexie";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "../ui/sidebar";
import ChatLink from "./chat-link";

const CHATS_PER_PAGE = 1;

export const AppSidebarTrigger = React.memo(function ToggleSidebar() {
  return (
    <Button asChild variant="outline" size="icon" className="justify-center">
      <SidebarTrigger />
    </Button>
  );
});

export default React.memo(function AppSidebar() {
  const navigate = useNavigate();

  const handleNewChat = React.useCallback(async () => {
    const newChat = await dxdb.createChat(crypto.randomUUID());
    navigate(`/chat/${newChat.id}`);
  }, [navigate]);

  return (
    <div className="!h-max w-full md:z-20 md:w-max">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="mx-auto size-max py-2">
              <Link to="/chat">
                <Image
                  src="/logo.png"
                  alt="S5 Chat Logo"
                  width={40}
                  height={40}
                  className="dark:invert"
                />
              </Link>
            </div>

            <Button onClick={handleNewChat} variant="outline">
              <MessageSquarePlusIcon />
              New Chat
            </Button>
          </SidebarHeader>

          <div className="flex h-full max-h-full flex-col gap-1 overflow-y-auto overflow-x-hidden border-t px-2 pb-5 pt-3 *:flex-shrink-0">
            <Chats />
          </div>

          <SidebarFooter>
            <AppSidebarTrigger />
          </SidebarFooter>
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
  const [chats, setChats] = useState<Chat[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Use useLiveQuery to get real-time updates of chats
  const changes = useLiveQuery(async () => {
    const result = await dxdb.getAllChats(1, 20);
    return result.data;
  });

  // Separate data fetching from live updates
  const loadMoreChats = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await dxdb.getAllChats(page, 20);
      setChats((prev) => {
        // Filter out duplicates when adding new chats
        const newChats = result.data.filter(
          (newChat) =>
            !prev.some((existingChat) => existingChat.id === newChat.id),
        );
        return [...prev, ...newChats];
      });
      setHasMore(result.hasMore);
      setPage((p) => p + 1);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  // Update chats when changes occur
  useEffect(() => {
    if (changes) {
      setChats((prevChats) => {
        // Keep only chats that still exist in the database
        const existingChats = prevChats.filter((chat) =>
          changes.some((c) => c.id === chat.id),
        );
        // Add any new chats from the first page
        const newChats = changes.filter(
          (chat) => !existingChats.some((c) => c.id === chat.id),
        );
        return [...existingChats, ...newChats];
      });
    }
  }, [changes]);

  // Initial load
  useEffect(() => {
    if (chats.length === 0 && !isLoading) {
      loadMoreChats();
    }
  }, []);

  // Intersection Observer with debounce
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore || isLoading) return;

      let timeoutId: NodeJS.Timeout;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => loadMoreChats(), 100);
          }
        },
        { threshold: 0.1, rootMargin: "100px" },
      );

      observer.observe(node);
      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    },
    [hasMore, isLoading, loadMoreChats],
  );

  if (chats.length === 0 && isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  if (chats.length === 0 && !isLoading) {
    return <div className="py-4 text-center">No chats available</div>;
  }

  return (
    <>
      {chats.map((chat) => (
        <ChatLink key={chat.id} id={chat.id} title={chat.title} />
      ))}

      {hasMore && (
        <div
          ref={observerRef}
          className="flex items-center justify-center py-2"
        >
          <Loader2Icon className="animate-spin" />
        </div>
      )}
    </>
  );
});
