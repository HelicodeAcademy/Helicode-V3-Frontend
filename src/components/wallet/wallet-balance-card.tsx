"use client";

import { Button } from "@/components/ui/button";
import { PenLine, ArrowUpRight } from "lucide-react";
import Image from "next/image";

interface WalletBalanceCardProps {
  balance: string;
  onFundWallet: () => void;
  onWithdraw: () => void;
}

export function WalletBalanceCard({
  balance,
  onFundWallet,
  onWithdraw,
}: WalletBalanceCardProps) {
  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-white border border-[#D0D5DD] rounded-3xl p-6 flex items-center justify-between max-w-xl">
        <div>
          <p className="text-[#475367] font-medium mb-4">
            Total Wallet Balance
          </p>
          <p className="text-4xl font-bold text-[#1C232D]">{balance}</p>
        </div>

        <Image
          src="/wallet/wallet.svg"
          alt="icon"
          width={136}
          height={107.37}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onFundWallet}
          className="bg-white text-sm border-[#d0d5dd] text-[#363636] hover:bg-gray-50"
        >
          <Image
            src="/wallet/arrow-narrow-up-right.svg"
            alt="icon"
            width={16}
            height={16}
          />
          Fund wallet
        </Button>
        <Button
          onClick={onWithdraw}
          variant={"primary"}
          className="text-white hover:bg-[#212121]/90"
        >
          <ArrowUpRight className="h-4 w-4" />
          Withdraw funds
        </Button>
      </div>
    </div>
  );
}
