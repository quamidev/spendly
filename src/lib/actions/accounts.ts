"use server";

import { createClient } from "@/lib/supabase/server";
import type { Account, AccountType } from "@/lib/types";

export async function getActiveAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data as Account[]) ?? [];
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data as Account[]) ?? [];
}

export async function createAccount(input: {
  name: string;
  account_type: AccountType;
}): Promise<Account | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: input.name,
      account_type: input.account_type,
      user_id: user.id,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return data as Account;
}

export async function updateAccount(
  id: string,
  input: {
    name?: string;
    account_type?: AccountType;
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
    .from("accounts")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteAccount(
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
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
