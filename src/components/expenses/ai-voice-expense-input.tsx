"use client";

import { Loader2, Mic, MicOff, Send, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { classifyExpense } from "@/lib/actions/ai";
import { transcribeAndClassifyVoice } from "@/lib/actions/voice";
import type {
  Account,
  Category,
  ClassifyExpenseResult,
  Owner,
} from "@/lib/types";

interface AiVoiceExpenseInputProps {
  categories: Category[];
  accounts: Account[];
  owners: Owner[];
  onClassified: (
    result: ClassifyExpenseResult,
    source: "ai_text" | "voice"
  ) => void;
}

export function AiVoiceExpenseInput({
  categories,
  accounts,
  owners,
  onClassified,
}: AiVoiceExpenseInputProps) {
  const t = useTranslations("Expenses");
  const [textInput, setTextInput] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleTextClassify = useCallback(async () => {
    if (!textInput.trim()) {
      return;
    }
    setIsClassifying(true);
    try {
      const result = await classifyExpense(
        textInput,
        categories,
        accounts,
        owners
      );
      onClassified(result, "ai_text");
      setTextInput("");
    } catch {
      // Error handled by parent via toast
    } finally {
      setIsClassifying(false);
    }
  }, [textInput, categories, accounts, owners, onClassified]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      // Microphone access denied
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) {
      return;
    }

    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setIsRecording(false);
        setIsTranscribing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const file = new File([blob], "recording.webm", {
            type: "audio/webm",
          });
          const formData = new FormData();
          formData.append("audio", file);

          const { classification } = await transcribeAndClassifyVoice(
            formData,
            categories,
            accounts,
            owners
          );
          onClassified(classification, "voice");
        } catch {
          // Error handled by parent
        } finally {
          setIsTranscribing(false);
        }

        // Stop all tracks
        for (const track of mediaRecorder.stream.getTracks()) {
          track.stop();
        }
        resolve();
      };

      mediaRecorder.stop();
    });
  }, [categories, accounts, owners, onClassified]);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    mediaRecorder.onstop = () => {
      for (const track of mediaRecorder.stream.getTracks()) {
        track.stop();
      }
    };
    mediaRecorder.stop();
    setIsRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Textarea
          className="min-h-[60px] resize-none"
          disabled={isClassifying || isRecording || isTranscribing}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleTextClassify();
            }
          }}
          placeholder={t("ai.textPlaceholder")}
          value={textInput}
        />
        <div className="flex flex-col gap-2">
          <Button
            disabled={!textInput.trim() || isClassifying || isRecording}
            onClick={handleTextClassify}
            size="icon"
            variant="outline"
          >
            {isClassifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>

          {isRecording ? (
            <>
              <Button onClick={stopRecording} size="icon" variant="destructive">
                <Square className="h-4 w-4" />
              </Button>
              <Button onClick={cancelRecording} size="icon" variant="ghost">
                <MicOff className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              disabled={isClassifying || isTranscribing}
              onClick={startRecording}
              size="icon"
              variant="outline"
            >
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          {t("ai.recording")} {formatTime(recordingTime)}
        </div>
      )}

      {isTranscribing && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("ai.transcribing")}
        </div>
      )}

      {isClassifying && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t("ai.classifying")}
        </div>
      )}
    </div>
  );
}
