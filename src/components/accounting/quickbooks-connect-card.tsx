"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface QuickBooksConnectCardProps {
  onConnect: () => void;
  isConnecting?: boolean;
  canManage?: boolean;
  isReconnect?: boolean;
}

export function QuickBooksConnectCard({
  onConnect,
  isConnecting,
  canManage = true,
  isReconnect = false,
}: QuickBooksConnectCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-8">
      <div className="w-full max-w-142.5 rounded-2xl border border-[#E4E7EC] bg-white px-8 py-10.5 text-center">
        <Image
          src="/home/quickbooks.svg"
          alt="QuickBooks"
          width={80}
          height={80}
          className="mx-auto h-20 w-20"
        />
        <h2 className="mt-6 text-[2.5rem] font-semibold text-[#222222]">
          QuickBooks Online
        </h2>
        <p className="mt-3 text-base font-medium leading-[145%] text-[#585858]">
          Connect your Helicode activity to QuickBooks Online. Review, manage,
          and sync transactions with ease.
        </p>
        <Button
          className="mt-8"
          variant="primary"
          onClick={onConnect}
          disabled={!canManage || isConnecting}
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image
              src="/home/links.svg"
              alt=""
              width={16}
              height={16}
              className="h-4 w-4"
            />
          )}
          {isReconnect ? "Reconnect" : "Connect"}
        </Button>
        {!canManage && (
          <p className="mt-4 text-sm text-[#667085]">
            You need QuickBooks manage permission to connect this integration.
          </p>
        )}
      </div>
    </div>
  );
}
