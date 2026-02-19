import { AppHeader } from "@/components/layout/app-header";
import { AccountList } from "@/components/settings/account-list";
import { getAccounts } from "@/lib/actions/accounts";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <>
      <AppHeader title="Cuentas" />
      <div className="flex-1 p-6">
        <AccountList accounts={accounts} />
      </div>
    </>
  );
}
