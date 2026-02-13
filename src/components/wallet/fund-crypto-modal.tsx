"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";

interface FundCryptoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string;
}

export function FundCryptoModal({
  open,
  onOpenChange,
  walletAddress = "0x27ff9040...9e18e1219386FB7",
}: FundCryptoModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-113.25 gap-0">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-2xl font-medium">
            Fund with Crypto
          </DialogTitle>
          <p className="text-sm text-[#0F112A] mt-1">
            Instant transfer from your crypto wallet.
          </p>
        </DialogHeader>

        <div className="mt-6">
          <div className="text-[#0052FF] text-xs font-medium bg-[#EFF4FF] p-2 rounded-sm flex items-center gap-2">
            <Image
              src="/wallet/information-circle.svg"
              alt="informational circle"
              width={"16"}
              height={"16"}
            />
            <span>
              Use onchain details provided below to receive USDC on BASE. Only
              send USDC on Base Network to the Wallet Address
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
                <span className="translate-y-px">USDC</span>
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

                <div className="translate-y-px">BASE</div>
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

            <Button
              variant="primary"
              size="sm"
              className="mt-6"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Address"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
