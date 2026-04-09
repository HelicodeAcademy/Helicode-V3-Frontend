"use client";
import {
  ContractsIcon,
  HomeIcon,
  SettingsIcon,
} from "@/components/icons/icons";
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
  SidebarTrigger,
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
  {
    icon: ContractsIcon,
    label: "Contracts",
    href: "/team/dashboard/contract",
  },
  {
    icon: SettingsIcon,
    label: "Settings",
    href: "/team/dashboard/settings",
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

      <div className="mb-4 px-4 py-2">
        {companies.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-[#d0d5dd] bg-white hover:bg-[#f9fafb]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0166f4] text-xs font-bold text-white">
                    {currentCompany?.companyName?.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="truncate text-sm font-medium text-[#101828]">
                    {currentCompany?.companyName}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#667085]" />
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
                  <div className="flex w-full items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0166f4] text-xs font-bold text-white">
                      {company.companyName?.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#101828]">
                        {company.companyName}
                      </p>
                      <p className="text-xs text-[#667085]">{company.status}</p>
                    </div>
                    {selectedCompanyId === company.companyId && (
                      <div className="h-2 w-2 shrink-0 rounded-full bg-[#0166f4]" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-[#f9fafb] px-3 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#0166f4] text-xs font-bold text-white">
              {currentCompany?.companyName?.substring(0, 1).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium text-[#101828]">
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
                  className={`h-11 px-4.5 py-3 text-sm font-medium leading-[145%] ${
                    isActive
                      ? "bg-[#0052FF1A]! text-[#0052FF]"
                      : "text-[#0F112A]"
                  }`}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3.5 ${
                      isActive ? "text-[#0052FF]" : ""
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-[#0052FF]" : "text-[#00001187]"
                      }`}
                    />
                    <span
                      className={
                        isActive
                          ? "mt-1 text-[#0052FF]"
                          : "mt-1 text-[#00001187]"
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
        <div className="flex items-center gap-3 rounded-lg border-t border-[#E4E7EC] p-2">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-medium text-[#000000]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-sm text-[#B5B5B5]">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
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
            <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 bg-[#F9FAFB] px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-[#444444] sm:text-2xl">
                    Welcome back, {user?.firstName}
                  </h1>
                  {pageTitle ? (
                    <p className="text-sm text-[#667085] md:hidden">
                      {pageTitle}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center rounded-[40px] border border-[#D2D2D2] px-2 py-1 sm:px-3">
                {/* <Button variant="ghost" size="icon">
                  <Image
                    src="/header/notification.svg"
                    alt="Notification"
                    width={20}
                    height={20}
                  />
                </Button> */}
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
