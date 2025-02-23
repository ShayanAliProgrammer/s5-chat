"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";
import { useEffect } from "react";
import Chat from "~/components/chat";
import { ChatProvider } from "~/components/chat/context";
import { Button } from "~/components/ui/button";
import { dxdb } from "~/lib/db/dexie";

export default function WelcomePage() {
  const id = "temp-chat";

  useEffect(() => {
    (async () => {
      const chat = await dxdb.getChatById(id);
      if (!chat) {
        await dxdb.createChat(id);
      }
    })();
  }, []);

  return (
    <main className="flex size-full min-h-[calc(100vh_-_100px)] flex-col items-center gap-10 md:min-h-screen">
      <header className="flex w-full items-center justify-between p-5 px-7 pb-2">
        <Image
          src="/logo.png"
          alt="S5 Chat Logo"
          width={40}
          height={40}
          className="dark:invert"
        />

        <Button>
          <LoginLink>Sign in</LoginLink>
        </Button>
      </header>

      <ChatProvider chatId={id}>
        <Chat />
      </ChatProvider>
    </main>
  );
}
