import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
