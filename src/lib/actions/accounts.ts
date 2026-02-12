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
