"use client";
import { ContractsIcon, HomeIcon } from "@/components/icons/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ChevronDown, LogOut, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, createContext } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { TeamProtectedRoute } from "@/components/team-dashboard/access/protected-route";
import { useTeamAuth } from "@/hooks/useTeamAuth";
import { useTeamAuthStore } from "@/store/team/team-auth-store";

export const TeamPageTitleContext = createContext<{
  title: string | null;
  setTitle: (title: string) => void;
}>({
  title: null,
  setTitle: () => {},
});

const menuItems: Array<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}> = [
  { icon: HomeIcon, label: "Home", href: "/team/dashboard" },
  // { icon: WalletIcon, label: "Wallet", href: "/team/dashboard/wallet" },
  {
    icon: ContractsIcon,
    label: "Contracts",
    href: "/team/dashboard/contract",
  },
];

function TeamDashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useTeamAuth();
  const router = useRouter();
  const { companies, selectedCompanyId, setSelectedCompany } =
    useTeamAuthStore();

  const currentCompany = companies.find(
    (c) => c.companyId === selectedCompanyId,
  );

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    router.push("/team/dashboard");
  };

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

      {/* Company Selector */}
      <div className="px-4 py-2 mb-4">
        {companies.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-[#d0d5dd] bg-white hover:bg-[#f9fafb]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded bg-[#0166f4] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {currentCompany?.companyName?.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[#101828] truncate">
                    {currentCompany?.companyName}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-[#667085] shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.companyId}
                  onClick={() => handleSelectCompany(company.companyId)}
                  className={
                    selectedCompanyId === company.companyId
                      ? "bg-[#eff4ff]"
                      : ""
                  }
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-6 w-6 rounded bg-[#0166f4] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {company.companyName?.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#101828]">
                        {company.companyName}
                      </p>
                      <p className="text-xs text-[#667085]">{company.status}</p>
                    </div>
                    {selectedCompanyId === company.companyId && (
                      <div className="h-2 w-2 rounded-full bg-[#0166f4] shrink-0" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f9fafb] border border-[#d0d5dd]">
            <div className="h-6 w-6 rounded bg-[#0166f4] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentCompany?.companyName?.substring(0, 1).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-[#101828] truncate">
              {currentCompany?.companyName}
            </span>
          </div>
        )}
      </div>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/team/dashboard"
                ? pathname === "/team/dashboard"
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
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium text-[#000000] truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-[#B5B5B5] truncate">{user?.email}</p>
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

export default function TeamDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const { user } = useTeamAuth();

  return (
    <TeamProtectedRoute>
      <TeamPageTitleContext.Provider
        value={{ title: pageTitle, setTitle: setPageTitle }}
      >
        <SidebarProvider>
          <TeamDashboardSidebar />
          <SidebarInset>
            <header className="flex h-16 items-center justify-between bg-[#F9FAFB] px-6">
              <h1 className="text-2xl font-bold text-[#444444]">
                Welcome back, {user?.firstName}
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
                    style={{ width: "auto", height: "auto" }}
                  />
                </Button>
              </div>
            </header>
            <main className="flex-1 bg-[#F9FAFB]">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster position="top-right" />
      </TeamPageTitleContext.Provider>
    </TeamProtectedRoute>
  );
}
