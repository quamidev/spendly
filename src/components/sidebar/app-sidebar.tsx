"use client";

import {
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Send,
  Settings2,
} from "lucide-react";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar");

  const navMain = [
    {
      title: t("dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("expenses"),
      url: "/expenses",
      icon: Receipt,
      isActive: true,
    },
  ];

  const navSettings = [
    {
      title: t("settings"),
      url: "/settings",
      icon: Settings2,
      isActive: true,
      items: [
        { title: t("categories"), url: "/settings/categories" },
        { title: t("accounts"), url: "/settings/accounts" },
        { title: t("responsibles"), url: "/settings/responsibles" },
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

  const user = {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <SpendlyLogo className="text-lg" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
