"use server";

import OpenAI from "openai";
import { getTranslations } from "next-intl/server";
import type {
  Account,
  Category,
  ClassifyExpenseResult,
  Owner,
} from "@/lib/types";
import { DEFAULT_CURRENCY } from "@/lib/types";

const openai = new OpenAI();

export interface SuggestedCategory {
  name: string;
  keywords: string[];
  reason: string;
}

export async function suggestCategoriesFromDescription(
  description: string
): Promise<{
  success: boolean;
  data?: SuggestedCategory[];
  error?: string;
}> {
  const t = await getTranslations("Errors");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a financial assistant. Based on the user's description of how they'll use an expense tracking app, suggest relevant expense categories.

Return a JSON object with a "categories" array. Each category should have:
- name: string (category name in Spanish)
- keywords: string[] (2-5 keywords that help identify expenses in this category, in Spanish)
- reason: string (brief explanation in Spanish of why this category is useful for them)

Suggest 5-8 categories that are specific and relevant to their use case.`,
        },
        { role: "user", content: description },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: t("aiNoResponse") };
    }

    const parsed = JSON.parse(content) as { categories: SuggestedCategory[] };
    return { success: true, data: parsed.categories };
  } catch {
    return { success: false, error: t("aiSuggestionFailed") };
  }
}

export async function transcribeAudio(
  base64Audio: string,
  mimeType: string
): Promise<{
  success: boolean;
  data?: { text: string };
  error?: string;
}> {
  const t = await getTranslations("Errors");
  try {
    const buffer = Buffer.from(base64Audio, "base64");
    const extension = mimeType.split("/")[1] ?? "webm";
    const file = new File([buffer], `audio.${extension}`, { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "es",
    });

    return { success: true, data: { text: transcription.text } };
  } catch {
    return { success: false, error: t("aiTranscriptionFailed") };
  }
}

export async function classifyExpense(
  text: string,
  categories: Category[],
  accounts: Account[],
  owners: Owner[]
): Promise<ClassifyExpenseResult> {
  const today = new Date().toISOString().split("T")[0];

  const categoryList = categories
    .map((c) => `${c.id}: ${c.name} (keywords: ${c.keywords.join(", ")})`)
    .join("\n");
  const accountList = accounts
    .map((a) => `${a.id}: ${a.name} (${a.account_type})`)
    .join("\n");
  const ownerList = owners.map((o) => `${o.id}: ${o.name}`).join("\n");

  const systemPrompt = `You are an expense classification assistant. Extract expense details from natural language text.
Today's date is ${today}. Default currency is ${DEFAULT_CURRENCY}.

Available categories:
${categoryList || "None yet"}

Available accounts:
${accountList || "None yet"}

Available owners/responsibles:
${ownerList || "None yet"}

Return a JSON object with these fields:
- amount: number or null if not mentioned
- currency: string (default "${DEFAULT_CURRENCY}")
- date: string in YYYY-MM-DD format or null (use today if "today"/"hoy" is mentioned, yesterday for "yesterday"/"ayer")
- description: string (clean, concise description of the expense)
- suggestedCategoryId: string ID from the list above or null
- suggestedAccountId: string ID from the list above or null
- suggestedOwnerId: string ID from the list above or null
- newCategoryName: string if the expense doesn't match any existing category, suggest a new name, otherwise null
- newAccountName: string if a new account is mentioned, otherwise null
- newOwnerName: string if a new person/owner is mentioned, otherwise null
- confidence: number between 0 and 1

Match categories by keywords and name similarity. Only suggest new names if there's clearly no match.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      amount: null,
      currency: DEFAULT_CURRENCY,
      date: null,
      description: text,
      suggestedCategoryId: null,
      suggestedAccountId: null,
      suggestedOwnerId: null,
      newCategoryName: null,
      newAccountName: null,
      newOwnerName: null,
      confidence: 0,
    };
  }

  const parsed = JSON.parse(content) as ClassifyExpenseResult;
  return {
    amount: parsed.amount ?? null,
    currency: parsed.currency ?? DEFAULT_CURRENCY,
    date: parsed.date ?? null,
    description: parsed.description ?? text,
    suggestedCategoryId: parsed.suggestedCategoryId ?? null,
    suggestedAccountId: parsed.suggestedAccountId ?? null,
    suggestedOwnerId: parsed.suggestedOwnerId ?? null,
    newCategoryName: parsed.newCategoryName ?? null,
    newAccountName: parsed.newAccountName ?? null,
    newOwnerName: parsed.newOwnerName ?? null,
    confidence: parsed.confidence ?? 0,
  };
}
