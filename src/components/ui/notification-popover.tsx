'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check } from 'lucide-react';
import Image from 'next/image';

const notifications = [
  {
    id: 1,
    title: 'Payroll processed',
    content: 'Your latest payroll has been processed successfully.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    title: 'New team member added',
    content: 'A new contractor has been added to your team.',
    time: '10 minutes ago',
    read: true,
  },
  {
    id: 3,
    title: 'Document uploaded',
    content: 'Your KYC document has been uploaded successfully.',
    time: '1 hour ago',
    read: true,
  },
];

export function NotificationPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E7EC] bg-white hover:bg-[#F9FAFB]"
          aria-label="Notifications"
        >
          <Image
            src="/header/notification.svg"
            alt="Notifications"
            width={20}
            height={20}
          />
          <span className="sr-only">Notifications</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-125.25 mr-20"
      >
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 rounded-lg p-3 ${
                notification.read ? 'bg-white' : 'bg-[#F0F9FF]'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECF2FF]">
                {notification.read ? (
                  <Check className="h-4 w-4 text-[#0052FF]" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-[#0052FF]" />
                )}
              </div>

              <div className="flex-1">
                <div className="text-[14px] font-semibold text-[#101828]">
                  {notification.title}
                </div>
                <div className="text-[12px] text-[#8A8787]">
                  {notification.content}
                </div>
                <div className="text-xs font-medium text-[#0052FF] mt-1">
                  {notification.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
