"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyOfframpKycForm } from "./company-offramp-kyc-form";

interface CompanyOfframpKycModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyOfframpKycModal({
  open,
  onOpenChange,
  onSuccess,
}: CompanyOfframpKycModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Payout KYC
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Complete this verification to enable local bank withdrawals from
            your company wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CompanyOfframpKycForm
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
