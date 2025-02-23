"use client";

import { ArrowUpIcon, MicIcon, SquareIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { AVAILABLE_MODELS, Model } from "~/lib/ai/available-models";
import { cn } from "~/lib/utils";
import { useChatContext } from "../../context";

interface ChatFormInputProps {
  value: string;
  status: "error" | "submitted" | "streaming" | "ready";
  stop: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setError: (err: string | null) => void;
}

const MAX_HEIGHT = 160;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

const ChatFormInputInner: React.FC = React.memo(function ChatFormInputInner() {
  const {
    input: value,
    handleInputChange,

    status,
    stop,
    setError,

    selectedModel,
    setSelectedModel,
  } = useChatContext();

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
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

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
      handleInputChange({
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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full px-1">
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-secondary">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Textarea
                value={value}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitBtnRef.current?.click();
                    setError(null);
                  }
                }}
                placeholder="Enter Message..."
                className="resize-none rounded-b-none border-none bg-muted px-5 py-4 !text-base leading-[1.2] focus-visible:ring-0"
                ref={textareaRef}
                autoFocus
              />
            </div>
          </div>

          <div className="w-full rounded-b-xl bg-muted dark:bg-muted">
            <div className="flex items-center justify-between gap-2 px-4 py-2 pb-3">
              <ModelSelection
                setSelectedModel={setSelectedModel}
                selectedModel={selectedModel}
              />

              {/* Voice and Submit Buttons */}
              <div className="flex items-center gap-2">
                <MicButton
                  isRecording={isRecording}
                  startRecording={startRecording}
                  stopRecording={stopRecording}
                  isSpeechSupported={isSpeechSupported}
                />

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
    </div>
  );
});

const ModelSelection = React.memo(
  function ModelSelection({
    setSelectedModel,
    selectedModel,
  }: {
    selectedModel: Model;
    setSelectedModel: (model: Model) => void;
  }) {
    return (
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <Button asChild variant="outline">
          <SelectTrigger className="h-max max-w-[250px] justify-between text-sm">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
        </Button>
        <SelectContent className="max-h-60">
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model} value={model}>
              <div className="flex flex-col gap-1 text-left">
                <p>{model}</p>

                <p className="text-xs text-muted-foreground">
                  {/* model description */}
                  Our Most capable model
                </p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
  (prev, next) => prev.selectedModel == next.selectedModel,
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
            <ArrowUpIcon />
          </Button>
        )}
      </>
    );
  },
  (prev, next) =>
    prev.status === next.status &&
    prev.value.length > 0 === next.value.length > 0,
);

const MicButton = React.memo(
  function MicButton({
    isSpeechSupported,
    isRecording,
    startRecording,
    stopRecording,
  }: {
    isSpeechSupported: boolean;
    isRecording: boolean;
    startRecording: () => void;
    stopRecording: () => void;
  }) {
    return (
      <>
        {isSpeechSupported && (
          <Button
            type="button"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className="justify-center rounded-full"
            variant={isRecording ? "default" : "ghost"}
          >
            <MicIcon />
          </Button>
        )}
      </>
    );
  },
  (prev, next) =>
    prev.isSpeechSupported === next.isSpeechSupported &&
    prev.isRecording === next.isRecording,
);

const ChatFormInput = React.memo(function ChatFormInput() {
  return <ChatFormInputInner />;
});

export default ChatFormInput;
