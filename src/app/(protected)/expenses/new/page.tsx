import { getTranslations } from "next-intl/server";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { AppHeader } from "@/components/layout/app-header";
import { getActiveAccounts } from "@/lib/actions/accounts";
import { getActiveCategories } from "@/lib/actions/categories";
import { getActiveOwners } from "@/lib/actions/owners";

export default async function NewExpensePage() {
  const [t, categories, accounts, owners] = await Promise.all([
    getTranslations("Expenses"),
    getActiveCategories(),
    getActiveAccounts(),
    getActiveOwners(),
  ]);

  return (
    <>
      <AppHeader title={t("newExpense")} />
      <ExpenseForm
        accounts={accounts}
        categories={categories}
        owners={owners}
      />
    </>
  );
}
