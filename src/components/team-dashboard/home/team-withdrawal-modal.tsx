"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamWithdrawalForm } from "./team-withdrawal-form";

interface TeamWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeamWithdrawalModal({
  open,
  onOpenChange,
  onSuccess,
}: TeamWithdrawalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Withdraw Funds
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Withdraw funds from your wallet to your registered bank account in
            local currency.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <TeamWithdrawalForm
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
