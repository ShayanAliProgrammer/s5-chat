"use client";

import { MessageSquareIcon, XIcon } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
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

export default function ChatLink({ id }: { id: string }) {
  function handleDelete() {
    try {
      toast("Chat deleted succesfully");
    } catch (error) {
      toast("Something went wrong", {
        description: <p>{getErrorMessage(error)}</p>,
      });
    }
  }

  return (
    <Button
      asChild
      variant="ghost"
      className="group/chat-link relative w-full overflow-hidden p-0"
    >
      <li>
        <Link
          to={`/chat/${id}`}
          className="flex !size-full items-center gap-2 px-3 py-3"
        >
          <MessageSquareIcon />
          New Chat
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <p
              className="absolute -right-full flex cursor-pointer justify-end rounded-md bg-gradient-to-r from-transparent to-muted p-2 transition-all hover:!from-destructive hover:!to-destructive hover:text-destructive-foreground group-hover/chat-link:right-0.5"
              role="button"
            >
              <XIcon />
            </p>
          </AlertDialogTrigger>

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
      </li>
    </Button>
  );
}
