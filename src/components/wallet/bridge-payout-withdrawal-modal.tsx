"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BridgePayoutWithdrawalForm } from "./bridge-payout-withdrawal-form";

interface BridgePayoutWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forTeam?: boolean;
  walletBalance: number;
  onSuccess?: () => void;
}

export function BridgePayoutWithdrawalModal({
  open,
  onOpenChange,
  forTeam = false,
  walletBalance,
  onSuccess,
}: BridgePayoutWithdrawalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Withdraw to US or EU bank
          </DialogTitle>
          <DialogDescription className="mt-2 text-[#667085]">
            Send USDC from your wallet to a saved USD account or EUR IBAN.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <div className="mt-4">
            <BridgePayoutWithdrawalForm
              forTeam={forTeam}
              walletBalance={walletBalance}
              onSuccess={() => {
                onSuccess?.();
                onOpenChange(false);
              }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
