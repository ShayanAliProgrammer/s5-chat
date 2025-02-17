"use client";

import { MessageSquarePlusIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import ProfileButton from "../profile/button";
import { Button } from "../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  return (
    <div className="!h-max w-full md:z-20 md:w-max">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <AppSidebarTrigger />

            <Button asChild>
              <Link to="/">
                <MessageSquarePlusIcon />
                New Chat
              </Link>
            </Button>
          </SidebarHeader>

          <ul className="flex h-full max-h-full flex-col gap-1 overflow-auto border-b border-t px-2 pb-5 pt-3 *:flex-shrink-0">
            <ChatLink id="xyz" />
            <ChatLink id="zyx" />
          </ul>

          <SidebarFooter>
            <Button size="lg" variant="outline">
              Account
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>

      <header className="bg-backgound mb-auto flex !w-full items-center justify-between gap-1 border-b p-5 py-3 md:hidden">
        <AppSidebarTrigger />

        <p className="line-clamp-1 max-w-[50vw] text-muted-foreground">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem eaque
          cupiditate minus officiis repellendus! Corrupti cumque quae
          consectetur. Consectetur sapiente corporis beatae commodi ab earum
          nisi itaque perspiciatis accusamus voluptates!
        </p>

        <ProfileButton />
      </header>
    </div>
  );
});
