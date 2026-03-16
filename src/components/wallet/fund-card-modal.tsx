"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useWalletStore } from "@/store/wallet-store";
import { getWalletAddress } from "@/lib/wallet-service";
import toast from "react-hot-toast";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
interface FundCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FundCardModal({ open, onOpenChange }: FundCardModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { walletData, setWalletData, setError } = useWalletStore();

  useEffect(() => {
    if (open && !walletData) {
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, walletData]);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getWalletAddress();
      setWalletData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch wallet details";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("KYC status error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (value: string | undefined, index: number) => {
    navigator.clipboard.writeText(value || "");
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const hasKYCApproved = walletData?.virtualAccount?.fiatDepositInstructions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-96.75">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#101828]">
            Fund with bank transfer
          </DialogTitle>
          <p className="text-xs text-[#9E9E9E] mt-2">
            Money sent to these details will be converted to{" "}
            <span className="text-[#0052FF]">digital dollars</span> and added to
            your Helicode Balance.
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin w-4 h-4" />
          </div>
        ) : !hasKYCApproved ? (
          <div>
            <div className="flex gap-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 mt-2">
              <AlertCircle className="h-5 w-5 text-[#dc2626] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-[#dc2626] text-sm">
                  Complete KYC First
                </h3>
                <p className="text-sm text-[#991b1b] mt-1">
                  You need to complete your KYC verification before you can
                  receive funds.
                </p>
              </div>
            </div>
            <Link href="/dashboard/setup-account">
              <Button className="mt-10">Complete KYC Now</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Fee and Time Info */}
            <div className="flex gap-3.5 mt-4 pb-4">
              <div className="flex items-center gap-2 bg-[#F1F5FF] px-2 py-1 rounded-sm">
                <Image
                  src="/wallet/coins-02.svg"
                  alt="coins"
                  width={14}
                  height={14}
                />
                <span className="text-sm text-[#0052FF] font-medium mt-1">
                  0.1% fee
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#F1F5FF] px-2 py-1 rounded-sm">
                <Image
                  src="/wallet/clock-01.svg"
                  alt="coins"
                  width={14}
                  height={14}
                  className=""
                />
                <span className="text-sm text-[#0052FF] font-medium mt-1">
                  2 min
                </span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-2">
              <div className="bg-[#F6F6F6] rounded-sm p-3">
                <label className="text-sm text-[#979CA6] block mb-1">
                  Currency
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-[#000000] font-medium">USD</p>
                </div>
              </div>

              <div className="bg-[#F6F6F6] rounded-sm p-3">
                <label className="text-sm text-[#979CA6] block mb-1">
                  Bank Name
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-[#000000] font-medium">
                    {
                      walletData.virtualAccount.fiatDepositInstructions
                        ?.bank_name
                    }
                  </p>

                  <button
                    onClick={() =>
                      handleCopy(
                        walletData.virtualAccount.fiatDepositInstructions
                          ?.bank_name,
                        0,
                      )
                    }
                    className="text-[#667085] hover:text-[#0166f4] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === 0 ? (
                      <span className="text-xs text-green-600 font-medium">
                        Copied
                      </span>
                    ) : (
                      <Image
                        src="/wallet/copy.svg"
                        alt="copy"
                        width={16}
                        height={16}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[#F6F6F6] rounded-sm p-3">
                <label className="text-sm text-[#979CA6] block mb-1">
                  Account Number
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-[#000000] font-medium">
                    {
                      walletData.virtualAccount.fiatDepositInstructions
                        ?.account_number
                    }
                  </p>

                  <button
                    onClick={() =>
                      handleCopy(
                        walletData.virtualAccount.fiatDepositInstructions
                          ?.account_number,
                        1,
                      )
                    }
                    className="text-[#667085] hover:text-[#0166f4] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === 1 ? (
                      <span className="text-xs text-green-600 font-medium">
                        Copied
                      </span>
                    ) : (
                      <Image
                        src="/wallet/copy.svg"
                        alt="copy"
                        width={16}
                        height={16}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[#F6F6F6] rounded-sm p-3">
                <label className="text-sm text-[#979CA6] block mb-1">
                  Bank Address
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-[#000000] font-medium">
                    {
                      walletData.virtualAccount.fiatDepositInstructions
                        ?.bank_address
                    }
                  </p>

                  <button
                    onClick={() =>
                      handleCopy(
                        walletData.virtualAccount.fiatDepositInstructions
                          ?.bank_address,
                        2,
                      )
                    }
                    className="text-[#667085] hover:text-[#0166f4] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === 2 ? (
                      <span className="text-xs text-green-600 font-medium">
                        Copied
                      </span>
                    ) : (
                      <Image
                        src="/wallet/copy.svg"
                        alt="copy"
                        width={16}
                        height={16}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[#F6F6F6] rounded-sm p-3">
                <label className="text-sm text-[#979CA6] block mb-1">
                  Beneficiary Name
                </label>
                <div className="flex items-center justify-between">
                  <p className="text-[#000000] font-medium">
                    {
                      walletData.virtualAccount.fiatDepositInstructions
                        ?.beneficiary
                    }
                  </p>
                  <button
                    onClick={() =>
                      handleCopy(
                        walletData.virtualAccount.fiatDepositInstructions
                          ?.beneficiary,
                        3,
                      )
                    }
                    className="text-[#667085] hover:text-[#0166f4] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === 3 ? (
                      <span className="text-xs text-green-600 font-medium">
                        Copied
                      </span>
                    ) : (
                      <Image
                        src="/wallet/copy.svg"
                        alt="copy"
                        width={16}
                        height={16}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
