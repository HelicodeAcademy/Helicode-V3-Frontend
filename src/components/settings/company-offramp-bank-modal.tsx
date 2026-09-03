"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyOfframpBankForm } from "./company-offramp-bank-form";

interface CompanyOfframpBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyOfframpBankModal({
  open,
  onOpenChange,
  onSuccess,
}: CompanyOfframpBankModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Add bank details
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Add your bank account details for local payout processing.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CompanyOfframpBankForm
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
