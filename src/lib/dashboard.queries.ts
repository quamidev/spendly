import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface DailyTotal {
  date: string;
  total: number;
}

export interface RecentExpense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string | null;
  owner: string | null;
}

export interface DashboardData {
  currentMonthTotal: number;
  previousMonthTotal: number;
  categoryTotals: CategoryTotal[];
  dailyTotals: DailyTotal[];
  recentExpenses: RecentExpense[];
}

function getMonthRange(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1).toISOString().split("T")[0];
  const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
  return { start, end };
}

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
  uncategorizedLabel = "Sin categoría"
): Promise<DashboardData> {
  const now = new Date();
  const currentMonth = getMonthRange(now);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonth = getMonthRange(prevDate);

  const [currentRes, prevRes, recentRes] = await Promise.all([
    supabase
      .from("expenses")
      .select("date, amount, category_id, categories(name)")
      .eq("created_by", userId)
      .gte("date", currentMonth.start)
      .lte("date", currentMonth.end)
      .order("date", { ascending: true }),

    supabase
      .from("expenses")
      .select("amount")
      .eq("created_by", userId)
      .gte("date", previousMonth.start)
      .lte("date", previousMonth.end),

    supabase
      .from("expenses")
      .select("id, date, amount, description, categories(name), owners(name)")
      .eq("created_by", userId)
      .order("date", { ascending: false })
      .limit(5),
  ]);

  const currentExpenses = currentRes.data ?? [];
  const prevExpenses = prevRes.data ?? [];
  const recent = recentRes.data ?? [];

  const currentMonthTotal = currentExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const previousMonthTotal = prevExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Aggregate by category
  const categoryMap = new Map<string, number>();
  for (const e of currentExpenses) {
    const name =
      (e.categories as unknown as { name: string } | null)?.name ??
      uncategorizedLabel;
    categoryMap.set(name, (categoryMap.get(name) ?? 0) + Number(e.amount));
  }
  const categoryTotals: CategoryTotal[] = [...categoryMap.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  // Aggregate by day (fill missing days with 0)
  const dailyMap = new Map<string, number>();
  for (const e of currentExpenses) {
    dailyMap.set(e.date, (dailyMap.get(e.date) ?? 0) + Number(e.amount));
  }

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const dailyTotals: DailyTotal[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dailyTotals.push({ date, total: dailyMap.get(date) ?? 0 });
  }

  const recentExpenses: RecentExpense[] = recent.map((e) => ({
    id: e.id,
    date: e.date,
    amount: Number(e.amount),
    description: e.description,
    category:
      (e.categories as unknown as { name: string } | null)?.name ?? null,
    owner: (e.owners as unknown as { name: string } | null)?.name ?? null,
  }));

  return {
    currentMonthTotal,
    previousMonthTotal,
    categoryTotals,
    dailyTotals,
    recentExpenses,
  };
}
