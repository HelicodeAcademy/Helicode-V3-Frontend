"use client";

import type React from "react";
import Image from "next/image";
import {
  Fragment,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ProtectedRoute } from "@/components/auth/access/protected-route";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import { EMPLOYER_LAST_ACTIVITY_KEY } from "@/lib/inactivity-session";

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
import { ChevronDown, LogOut, MoreVertical } from "lucide-react";
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
  SidebarHomeIcon,
  SidebarPayrollIcon,
  SidebarSettingsIcon,
  SidebarTeamIcon,
  SidebarWalletIcon,
} from "@/components/icons/sidebar-icons";
import { LOCAL_ACCOUNTS } from "@/lib/local-accounts";
import { useLocalAccountsStore } from "@/store/local-accounts-store";
import { CurrencyMark } from "@/components/accounts/currency-mark";
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
  {
    icon: SidebarWalletIcon,
    label: "Accounts",
    href: "/dashboard/accounts",
  },
];

const companyNav: NavItem[] = [
  { icon: SidebarPayrollIcon, label: "Payroll", href: "/dashboard/payroll" },
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
  accountsExpanded,
  onAccountsExpandedChange,
}: {
  title?: string;
  items: NavItem[];
  pathname: string;
  accountsExpanded: boolean;
  onAccountsExpandedChange: (expanded: boolean) => void;
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
          const isAccounts = item.href === "/dashboard/accounts";

          return (
            <Fragment key={item.href}>
              <SidebarMenuItem>
                {isAccounts ? (
                  <div
                    className={`flex items-center rounded-md ${
                      isActive ? "bg-[#0052FF1A]" : ""
                    }`}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={`text-sm font-medium leading-[145%] px-4.5 py-3 h-11 flex-1 ${
                        isActive
                          ? "text-[#0052FF] bg-transparent!"
                          : "text-[#0F112A]"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3.5"
                        onClick={() => onAccountsExpandedChange(true)}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? "text-[#0052FF]" : "text-[#585858]"
                          }`}
                        />
                        <span
                          className={
                            isActive
                              ? "text-[#0052FF] mt-1"
                              : "text-[#585858] mt-1"
                          }
                        >
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    <button
                      type="button"
                      aria-label={
                        accountsExpanded
                          ? "Collapse accounts"
                          : "Expand accounts"
                      }
                      aria-expanded={accountsExpanded}
                      onClick={() =>
                        onAccountsExpandedChange(!accountsExpanded)
                      }
                      className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#585858] hover:bg-[#F2F4F7]"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          accountsExpanded ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </button>
                  </div>
                ) : (
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
                      className="flex items-center gap-3.5"
                      onClick={() => onAccountsExpandedChange(false)}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-[#0052FF]" : "text-[#585858]"
                        }`}
                      />
                      <span
                        className={
                          isActive
                            ? "text-[#0052FF] mt-1"
                            : "text-[#585858] mt-1"
                        }
                      >
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              {isAccounts && accountsExpanded && (
                <SidebarMenuItem>
                  <AccountSidebarLinks pathname={pathname} />
                </SidebarMenuItem>
              )}
            </Fragment>
          );
        })}
      </SidebarMenu>
    </div>
  );
}

function AccountSidebarLinks({ pathname }: { pathname: string }) {
  const opened = useLocalAccountsStore((state) => state.opened);
  const accounts = LOCAL_ACCOUNTS.filter((account) =>
    opened.includes(account.code),
  );

  if (accounts.length === 0) return null;

  return (
    <ul className="mt-1 space-y-0.5 pl-8">
      {accounts.map((account) => {
        const href = `/dashboard/accounts/${account.code.toLowerCase()}`;
        const isActive = pathname === href;
        return (
          <li key={account.code}>
            <Link
              href={href}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                isActive
                  ? "bg-[#0052FF1A] text-[#0052FF]"
                  : "text-[#475467] hover:bg-[#F9FAFB]"
              }`}
            >
              <CurrencyMark mark={account.mark} size={16} />
              <span className="min-w-0 flex-1 truncate">
                {account.name.replace("Nigerian ", "")}
              </span>
              {account.lifecycle === "review" && (
                <span className="rounded-full bg-[#FFFAEB] px-1.5 py-0.5 text-[10px] font-medium text-[#B54708]">
                  Review
                </span>
              )}
              <span className="text-xs text-[#98A2B3]">
                {account.sidebarAmount}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { walletData, setWalletData } = useWalletStore();
  const [companyName, setCompanyName] = useState<string>("");
  const [accountsExpanded, setAccountsExpanded] = useState(false);

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
        <NavSection
          items={primaryNav}
          pathname={pathname}
          accountsExpanded={accountsExpanded}
          onAccountsExpandedChange={setAccountsExpanded}
        />
        <NavSection
          title="Company"
          items={companyNav}
          pathname={pathname}
          accountsExpanded={accountsExpanded}
          onAccountsExpandedChange={setAccountsExpanded}
        />
        <NavSection
          title="Treasury"
          items={treasuryNav}
          pathname={pathname}
          accountsExpanded={accountsExpanded}
          onAccountsExpandedChange={setAccountsExpanded}
        />
        <NavSection
          title="Settings"
          items={settingsNav}
          pathname={pathname}
          accountsExpanded={accountsExpanded}
          onAccountsExpandedChange={setAccountsExpanded}
        />
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
  const { logout, isAuthenticated } = useAuth();
  const { setKYCStatus } = useKYCStore();

  const handleInactivityLogout = useCallback(() => {
    toast.error("Session expired due to inactivity. Logging out...");
    logout();
  }, [logout]);

  useInactivityLogout({
    storageKey: EMPLOYER_LAST_ACTIVITY_KEY,
    onLogout: handleInactivityLogout,
    enabled: isAuthenticated,
  });

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
