"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = React.ComponentProps<typeof Button>;

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <Button onClick={logout} {...props}>
      {children ?? "Logout"}
    </Button>
  );
}
