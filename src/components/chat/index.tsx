// Chat.tsx
"use client";

import React from "react";
import ChatForm from "./form";
import Messages from "./messages";

const Chat = React.memo(function Chat() {
  return (
    <div className="flex !h-full w-full flex-col">
      <Messages />
      <ChatForm />
    </div>
  );
});

export default Chat;
