import { getTranslations } from "next-intl/server";
import { QuamiLogo } from "@/components/quami-logo";

export async function FooterSection() {
  const t = await getTranslations("Landing");

  return (
    <footer className="flex flex-col items-center gap-0.5 border-border border-t py-6 text-center">
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
  );
}
