"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useWalletStore } from "@/store/wallet-store";
import { getWalletAddress } from "@/lib/wallet-service";
import toast from "react-hot-toast";
import { Loader2, AlertCircle } from "lucide-react";

interface FundCryptoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FundCryptoModal({ open, onOpenChange }: FundCryptoModalProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { walletData, setWalletData, setError } = useWalletStore();

  useEffect(() => {
    if (open && !walletData) {
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleCopy = () => {
    const address =
      walletData?.virtualAccount?.cryptoDepositInstructions?.address || " ";
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasKYCApproved =
    walletData?.virtualAccount?.cryptoDepositInstructions?.address;

  const walletAddress =
    walletData?.virtualAccount?.cryptoDepositInstructions?.address;

  const token = walletData?.virtualAccount?.cryptoDepositInstructions?.currency;
  const network = walletData?.virtualAccount?.cryptoDepositInstructions?.rail;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-113.25 gap-0">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-2xl font-medium">
            Fund with Stablecoin
          </DialogTitle>
          <p className="text-sm text-[#0F112A] mt-1">
            Instant transfer from your crypto wallet.
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
            <div className="mt-6">
              <div className="text-[#0052FF] text-xs font-medium bg-[#EFF4FF] p-2 rounded-sm flex items-center gap-2">
                <Image
                  src="/wallet/information-circle.svg"
                  alt="informational circle"
                  width={"16"}
                  height={"16"}
                />
                <span>
                  Use onchain details provided below to receive {token} on{" "}
                  {network}. Only send USDC on Base Network to the Wallet
                  Address
                </span>
              </div>

              {/* Wallet Address */}
              <div className="flex justify-between mt-6">
                <div className="space-y-2">
                  <p className="text-sm">Token</p>
                  <div className="font-medium flex items-center gap-1">
                    <Image
                      src="/wallet/usdc.png"
                      alt="usdc"
                      width={20}
                      height={20}
                    />
                    <span className="translate-y-px">{token}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">Network</p>
                  <div className="font-medium flex items-center gap-1">
                    <Image
                      src="/wallet/base.png"
                      alt="base"
                      width={20}
                      height={20}
                      className="block"
                    />

                    <div className="translate-y-px">{network}</div>
                  </div>
                </div>
              </div>

              {/* Wallet Address Info */}
              <div className="mt-6">
                <h3 className="text-sm mb-2">Wallet Address</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 transition-colors"
                >
                  <span className="text-sm text-black font-medium">
                    {copied ? "Copied!" : walletAddress}
                  </span>

                  <Image
                    src="/wallet/copy-01.svg"
                    alt="copy"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
