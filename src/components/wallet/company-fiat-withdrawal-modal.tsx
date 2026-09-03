"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyFiatWithdrawalForm } from "./company-fiat-withdrawal-form";

interface CompanyFiatWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyFiatWithdrawalModal({
  open,
  onOpenChange,
  onSuccess,
}: CompanyFiatWithdrawalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Withdraw to local account
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Withdraw funds from your company wallet to your registered bank
            account in local currency.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <CompanyFiatWithdrawalForm
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
