"use client";

import type React from "react";
import Image from "next/image";
import { createContext, useState } from "react";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  HiringIcon,
  PayrollIcon,
  SettingsIcon,
  TeamsIcon,
  TransactionsIcon,
  WalletIcon,
} from "@/components/icons/icons";

export const PageTitleContext = createContext<{
  title: string | null;
  setTitle: (title: string) => void;
}>({
  title: null,
  setTitle: () => {},
});

const menuItems = [
  { icon: HomeIcon, label: "Home", href: "/dashboard" },
  { icon: TeamsIcon, label: "Team", href: "/dashboard/team" },
  {
    icon: TransactionsIcon,
    label: "Transactions",
    href: "/dashboard/transactions",
  },
  { icon: HiringIcon, label: "Hiring", href: "/dashboard/hiring" },
  { icon: WalletIcon, label: "Wallet", href: "/dashboard/wallet" },
  { icon: PayrollIcon, label: "Payroll", href: "/dashboard/payroll" },
  { icon: SettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="w-64 border-r border-[#eaeaea]">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-4">
          <Image
            src="/signup/logo.svg"
            alt="Helicode Logo"
            width={144}
            height={32}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" ||
                  pathname.startsWith("/dashboard/setup-account")
                : pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`text-sm font-medium leading-[145%] px-4.5 py-3 h-11 ${
                    isActive
                      ? "text-[#0052FF] bg-[#0052FF1A]!"
                      : "text-[#0F112A]"
                  }`}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center ${isActive ? "text-[#0052FF] gap-3.5" : "gap-3.5"}`}
                  >
                    <Icon
                      className={`h-5 w-5  ${isActive ? "text-[#0052FF]" : "text-[#00001187]"}`}
                    />
                    <span
                      className={
                        isActive
                          ? "text-[#0052FF] mt-1"
                          : "text-[#00001187] mt-1"
                      }
                    >
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg p-2 border-t border-[#E4E7EC]">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage src="/sidebar/equator.png" />
            <AvatarFallback>AG</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium text-[#000000] truncate">
              Aaron Goh
            </p>
            <p className="text-sm text-[#B5B5B5] truncate">Equator</p>
          </div>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  return (
    <PageTitleContext.Provider
      value={{ title: pageTitle, setTitle: setPageTitle }}
    >
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          {/* removed the border bottom here as it is not needed */}
          <header className="flex h-16 items-center justify-between bg-[#F9FAFB] px-6">
            <h1 className="text-2xl font-bold text-[#444444]">
              {pageTitle || "Dashboard"}
            </h1>
            <div className="flex items-center border border-[#D2D2D2] rounded-[40px] px-3 py-1">
              <Button variant="ghost" size="icon">
                <Image
                  src="/header/notification.svg"
                  alt="Notification"
                  width={20}
                  height={20}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Image
                  src="/header/nrk_help.svg"
                  alt="Help"
                  width={20}
                  height={20}
                />
              </Button>
            </div>
          </header>
          <main className="flex-1 bg-[#F9FAFB]">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </PageTitleContext.Provider>
  );
}
