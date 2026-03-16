'use client';

import { PageTitleContext } from '@/app/dashboard/layout';
import { ContractsIcon, HomeIcon, WalletIcon } from '@/components/icons/icons';
import {
  Sidebar,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
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
  const { user } = useAuth();

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
        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarProvider>
    </PageTitleContext.Provider>
  );
}
