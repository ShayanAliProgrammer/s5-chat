"use client";

import { EditIcon, MessageSquareIcon, XIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { dxdb } from "~/lib/db/dexie";
import { getErrorMessage } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export default function ChatLink({ id, title }: { id: string; title: string }) {
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleUpdateTitle() {
    if (newTitle.trim() !== "") {
      try {
        await dxdb.updateChatTitle(id, newTitle);
        toast("Chat title updated successfully");
        setEditing(false); // Close the edit mode
      } catch (error) {
        toast("Failed to update title", {
          description: <p>{getErrorMessage(error)}</p>,
        });
      }
    } else {
      toast("Title cannot be empty");
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleUpdateTitle();
    }
  };

  return (
    <Button
      asChild
      variant="outline"
      className="group/chat-link relative w-full overflow-hidden p-0"
    >
      <li>
        <Link
          to={`/chat/${id}`}
          className="flex !size-full items-center gap-2 px-3 py-3"
        >
          <MessageSquareIcon />

          {!editing ? (
            <span>{newTitle}</span>
          ) : (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown} // Handle Enter key press
              className="outline-offset-background border bg-transparent p-2 outline-offset-2 outline-ring"
              ref={inputRef}
              autoFocus
            />
          )}
        </Link>

        <div className="absolute -right-full top-0 flex cursor-pointer items-center justify-end rounded-md bg-gradient-to-r from-transparent to-muted pl-6 transition-all group-hover/chat-link:right-0">
          <Actions
            editing={editing}
            setEditing={setEditing}
            inputRef={inputRef}
            chatId={id}
          />
        </div>
      </li>
    </Button>
  );
}

const Actions = React.memo(function Actions({
  editing,
  setEditing,
  inputRef,

  chatId: id,
}: {
  editing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  chatId: string;
}) {
  async function handleDelete() {
    try {
      await dxdb.deleteChat(id);
      toast("Chat deleted successfully");
    } catch (error) {
      toast("Something went wrong", {
        description: <p>{getErrorMessage(error)}</p>,
      });
    }
  }

  return (
    <>
      {!editing && (
        <Button
          size="icon"
          variant="ghost"
          className="rounded-none hover:bg-yellow-600 hover:text-yellow-50 dark:hover:bg-yellow-800 dark:hover:text-yellow-100"
          onClick={() => {
            setEditing(true);
            inputRef.current?.focus();
          }}
        >
          <EditIcon className="cursor-pointer" />
        </Button>
      )}

      {/* Delete Chat Dialog */}
      <AlertDialog>
        <Button asChild variant="secondary" size="icon">
          <AlertDialogTrigger asChild>
            <p
              className="rounded-none transition-all hover:!bg-destructive hover:!text-destructive-foreground"
              role="button"
            >
              <XIcon />
            </p>
          </AlertDialogTrigger>
        </Button>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Should we delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove your data from your browser and our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button variant="destructive" asChild>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
