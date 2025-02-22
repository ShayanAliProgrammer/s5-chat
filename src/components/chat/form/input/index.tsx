"use client";

import { CornerDownLeftIcon, MicIcon, SquareIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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

// Check browser support for SpeechRecognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

const ChatFormInputInner: React.FC<ChatFormInputProps> = React.memo(
  function ChatFormInputInner({ value, onChange, status, stop, setError }) {
    const submitBtnRef = useRef<HTMLButtonElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Auto-resize effect
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    }, [value]);

    // Initialize and handle speech recognition
    const startRecording = () => {
      if (!isSpeechSupported) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true; // Keep listening until stopped
      recognition.interimResults = true; // Show interim results
      recognition.lang = "en-US"; // Set language (adjustable)

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i]![0]!.transcript;
          if (event.results[i]!.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const newValue = value + finalTranscript + interimTranscript;
        onChange({
          target: { value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
    };

    const stopRecording = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }, []);

    return (
      <div className="w-full px-1">
        <div className="relative mx-auto w-full max-w-3xl rounded-[22px] border border-border/5">
          <div className="relative flex flex-col rounded-2xl border border-border/5 bg-muted">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `${MAX_HEIGHT}px` }}
            >
              <div className="relative">
                <Textarea
                  value={value}
                  onChange={onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitBtnRef.current?.click();
                      setError(null);
                    }
                  }}
                  placeholder="Enter Message..."
                  className="resize-none rounded-2xl rounded-b-none border-none bg-muted px-4 py-3 leading-[1.2] focus-visible:ring-0"
                  ref={textareaRef}
                  autoFocus
                />
              </div>
            </div>

            <div className="h-12 w-full rounded-b-xl bg-muted dark:bg-muted">
              <div className="flex items-center justify-end gap-2 pr-3">
                {/* Voice Input Button */}
                {isSpeechSupported && (
                  <Button
                    type="button"
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn("justify-center rounded-full", {
                      "bg-red-600 hover:bg-red-700": isRecording,
                    })}
                    variant="ghost"
                  >
                    <MicIcon />
                  </Button>
                )}
                {/* Submit/Stop Button */}
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
  (prev, next) => prev.value === next.value && prev.status === next.status,
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
            variant={value.length > 0 ? "default" : "outline"}
            disabled={value.length <= 0}
            className={cn("justify-center rounded-full")}
          >
            <CornerDownLeftIcon />
          </Button>
        )}
      </>
    );
  },
  (prev, next) =>
    prev.status === next.status &&
    prev.value.length > 0 === next.value.length > 0,
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
