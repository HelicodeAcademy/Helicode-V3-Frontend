'use client';

import { PageTitleContext } from '@/app/dashboard/layout';
import { ContractsIcon, HomeIcon, WalletIcon } from '@/components/icons/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

const menuItems: Array<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}> = [
  { icon: HomeIcon, label: 'Home', href: '/talent/dashboard' },
  { icon: WalletIcon, label: 'Wallet', href: '/talent/dashboard/wallet' },
  {
    icon: ContractsIcon,
    label: 'Contracts',
    href: '/talent/dashboard/contracts',
  },
];

function TalentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
              item.href === '/talent/dashboard'
                ? pathname === '/talent/dashboard'
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={`text-sm font-medium leading-[145%] px-4.5 py-3 h-11 ${
                    isActive
                      ? 'text-[#0052FF] bg-[#0052FF1A]!'
                      : 'text-[#0F112A]'
                  }`}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center ${isActive ? 'text-[#0052FF] gap-3.5' : 'gap-3.5'}`}
                  >
                    <Icon
                      className={`h-5 w-5  ${isActive ? 'text-[#0052FF]' : 'text-[#00001187]'}`}
                    />
                    <span
                      className={
                        isActive
                          ? 'text-[#0052FF] mt-1'
                          : 'text-[#00001187] mt-1'
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

export default function TalentDashboardLayout({
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
        <TalentSidebar />
        <SidebarInset>
          <header className="flex h-16 items-center justify-between bg-[#F9FAFB] px-6">
            <h1 className="text-2xl font-bold text-[#444444]">
              {pageTitle || 'Dashboard'}
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
                  style={{ width: 'auto', height: 'auto' }}
                />
              </Button>
            </div>
          </header>
          <main className="flex-1 bg-[#F9FAFB]">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-right" />
    </PageTitleContext.Provider>
  );
}
