"use client";

import { ChatProvider } from "~/components/chat/context";
import ChatForm from "~/components/chat/form";

export default function WelcomePage() {
  return (
    <ChatProvider>
      <div className="grid size-full h-[calc(100vh_-_81px)] place-items-center md:h-screen">
        <ChatForm />
      </div>
    </ChatProvider>
  );
}
