"use server";

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data as Category[]) ?? [];
}

export async function createCategory(input: {
  name: string;
  keywords?: string[];
}): Promise<Category | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      keywords: input.keywords ?? [],
      user_id: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return data as Category;
}
