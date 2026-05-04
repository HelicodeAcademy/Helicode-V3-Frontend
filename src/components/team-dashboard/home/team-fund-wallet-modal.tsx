"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface TeamFundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCrypto: () => void;
  onSelectCard: () => void;
}

export function TeamFundWalletModal({
  open,
  onOpenChange,
  onSelectCrypto,
  // onSelectCard,
}: TeamFundWalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#000000]">
            Fund Wallet
          </DialogTitle>
          <p className="text-sm text-[#0F112A] mt-1">
            Choose a funding method to add funds to your wallet
          </p>
        </DialogHeader>

        <hr className="bg-[#E4E7EC] my-3" />

        <div className="space-y-3">
          {/* Fund with Stablecoin */}
          <button
            onClick={onSelectCrypto}
            className="w-full flex items-center cursor-pointer gap-2 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
          >
            <Image
              src="/wallet/Coin.svg"
              alt="coin"
              width={25.57}
              height={19.49}
            />
            <span className="text-[#000000] font-medium">Fund with crypto</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
