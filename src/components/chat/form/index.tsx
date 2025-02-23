"use client";

import React from "react";
import { dxdb } from "~/lib/db/dexie";
import { useChatContext } from "../context";
import ChatFormInput from "./input";

const ChatForm: React.FC = React.memo(
  function ChatForm() {
    const { input, handleSubmit, setError, chatId } = useChatContext();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      await dxdb.addMessageToChat(
        chatId!,
        {
          type: "text",
          text: input,
        },
        "user",
      );

      handleSubmit(e);
      setError(null);
    }

    return (
      <form
        onSubmit={onSubmit}
        className="sticky inset-x-0 bottom-0 w-full bg-transparent px-3 pb-6"
      >
        <ChatFormInput key="chat-form-input" />
      </form>
    );
  },
  () => false,
);

export default ChatForm;
