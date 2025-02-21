"use client";

import { CornerDownLeftIcon, SquareIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface ChatFormInputProps {
  value: string;
  status: "error" | "submitted" | "streaming" | "ready";
  stop: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setError: (err: string | null) => void;
}

const MAX_HEIGHT = 164;

const ChatFormInputInner: React.FC<ChatFormInputProps> = React.memo(
  function ChatFormInputInner({ value, onChange, status, stop, setError }) {
    const submitBtnRef = useRef<HTMLButtonElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize effect
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const handleResize = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
      };

      handleResize();
      textarea.addEventListener("input", handleResize);

      return () => {
        textarea.removeEventListener("input", handleResize);
      };
    }, [value]);

    // Keydown handler for Enter
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        setTimeout(() => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitBtnRef.current?.click();
            setError(null);
          }
        }, 10);
      };

      textarea.addEventListener("keydown", handleKeyDown);
      return () => {
        textarea.removeEventListener("keydown", handleKeyDown);
      };
    }, [setError]);

    return (
      <div className="w-full px-1">
        <div className="relative mx-auto w-full max-w-5xl rounded-[22px] border border-border/5">
          <div className="relative flex flex-col rounded-2xl border border-border/5 bg-muted">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `${MAX_HEIGHT}px` }}
            >
              <div className="relative">
                <Textarea
                  defaultValue={value}
                  placeholder="Enter Message..."
                  className="resize-none rounded-2xl rounded-b-none border-none bg-muted px-4 py-3 leading-[1.2] focus-visible:ring-0"
                  ref={textareaRef}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="h-12 w-full rounded-b-xl bg-muted dark:bg-muted">
              <div className="!ml-auto w-max pr-3">
                <SubmitButton
                  value={value}
                  status={status}
                  submitBtnRef={submitBtnRef}
                  setError={setError}
                  textareaRef={textareaRef}
                  stop={stop}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const SubmitButton = React.memo(
  function SubmitButton({
    status,
    submitBtnRef,
    setError,
    textareaRef,
    value,
    stop,
  }: {
    value: string;
    status: "streaming" | "ready" | "submitted" | "error";
    textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
    submitBtnRef: React.MutableRefObject<HTMLButtonElement | null>;
    setError: (err: string | null) => void;
    stop: () => void;
  }) {
    return (
      <>
        {status === "streaming" ? (
          <Button
            type="button"
            size="icon"
            onClick={stop}
            className={cn("justify-center rounded-full")}
          >
            <SquareIcon />
          </Button>
        ) : (
          <Button
            type="submit"
            ref={submitBtnRef}
            size="icon"
            onClick={() => {
              setError(null);
              if (textareaRef.current) {
                textareaRef.current.value = "";
              }
            }}
            variant={value ? "default" : "outline"}
            className={cn("justify-center rounded-full")}
          >
            <CornerDownLeftIcon />
          </Button>
        )}
      </>
    );
  },
  (prev, next) => prev.status == next.status,
);

const ChatFormInput = React.memo(
  function ChatFormInput(props: ChatFormInputProps) {
    return (
      <ChatFormInputInner
        onChange={props.onChange}
        setError={props.setError}
        status={props.status}
        stop={props.stop}
        value={props.value}
      />
    );
  },
  (prev, next) => prev.status === next.status && prev.value === next.value,
);

export default ChatFormInput;
