import React from "react";
import ChatForm from "./form";
import Messages from "./messages";

const Chat = React.memo(function Chat() {
  return (
    <div className="relative flex !size-full flex-col">
      <Messages />

      <ChatForm />
    </div>
  );
});

export default Chat;
