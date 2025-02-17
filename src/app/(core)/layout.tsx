"use client";

import React from "react";
import { BrowserRouter } from "react-router";
import AppSidebar, { AppSidebarTrigger } from "~/components/app-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

export const dynamic = "force-static";

export default function Layout({ children }: { children: React.ReactNode }) {
  if (typeof window == "undefined") return;

  return (
    <BrowserRouter>
      <div className="flex size-full flex-col md:flex-row">
        <SidebarProvider className="!h-max md:!h-full md:!w-max">
          <AppSidebar />

          <div className="fixed left-0 top-0 z-10 hidden p-2 md:inline-block">
            <AppSidebarTrigger />
          </div>
        </SidebarProvider>

        <main className="size-full max-h-[calc(100vh_-_61px)] md:h-screen">
          {children}
        </main>
      </div>
    </BrowserRouter>
  );
}
