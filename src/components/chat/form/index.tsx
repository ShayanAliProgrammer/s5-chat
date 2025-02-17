"use client";

import React from "react";
import { useChatContext } from "../context";
import ChatFormInput from "./input";

const ChatForm: React.FC = React.memo(function ChatForm() {
  const { input, setInput, handleInputChange, handleSubmit } = useChatContext();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    handleSubmit(e);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="sticky inset-x-0 bottom-0 w-full bg-gradient-to-t from-background to-background/40 px-3"
    >
      <ChatFormInput
        key="chat-form-input"
        value={input}
        onChange={handleInputChange}
        setInput={setInput}
      />
    </form>
  );
});

export default ChatForm;
