import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

interface Props {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!(profile?.onboarding_completed || isOnboarding)) {
    redirect("/onboarding");
  }

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: profile?.full_name ?? "?",
          email: user.email ?? "?",
          image: user.user_metadata?.avatar_url ?? null,
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
