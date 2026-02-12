import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { QuamiLogo } from "@/components/quami-logo";
import { SpendlyLogo } from "@/components/spendly-logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const t = await getTranslations("Landing");

  return (
    <div className="flex min-h-svh w-full flex-col bg-linear-to-b from-background to-muted/20">
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="flex flex-col items-center gap-10">
          <SpendlyLogo className="text-5xl md:text-7xl" />

          <Button asChild className="px-8" size="lg">
            <Link href="/auth/login">{t("login")}</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-0.5 py-4 text-center">
        <a href="https://www.quami.dev/" rel="noopener" target="_blank">
          <QuamiLogo className="text-xs" />
        </a>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {t("softwareStudio")}
        </p>
        <p className="text-[9px] text-muted-foreground/50">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
