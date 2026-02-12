import { Plus } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ExpenseList } from "@/components/expenses/expense-list";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { getActiveAccounts } from "@/lib/actions/accounts";
import { getActiveCategories } from "@/lib/actions/categories";
import { getExpenses } from "@/lib/actions/expenses";
import { getActiveOwners } from "@/lib/actions/owners";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExpensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("Expenses");

  const page = Number(params.page) || 1;
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;
  const accountId =
    typeof params.accountId === "string" ? params.accountId : undefined;
  const ownerId =
    typeof params.ownerId === "string" ? params.ownerId : undefined;

  const [{ data: expenses, count }, categories, accounts, owners] =
    await Promise.all([
      getExpenses({ page, categoryId, accountId, ownerId }),
      getActiveCategories(),
      getActiveAccounts(),
      getActiveOwners(),
    ]);

  return (
    <>
      <AppHeader title={t("pageTitle")}>
        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("newExpense")}
          </Link>
        </Button>
      </AppHeader>

      <ExpenseList
        accounts={accounts}
        categories={categories}
        currentPage={page}
        expenses={expenses}
        filters={{ categoryId, accountId, ownerId }}
        owners={owners}
        totalCount={count}
      />
    </>
  );
}
