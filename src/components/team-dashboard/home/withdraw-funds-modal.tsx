"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface TalentWithdrawFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCrypto: () => void;
  onSelectCard?: () => void;
  showLocalOption?: boolean;
}

export function TalentWithdrawFundsModal({
  open,
  onOpenChange,
  onSelectCrypto,
  onSelectCard,
  showLocalOption = true,
}: TalentWithdrawFundsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#000000]">
            Withdraw Funds
          </DialogTitle>
          <p className="text-sm text-[#0F112A] mt-1">
            Move money from your balance to any of your accounts instantly.
          </p>
        </DialogHeader>

        <hr className="bg-[#E4E7EC] my-3" />

        <div className="space-y-3">
          <button
            onClick={onSelectCrypto}
            className="w-full cursor-pointer flex items-center gap-2 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
          >
            <Image
              src="/wallet/Coin.svg"
              alt="coin"
              width={25.57}
              height={19.49}
            />
            <span className="text-[#000000] font-normal">
              Withdraw to crypto wallet
            </span>
          </button>

          {showLocalOption && (
            <button
              onClick={onSelectCard}
              className="w-full flex cursor-pointer items-center gap-2 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
            >
              <Image src="/wallet/bank.svg" alt="bank" width={24} height={24} />
              <span className="text-[#000000] font-normal">
                Withdraw to local account
              </span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
