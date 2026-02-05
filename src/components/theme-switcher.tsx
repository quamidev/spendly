"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme-switcher");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needed for hydration
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  const currentIcon = (() => {
    switch (theme) {
      case "light":
        return (
          <Sun className="text-muted-foreground" key="light" size={ICON_SIZE} />
        );
      case "dark":
        return (
          <Moon className="text-muted-foreground" key="dark" size={ICON_SIZE} />
        );
      default:
        return (
          <Laptop
            className="text-muted-foreground"
            key="system"
            size={ICON_SIZE}
          />
        );
    }
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          {currentIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-content">
        <DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun className="text-muted-foreground" size={ICON_SIZE} />{" "}
            <span>{t("light")}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon className="text-muted-foreground" size={ICON_SIZE} />{" "}
            <span>{t("dark")}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop className="text-muted-foreground" size={ICON_SIZE} />{" "}
            <span>{t("system")}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
