"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useWalletStore } from "@/store/wallet-store";
import { getWalletAddress } from "@/lib/wallet-service";

interface WalletBalanceCardProps {
  onFundWallet: () => void;
  onWithdraw: () => void;
}

export function WalletBalanceCard({
  onFundWallet,
  onWithdraw,
}: WalletBalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { walletData, setWalletData, setError } = useWalletStore();

  useEffect(() => {
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWalletData = async () => {
    try {
      setError(null);
      const data = await getWalletAddress();
      setWalletData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch wallet balance";
      setError(errorMessage);
      console.error("Wallet fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const balance = walletData?.balance ?? 0;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-white border border-[#F2F2F2] rounded-xl p-6 max-w-134">
        <div>
          <p className="text-[#475367] font-medium mb-4">
            Total Wallet Balance
          </p>
          <div className="flex gap-2 items-center">
            {isLoading ? (
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="flex items-center gap-3">
                <h3 className="text-[2rem] font-bold text-[#1C232D] leading-0">
                  {showBalance ? `${balance.toFixed(2)}` : "••••••"}
                </h3>
              </div>
            )}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#141B34] hover:text-[#667085] transition-colors"
            >
              {showBalance ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <hr className="my-6 bg-[#E4E7EC]" />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onFundWallet}
            className="bg-[#0052FF] transition-colors hover:bg-[#0041c4] flex items-center"
          >
            <Image
              src="/wallet/arrow-narrow-up-right.svg"
              alt="icon"
              width={16}
              height={16}
            />
            <span className="translate-y-px">Fund wallet</span>
          </Button>
          <Button
            onClick={onWithdraw}
            className="bg-white border border-[#0052FF] text-[#0052FF] flex items-center hover:bg-[#f0f4ff] transition-colors"
          >
            <Image
              src="/wallet/arrow-narrow-up-right-blue.svg"
              alt="icon"
              width={16}
              height={16}
            />
            <span className="translate-y-px">Withdraw funds</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
