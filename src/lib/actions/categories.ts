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

export async function getCategories(): Promise<Category[]> {
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

export async function updateCategory(
  id: string,
  input: {
    name?: string;
    keywords?: string[] | null;
    is_active?: boolean;
  }
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCategory(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
