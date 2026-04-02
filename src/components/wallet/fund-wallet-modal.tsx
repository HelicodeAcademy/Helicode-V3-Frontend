"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCrypto: () => void;
  onSelectCard: () => void;
}

export function FundWalletModal({
  open,
  onOpenChange,
  onSelectCrypto,
  onSelectCard,
}: FundWalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#000000]">
            Fund Payroll Wallet
          </DialogTitle>
          <p className="text-sm text-[#0F112A] mt-1">
            Add funds now to ensure timely payments to your team.
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

          {/* Fund with Bank Transfer */}
          <button
            onClick={onSelectCard}
            className="w-full flex cursor-pointer items-center gap-2 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
          >
            <Image src="/wallet/bank.svg" alt="bank" width={24} height={24} />
            <span className="text-[#000000] font-medium">
              Fund with bank transfer
            </span>
          </button>

          <button
            onClick={onSelectCard}
            className="w-full cursor-not-allowed flex items-center gap-2 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
            disabled
          >
            <Image
              src="/wallet/credit-card.svg"
              alt="bank"
              width={24}
              height={24}
            />
            <span className="text-[#000000] font-medium">Fund with card</span>{" "}
            <span className="text-[#0052FF] font-medium text-xxs bg-[#E3ECFF] px-2 py-1 rounded-full ml-3">
              (coming soon)
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
