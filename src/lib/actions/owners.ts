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
