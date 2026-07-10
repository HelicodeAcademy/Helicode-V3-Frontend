"use client";

import {
  DialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { KYCForm } from "./kyc-form";
import { AlertCircle } from "lucide-react";
import { KYCBridgeVerification } from "./kyc-bridge-verification";
import { useKYCStore } from "@/store/kyc-store";

interface KYCOnboardingModalProps {
  open: boolean;
  onVerificationComplete?: () => void;
  onClose: () => void;
}

// interface KYCOnboardingModalProps {
//   open: boolean;
//   kycStatus?: string;
//   tosStatus?: string;
//   kycLink?: string;
//   tosLink?: string;
//   onVerificationComplete: () => void;
// }

type ModalStep = "company-kyc" | "bridge-verification";

export function KYCOnboardingModal({
  open,
  onVerificationComplete,
  onClose
}: KYCOnboardingModalProps) {
  const { kycStatus } = useKYCStore();

  // Derive step directly from store state to prevent flashing
  // Show bridge verification if kycLink or tost exist from company KYC

  const step: ModalStep =
    kycStatus?.kycLink && kycStatus?.companyKycStatus === "submitted"
      ? "bridge-verification"
      : "company-kyc";

  const handleBridgeVerificationComplete = () => {
    onVerificationComplete?.();
  };

  return (
    // <Dialog open={open} onOpenChange={() => {}}> // This is a hack to prevent the dialog from closing but we want to close it for now
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        // showCloseButton={false}
      >
        {step === "company-kyc" && (
          <>
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#101828]">
                  Company Information
                </DialogTitle>
                <DialogDescription className="text-[#667085] mt-2">
                  {/* We need to verify your information before you can access all
                  features. This is a one-time process. */}
                  Let&apos;s start by collecting your company details. This
                  helps us verify your business information.
                </DialogDescription>
              </DialogHeader>

              {/* Warning Banner */}
              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400E]">
                  {/* You must complete KYC verification to continue using the
                  platform. This won&apos;t take long. */}
                  This is Stage 1 of 2. After submitting your company details,
                  you&apos;ll proceed to identity verification.
                </p>
              </div>

              <div className="mt-6">
                <KYCForm onSuccess={() => {}} />
              </div>
            </>
          </>
        )}

        {step === "bridge-verification" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#101828]">
                Complete Verification
              </DialogTitle>
              <DialogDescription className="text-[#667085] mt-2">
                We need you to complete verification through our partner. Click
                the links below to proceed.
              </DialogDescription>
            </DialogHeader>

            <KYCBridgeVerification
              onVerificationComplete={handleBridgeVerificationComplete}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
