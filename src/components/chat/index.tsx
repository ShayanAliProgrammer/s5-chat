// Chat.tsx
"use client";

import React from "react";
import ChatForm from "./form";
import Messages from "./messages";

const Chat = React.memo(function Chat() {
  return (
    <div className="grid !size-full place-items-center">
      <Messages />
      <ChatForm />
    </div>
  );
});

export default Chat;
