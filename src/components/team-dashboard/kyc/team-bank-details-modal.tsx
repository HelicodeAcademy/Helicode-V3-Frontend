"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TeamBankDetailsForm } from "./team-bank-details-form";

interface TeamBankDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeamBankDetailsModal({
  open,
  onOpenChange,
  onSuccess,
}: TeamBankDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Add Bank Details
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Add your bank account details for payout processing. Ensure all
            information is accurate.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <TeamBankDetailsForm
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
          />
        </div>

        <p className="text-xs text-[#667085] mt-4 text-center">
          Your bank details are encrypted and stored securely.
        </p>
      </DialogContent>
    </Dialog>
  );
}
