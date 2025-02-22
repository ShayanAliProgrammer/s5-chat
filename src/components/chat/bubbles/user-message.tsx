import { UIMessage } from "ai";
import { PencilIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Message } from "~/lib/db/dexie";
import { cn } from "~/lib/utils";
import { useChatContext } from "../context";

const UserMessageBubble = React.memo(
  function UserMessageBubble({
    message,
    index,
  }: {
    message: Message | UIMessage;
    index: number;
  }) {
    const { messages, setMessages, setError, reload } = useChatContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { chatId } = useParams();

    // Auto-resize the textarea based on content
    const autoResize = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";
        // Set height to match content
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    // Toggle edit mode and focus textarea
    const handleEditStart = useCallback(() => {
      setIsEditing(true);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          autoResize(); // Initial resize on edit start
        }
      }, 0);
    }, [autoResize]);

    // Handle content change in textarea
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value);
        autoResize(); // Resize on every change
      },
      [autoResize],
    );

    const handleSave = async () => {
      if (editedContent.trim() === "") return; // Prevent empty messages
      const updatedMessage = { ...message, content: editedContent.trim() };
      const newMessages = [...messages];
      newMessages[index] = updatedMessage;
      // Remove all messages after the edited one
      newMessages.splice(index + 1);
      setMessages(newMessages);
      // If the last message is a user message, generate a new AI response
      const lastMessage = newMessages[newMessages.length - 1]!;
      if (lastMessage.role === "user") {
        reload();
      }
      setIsEditing(false);
    };

    // Cancel editing and revert to original content
    const handleCancel = useCallback(() => {
      setEditedContent(message.content);
      setIsEditing(false);
    }, [message.content]);

    // Handle Enter (save) and Escape (cancel) key presses
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
          handleCancel();
        }
      },
      [handleSave, handleCancel],
    );

    // Ensure textarea resizes when entering edit mode or content changes externally
    useEffect(() => {
      if (isEditing) {
        autoResize();
      }
    }, [isEditing, editedContent, autoResize]);

    return (
      <div
        className={cn(
          "group relative ml-auto max-w-xs whitespace-pre-wrap rounded-3xl bg-muted/60 px-5 py-2.5 text-base lg:max-w-xl",
          {
            "w-max": !isEditing,
          },
        )}
      >
        {!isEditing ? (
          <>
            {/* Display message content */}
            <p>{message.content}</p>
            {/* Edit button (visible on hover) */}
            <Button
              onClick={handleEditStart}
              className="absolute bottom-1 right-1 rounded-full opacity-0 transition-all group-hover:opacity-100"
              aria-label="Edit message"
              variant="ghost"
              size="icon"
            >
              <PencilIcon />
            </Button>
          </>
        ) : (
          <>
            {/* Edit mode with textarea */}
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="min-h-[2.5rem] !w-full resize-none bg-transparent outline-none md:min-w-96" // Changed resize-y to resize-none
              placeholder="Type your message..."
            />
            {/* Save and Cancel buttons */}
            <div className="mt-2 flex flex-row-reverse items-center justify-start gap-2">
              <Button
                onClick={handleSave}
                aria-label="Save changes"
                className="!size-max rounded-full"
              >
                Submit
              </Button>

              <Button
                onClick={handleCancel}
                variant="outline"
                aria-label="Cancel editing"
                className="!size-max rounded-full"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.message.content === next.message.content && prev.index === next.index,
);

export default UserMessageBubble;
