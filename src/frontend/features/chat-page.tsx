import Chat from "~/components/chat";
import { ChatProvider } from "~/components/chat/context";

export default function ChatPage() {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
}
