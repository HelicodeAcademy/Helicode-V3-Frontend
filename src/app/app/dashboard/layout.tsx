"use client";

import type React from "react";
import Image from "next/image";
import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/access/protected-route";
import { useAuth } from "@/hooks/useAuth";

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
import { LogOut, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { TransactionsIcon } from "@/components/icons/icons";
import {
  SidebarAccountingIcon,
  SidebarCreditCardIcon,
  SidebarEarnIcon,
  SidebarHiringIcon,
  SidebarHomeIcon,
  SidebarPayrollIcon,
  SidebarSettingsIcon,
  SidebarTeamIcon,
} from "@/components/icons/sidebar-icons";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useKYCStore } from "@/store/kyc-store";
import { getKYCStatus } from "@/lib/kyc-service";
import { getCompanyDetails } from "@/lib/company-details";
import { getWalletAddress } from "@/lib/wallet-service";
import { useWalletStore } from "@/store/wallet-store";
// import { NotificationPopover } from "@/components/ui/notification-popover";

export const PageTitleContext = createContext<{
  title: string | null;
  setTitle: (title: string) => void;
}>({
  title: null,
  setTitle: () => {},
});

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

const primaryNav: NavItem[] = [
  { icon: SidebarHomeIcon, label: "Home", href: "/dashboard" },
  { icon: SidebarTeamIcon, label: "Team", href: "/dashboard/team" },
  {
    icon: TransactionsIcon,
    label: "Transactions",
    href: "/dashboard/transactions",
  },
];

const companyNav: NavItem[] = [
  { icon: SidebarPayrollIcon, label: "Payroll", href: "/dashboard/payroll" },
  // { icon: SidebarPayslipIcon, label: "Payslips", href: "/dashboard/payslips" },
  // { icon: SidebarAnalyticsIcon, label: "Reports", href: "/dashboard/reports" },
  { icon: SidebarHiringIcon, label: "Hiring", href: "/dashboard/hiring" },
  // { icon: FolderOpen, label: "Pay Inputs", href: "/dashboard/pay-inputs" },
];

const treasuryNav: NavItem[] = [
  {
    icon: SidebarAccountingIcon,
    label: "Accounting",
    href: "/dashboard/accounting",
  },
  { icon: SidebarEarnIcon, label: "Earn", href: "/dashboard/earn" },
  { icon: SidebarCreditCardIcon, label: "Cards", href: "/dashboard/cards" },
];

const settingsNav: NavItem[] = [
  { icon: SidebarSettingsIcon, label: "Settings", href: "/dashboard/settings" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/setup-account")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title?: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="space-y-1">
      {title && (
        <p className="px-4.5 pt-4 pb-1 text-[11px] font-medium uppercase tracking-wide text-[#98A2B3]">
          {title}
        </p>
      )}
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(pathname, item.href);
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.label}
                className={`text-sm font-medium leading-[145%] px-4.5 py-3 h-11 ${
                  isActive ? "text-[#0052FF] bg-[#0052FF1A]!" : "text-[#0F112A]"
                }`}
              >
                <Link href={item.href} className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-[#0052FF]" : "text-[#585858]"
                    }`}
                  />
                  <span
                    className={
                      isActive ? "text-[#0052FF] mt-1" : "text-[#585858] mt-1"
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
    </div>
  );
}

function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { walletData, setWalletData } = useWalletStore();
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const [company, wallet] = await Promise.all([
          getCompanyDetails(),
          getWalletAddress(),
        ]);
        setCompanyName(company.name);
        setWalletData(wallet);
      } catch (error) {
        console.error("Failed to load sidebar company data", error);
      }
    };
    void load();
  }, [setWalletData]);

  const companyInitial = companyName.trim().charAt(0).toUpperCase() || "H";
  const balance = walletData?.balance ?? 0;

  return (
    <Sidebar className="w-64 border-r border-[#eaeaea]">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="h-10 w-10 rounded-lg bg-[#D0D5DD] flex items-center justify-center shrink-0">
            <span className="text-white text-base font-semibold">
              {companyInitial}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#101828] truncate">
              {companyName || "Your company"}
            </p>
            <p className="text-xs text-[#98A2B3]">${balance.toFixed(2)}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 pb-4">
        <NavSection items={primaryNav} pathname={pathname} />
        <NavSection title="Company" items={companyNav} pathname={pathname} />
        <NavSection title="Treasury" items={treasuryNav} pathname={pathname} />
        <NavSection title="Settings" items={settingsNav} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg p-2 border-t border-[#E4E7EC]">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarFallback className="bg-[#FFED94] text-[#8F3E19] text-sm font-bold">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#000000] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-[#B5B5B5] truncate">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  const { logout } = useAuth();
  const { setKYCStatus } = useKYCStore();
  const inactivityTimerRef = useRef<number | null>(null);

  const INACTIVITY_LIMIT = 20 * 60 * 1000;

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      toast.error("Session expired due to inactivity. Logging out...");
      logout();
    }, INACTIVITY_LIMIT);
  }, [INACTIVITY_LIMIT, logout]);

  // Fetch KYC status on layout mount to ensure it's available for all dashboard pages
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const data = await getKYCStatus();
        setKYCStatus(data);
      } catch (error) {
        console.error("Failed to fetch KYC status", error);
      }
    };

    fetchKycStatus();
  }, [setKYCStatus]);

  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      resetInactivityTimer();
    };

    const activityEvents = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
      "mousemove",
      "pointerdown",
      "wheel",
    ];

    resetInactivityTimer();

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleActivity);

    return () => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }

      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleActivity);
    };
  }, [INACTIVITY_LIMIT, logout, resetInactivityTimer]);

  return (
    <ProtectedRoute>
      <PageTitleContext.Provider
        value={{ title: pageTitle, setTitle: setPageTitle }}
      >
        <SidebarProvider>
          <DashboardSidebar />
          <SidebarInset>
            <header className="flex h-16 items-center justify-between bg-[#F9FAFB] px-6">
              <h1 className="text-2xl font-bold text-[#444444]">
                {pageTitle || "Dashboard"}
              </h1>
              <div className="flex items-center border border-[#D2D2D2] rounded-[40px] px-3 py-1">
                {/* <NotificationPopover /> */}

                <a
                  href="https://chat.whatsapp.com/Jg4apR4zKTiKo07cYGBwYG?mode=gi_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Image
                      src="/header/nrk_help.svg"
                      alt="Help"
                      width={20}
                      height={20}
                      style={{ width: "auto", height: "auto" }}
                    />
                  </Button>
                </a>
              </div>
            </header>
            <main className="flex-1 bg-[#F9FAFB]">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </PageTitleContext.Provider>
      <Toaster position="top-right" />
    </ProtectedRoute>
  );
}
