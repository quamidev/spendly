import { AppHeader } from "@/components/layout/app-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <>
      <AppHeader title="Perfil" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <ProfileForm email={user?.email ?? ""} profile={profile} />
        </div>
      </div>
    </>
  );
}
