"use server";

import OpenAI from "openai";
import type {
  Account,
  Category,
  ClassifyExpenseResult,
  Owner,
} from "@/lib/types";
import { classifyExpense } from "./ai";

const openai = new OpenAI();

export async function transcribeAndClassifyVoice(
  formData: FormData,
  categories: Category[],
  accounts: Account[],
  owners: Owner[]
): Promise<{ transcript: string; classification: ClassifyExpenseResult }> {
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    throw new Error("No audio file provided");
  }

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "es",
  });

  const transcript = transcription.text;
  const classification = await classifyExpense(
    transcript,
    categories,
    accounts,
    owners
  );

  return { transcript, classification };
}
