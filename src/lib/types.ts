// Database row types

export interface Category {
  id: string;
  name: string;
  keywords: string[];
  is_active: boolean;
  user_id: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  account_type: AccountType;
  is_active: boolean;
  user_id: string;
  created_at: string;
}

export interface Owner {
  id: string;
  name: string;
  color_tag: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  category_id: string | null;
  owner_id: string | null;
  account_id: string | null;
  source: ExpenseSource;
  created_by: string;
  import_batch_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface ExpenseWithRelations extends Expense {
  categories: { name: string } | null;
  accounts: { name: string; account_type: AccountType } | null;
  owners: { name: string; color_tag: string } | null;
}

// Enums

export type AccountType =
  | "credit_card"
  | "company_bank"
  | "personal_bank"
  | "cash";

export type ExpenseSource = "manual" | "voice" | "ai_text" | "import";

// AI classification result

export interface ClassifyExpenseResult {
  amount: number | null;
  currency: string;
  date: string | null;
  description: string;
  suggestedCategoryId: string | null;
  suggestedAccountId: string | null;
  suggestedOwnerId: string | null;
  newCategoryName: string | null;
  newAccountName: string | null;
  newOwnerName: string | null;
  confidence: number;
}

// Filter types

export interface ExpenseFilters {
  categoryId?: string;
  accountId?: string;
  ownerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// Constants

export const DEFAULT_CURRENCY = "GTQ";
export const DEFAULT_PAGE_SIZE = 20;

export const OWNER_COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#0d9488",
];
