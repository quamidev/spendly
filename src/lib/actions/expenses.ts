"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  ExpenseFilters,
  ExpenseSource,
  ExpenseWithRelations,
} from "@/lib/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/types";

const EXPENSE_SELECT =
  "*, categories(name), accounts(name, account_type), owners(name, color_tag)";

export async function getExpenses(filters: ExpenseFilters = {}): Promise<{
  data: ExpenseWithRelations[];
  count: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], count: 0 };
  }

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT, { count: "exact" })
    .eq("created_by", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters.ownerId) {
    query = query.eq("owner_id", filters.ownerId);
  }
  if (filters.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("date", filters.dateTo);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data as unknown as ExpenseWithRelations[]) ?? [],
    count: count ?? 0,
  };
}

export async function getExpenseById(
  id: string
): Promise<ExpenseWithRelations | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("id", id)
    .eq("created_by", user.id)
    .single();

  if (error) {
    return null;
  }

  return data as unknown as ExpenseWithRelations;
}

interface CreateExpenseInput {
  date: string;
  amount: number;
  currency: string;
  description: string;
  category_id?: string | null;
  owner_id?: string | null;
  account_id?: string | null;
  notes?: string | null;
}

export async function createExpense(
  input: CreateExpenseInput,
  source: ExpenseSource = "manual"
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...input,
      source,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function updateExpense(
  id: string,
  input: Partial<CreateExpenseInput>
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("expenses")
    .update(input)
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}
