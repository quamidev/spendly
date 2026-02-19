"use server";

import { createClient } from "@/lib/supabase/server";

interface UsageEntry {
  date: string;
  requestType: string;
  model: string;
  cost: number;
}

interface RequestTypeStats {
  count: number;
  cost: number;
}

interface CreditsData {
  balance: {
    credits: number;
    formattedCredits: string;
  };
  stats: {
    totalCost: number;
    requestsByType: Record<string, RequestTypeStats>;
    recentUsage: UsageEntry[];
  };
}

export async function getCreditsAndUsage(): Promise<
  { success: true; data: CreditsData } | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits_usd")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const credits = Number(profile?.credits_usd ?? 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: usageLogs, error: usageError } = await supabase
    .from("ai_usage_logs")
    .select("request_type, model, estimated_cost_usd, created_at")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  if (usageError) {
    return { success: false, error: usageError.message };
  }

  const logs = usageLogs ?? [];
  let totalCost = 0;
  const requestsByType: Record<string, RequestTypeStats> = {};
  const recentUsage: UsageEntry[] = [];

  for (const log of logs) {
    const cost = Number(log.estimated_cost_usd ?? 0);
    totalCost += cost;

    const type = log.request_type as string;
    if (!requestsByType[type]) {
      requestsByType[type] = { count: 0, cost: 0 };
    }
    requestsByType[type].count += 1;
    requestsByType[type].cost += cost;

    recentUsage.push({
      date: log.created_at as string,
      requestType: type,
      model: log.model as string,
      cost,
    });
  }

  return {
    success: true,
    data: {
      balance: {
        credits,
        formattedCredits: `$${credits.toFixed(2)}`,
      },
      stats: {
        totalCost,
        requestsByType,
        recentUsage,
      },
    },
  };
}
