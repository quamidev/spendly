"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocale } from "@/lib/actions/locale";

const LocaleSwitcher = () => {
  const locale = useLocale();
  const t = useTranslations("lang-switcher");
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      setLocale(newLocale);
    });
  };

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending} size="sm" variant="ghost">
          <Languages className="text-muted-foreground" size={ICON_SIZE} />
          <span className="ml-1 uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-content">
        <DropdownMenuRadioGroup
          onValueChange={handleLocaleChange}
          value={locale}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="es">
            <span>🇪🇸</span>
            <span>{t("es")}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="en">
            <span>🇺🇸</span>
            <span>{t("en")}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { LocaleSwitcher };
