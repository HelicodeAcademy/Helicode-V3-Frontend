"use client";

import { BankDetailsResponse } from "@/lib/team/team-kyc-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, Clock } from "lucide-react";

interface TeamBankVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankDetails: BankDetailsResponse | null;
  kycStatus?: "not_started" | "pending" | "approved" | "rejected";
  tosStatus?: "not_started" | "pending" | "approved" | "rejected";
}

export function TeamBankVerificationModal({
  open,
  onOpenChange,
  bankDetails,
  kycStatus = "not_started",
  tosStatus = "not_started",
}: TeamBankVerificationModalProps) {
  if (!bankDetails) return null;

  const kycCompleted = kycStatus === "approved";
  const tosCompleted = tosStatus === "approved";
  const allCompleted = kycCompleted && tosCompleted;

  const handleOpenLink = (url?: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Bank Verification Required
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Your bank details have been saved successfully. To complete the
            setup, please verify your identity.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Bank Details Summary */}
          <div className="bg-[#F9FAFB] border border-[#EAECF0] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#344054] mb-3">
              Bank Details Saved
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#667085]">Bank Name:</span>
                <span className="text-[#101828] font-medium">
                  {bankDetails?.bankPayout?.bankName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Account Name:</span>
                <span className="text-[#101828] font-medium">
                  {bankDetails.bankPayout?.accountName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Account Number:</span>
                <span className="text-[#101828] font-medium">
                  {bankDetails?.bankPayout?.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-3">
            {/* KYC Verification */}
            <div
              className={`border rounded-lg p-4 ${kycCompleted ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-white border-[#D0D5DD]"}`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  {kycCompleted ? (
                    <CheckCircle className="h-5 w-5 text-[#16A34A]" />
                  ) : (
                    <Clock className="h-5 w-5 text-[#F59E0B]" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#101828] mb-1">
                    KYC Verification
                  </h4>
                  <p className="text-sm text-[#667085] mb-3">
                    {kycCompleted
                      ? "Your identity has been verified"
                      : "Verify your identity to proceed"}
                  </p>
                  {!kycCompleted && bankDetails.bridgeKyc?.kycLink && (
                    <Button
                      onClick={() =>
                        handleOpenLink(bankDetails.bridgeKyc.kycLink)
                      }
                      className="bg-[#0084FD] text-white hover:bg-[#0084FD]/90"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Complete KYC Verification
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div
              className={`border rounded-lg p-4 ${tosCompleted ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-white border-[#D0D5DD]"}`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  {tosCompleted ? (
                    <CheckCircle className="h-5 w-5 text-[#16A34A]" />
                  ) : (
                    <Clock className="h-5 w-5 text-[#F59E0B]" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#101828] mb-1">
                    Terms of Service
                  </h4>
                  <p className="text-sm text-[#667085] mb-3">
                    {tosCompleted
                      ? "You have accepted the terms"
                      : "Accept the terms of service to continue"}
                  </p>
                  {!tosCompleted && bankDetails.bridgeKyc?.tosLink && (
                    <Button
                      onClick={() =>
                        handleOpenLink(bankDetails.bridgeKyc.tosLink)
                      }
                      className="bg-[#0084FD] text-white hover:bg-[#0084FD]/90"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Accept Terms & Conditions
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          {allCompleted && (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-4">
              <p className="text-sm text-[#065F46] font-medium">
                All verifications completed! Your bank account is now active.
              </p>
            </div>
          )}

          {/* Info Text */}
          <p className="text-xs text-[#667085] text-center pt-2">
            You can close this window once you&apos;ve completed the
            verification steps. Your status will be updated automatically.
          </p>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className=" bg-[#0084FD] text-white hover:bg-[#0084FD]/90"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
