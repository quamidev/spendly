import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { AppHeader } from "@/components/layout/app-header";
import { getActiveAccounts } from "@/lib/actions/accounts";
import { getActiveCategories } from "@/lib/actions/categories";
import { getExpenseById } from "@/lib/actions/expenses";
import { getActiveOwners } from "@/lib/actions/owners";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: Props) {
  const { id } = await params;

  const [t, expense, categories, accounts, owners] = await Promise.all([
    getTranslations("Expenses"),
    getExpenseById(id),
    getActiveCategories(),
    getActiveAccounts(),
    getActiveOwners(),
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <>
      <AppHeader title={t("editExpense")} />
      <ExpenseForm
        accounts={accounts}
        categories={categories}
        expense={expense}
        owners={owners}
      />
    </>
  );
}
