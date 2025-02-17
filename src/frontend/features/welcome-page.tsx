"use client";

import { ChatProvider } from "~/components/chat/context";
import ChatForm from "~/components/chat/form";

export default function WelcomePage() {
  return (
    <ChatProvider>
      <div className="grid size-full place-items-center">
        <ChatForm />
      </div>
    </ChatProvider>
  );
}
