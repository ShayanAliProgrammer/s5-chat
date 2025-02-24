import { UIMessage } from "ai";
import { CopyCheckIcon, CopyIcon, PencilLineIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
    const [copied, setCopied] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

      setError(null);
    };

    // Cancel editing and revert to original content
    const handleCancel = useCallback(() => {
      setEditedContent(message.content);
      setIsEditing(false);
      setError(null);
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

    const copyText = useCallback(() => {
      if (typeof window == "undefined") return;

      window.navigator.clipboard
        .writeText(message.content)
        .then(() => {
          setCopied(true);
        })
        .catch(() => setCopied(false))
        .finally(() => {
          setTimeout(() => {
            setCopied(false);
          }, 1000);
        });
    }, [message.content]);

    return (
      <div className="group ml-auto flex w-max flex-col-reverse justify-end gap-1">
        <div className="ml-auto flex !w-max justify-end opacity-0 transition-all group-hover:opacity-100">
          <Button
            onClick={handleEditStart}
            aria-label="Edit message"
            variant="ghost"
            className="size-7"
            size="icon"
          >
            <PencilLineIcon />
          </Button>

          <Button
            onClick={copyText}
            aria-label="Edit message"
            variant="ghost"
            className="size-7"
            size="icon"
          >
            {copied ? <CopyCheckIcon /> : <CopyIcon />}
          </Button>
        </div>

        <div
          className={cn(
            "relative w-full max-w-xs overflow-auto whitespace-pre-wrap rounded-2xl rounded-br-lg rounded-tr-3xl border border-border/50 bg-muted p-5 text-base lg:max-w-xl",
            {
              "py-2.5": !isEditing,
            },
          )}
        >
          {!isEditing ? (
            message.content
          ) : (
            <>
              {/* Edit mode with textarea */}
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="min-h-[2.5rem] !w-full resize-none bg-transparent outline-none md:min-w-96"
                placeholder="Type your message..."
              />
              {/* Save and Cancel buttons */}
              <div className="mt-2 flex flex-row-reverse items-center justify-start gap-x-2">
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
      </div>
    );
  },
  (prev, next) =>
    prev.message.content === next.message.content && prev.index === next.index,
);

export default UserMessageBubble;
