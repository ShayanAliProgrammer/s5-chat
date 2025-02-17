"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeftIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface ChatFormInputProps {
  value: string; // initial value (used only on mount)

  setInput: React.Dispatch<React.SetStateAction<string>>;

  // onChange will be called (debounced) on input
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const MAX_HEIGHT = 164;

const AnimatedPlaceholder = React.memo(function AnimatedPlaceholder({
  value,
}: {
  value: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={"placeholder"}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.1 }}
        className="pointer-events-none absolute w-[150px] text-sm text-muted-foreground"
      >
        {value ? "" : "Type something here..."}
      </motion.p>
    </AnimatePresence>
  );
});

const ChatFormInputInner: React.FC<ChatFormInputProps> = React.memo(
  function ChatFormInputInner({ value, onChange, setInput }) {
    const submitBtnRef = useRef<HTMLButtonElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Attach keydown listener via useEffect
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          // @ts-expect-error ignore type check for next line
          e.currentTarget.value = "";
          submitBtnRef.current?.click();
        }
      };
      textarea.addEventListener("keydown", handleKeyDown);
      return () => {
        textarea.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    // Attach a debounced input listener via useEffect
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      let debounceTimeout: ReturnType<typeof setTimeout>;
      const handleInput = (e: Event) => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          // Pass a synthetic event to parent's onChange
          // @ts-expect-error ignore typecheck for next line
          onChange(e as React.ChangeEvent<HTMLTextAreaElement>);
        }, 10);
      };
      textarea.addEventListener("input", handleInput);
      return () => {
        clearTimeout(debounceTimeout);
        textarea.removeEventListener("input", handleInput);
      };
    }, [onChange]);

    return (
      <div className="w-full py-5">
        <div className="relative mx-auto w-full max-w-3xl rounded-[22px] border border-border/5 p-1">
          <div className="relative flex flex-col rounded-2xl border border-border/5 bg-muted">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `${MAX_HEIGHT}px` }}
            >
              <div className="relative">
                <Textarea
                  // Use defaultValue so that the textarea is uncontrolled.
                  defaultValue={value}
                  placeholder=""
                  className="resize-none rounded-2xl rounded-b-none border-none bg-muted px-4 py-3 leading-[1.2] focus-visible:ring-0"
                  ref={textareaRef}
                />
                {/* For an uncontrolled textarea, you might need additional logic to show the placeholder.
                    Here we simply check the initial value. */}

                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder value={value} />
                </div>
              </div>
            </div>

            <div className="h-12 w-full rounded-b-xl bg-muted dark:bg-muted">
              <div className="!ml-auto w-max pr-3">
                <Button
                  type="submit"
                  ref={submitBtnRef}
                  size="icon"
                  onClick={() =>
                    textareaRef.current
                      ? (textareaRef.current.value = "")
                      : null
                  }
                  variant={value ? "default" : "outline"}
                  className={cn("justify-center rounded-full")}
                >
                  <CornerDownLeftIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

// Wrap the inner component with React.memo. We compare only the "value" prop.
const ChatFormInput = React.memo(
  function ChatFormInput(props: ChatFormInputProps) {
    return <ChatFormInputInner {...props} />;
  },
  (prev, next) => prev.value === next.value && prev.search === next.search,
);

export default ChatFormInput;
