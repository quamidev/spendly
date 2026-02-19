"use client";

import {
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Send,
  Settings2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavSettings } from "@/components/sidebar/nav-settings";
import { NavUser } from "@/components/sidebar/nav-user";
import { SpendlyLogo } from "@/components/spendly-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  const navMain = [
    {
      title: t("dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      title: t("expenses"),
      url: "/expenses",
      icon: Receipt,
      isActive: pathname.startsWith("/expenses"),
    },
  ];

  const navSettings = [
    {
      title: t("settings"),
      url: "/settings",
      icon: Settings2,
      isActive: pathname.startsWith("/settings"),
      items: [
        { title: t("categories"), url: "/settings/categories" },
        { title: t("accounts"), url: "/settings/accounts" },
        { title: t("responsibles"), url: "/settings/owners" },
      ],
    },
  ];

  const navSecondary = [
    {
      title: t("support"),
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: t("feedback"),
      url: "#",
      icon: Send,
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <a className="px-2 pt-1 pb-2" href="/dashboard">
          <SpendlyLogo className="text-xl" />
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSettings items={navSettings} />
        <NavSecondary className="mt-auto" items={navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
