"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TeamBankDetailsForm } from "./team-bank-details-form";
import { TeamBankVerificationModal } from "./team-bank-verification-modal";
import { BankDetailsResponse } from "@/lib/team/team-kyc-service";
import { useState } from "react";

interface TeamBankDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  kycStatus?: "not_started" | "pending" | "approved" | "rejected";
  tosStatus?: "not_started" | "pending" | "approved" | "rejected";
}

export function TeamBankDetailsModal({
  open,
  onOpenChange,
  onSuccess,
  kycStatus,
  tosStatus,
}: TeamBankDetailsModalProps) {
  const [bankDetails, setBankDetails] = useState<BankDetailsResponse | null>(
    null,
  );
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const handleFormSuccess = (details: BankDetailsResponse) => {
    setBankDetails(details);
    setVerificationModalOpen(true);
  };

  const handleVerificationModalClose = () => {
    setVerificationModalOpen(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <>
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
              // onSuccess={() => {
              //   onSuccess?.();
              //   onOpenChange(false);
              // }}
              onSuccess={handleFormSuccess}
            />
          </div>

          <p className="text-xs text-[#667085] mt-4 text-center">
            Your bank details are encrypted and stored securely.
          </p>
        </DialogContent>
      </Dialog>

      <TeamBankVerificationModal
        open={verificationModalOpen}
        onOpenChange={handleVerificationModalClose}
        bankDetails={bankDetails}
        kycStatus={kycStatus}
        tosStatus={tosStatus}
      />
    </>
  );
}
