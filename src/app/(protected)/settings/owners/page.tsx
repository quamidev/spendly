import { AppHeader } from "@/components/layout/app-header";
import { OwnerList } from "@/components/settings/owner-list";
import { getOwners } from "@/lib/actions/owners";

export default async function OwnersPage() {
  const owners = await getOwners();

  return (
    <>
      <AppHeader title="Responsables" />
      <div className="flex-1 p-6">
        <OwnerList owners={owners} />
      </div>
    </>
  );
}
