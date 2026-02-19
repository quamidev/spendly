"use server";

import { createClient } from "@/lib/supabase/server";
import type { Owner } from "@/lib/types";

export async function getActiveOwners(): Promise<Owner[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data as Owner[]) ?? [];
}

export async function getOwners(): Promise<Owner[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data as Owner[]) ?? [];
}

export async function createOwner(input: {
  name: string;
  color_tag: string;
}): Promise<Owner | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("owners")
    .insert({
      name: input.name,
      color_tag: input.color_tag,
      user_id: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return data as Owner;
}

export async function updateOwner(
  id: string,
  input: {
    name?: string;
    color_tag?: string;
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
    .from("owners")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteOwner(
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
    .from("owners")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
