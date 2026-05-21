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
  kycStatus?: string;
  tosStatus?: string;
  kycLink?: string;
  tosLink?: string;
  onVerificationComplete: () => void;
}

type ModalStep = "kyc-form" | "bridge-verification";

export function KYCOnboardingModal({
  open,
  onVerificationComplete,
}: KYCOnboardingModalProps) {
  const { kycStatus } = useKYCStore();

  const step: ModalStep =
    kycStatus?.kycLink || kycStatus?.tosLink
      ? "bridge-verification"
      : "kyc-form";

  const handleBridgeVerificationComplete = () => {
    onVerificationComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        {step === "kyc-form" && (
          <>
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#101828]">
                  Complete Your KYC
                </DialogTitle>
                <DialogDescription className="text-[#667085] mt-2">
                  We need to verify your information before you can access all
                  features. This is a one-time process.
                </DialogDescription>
              </DialogHeader>

              {/* Warning Banner */}
              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <p className="text-sm text-[#92400E]">
                  You must complete KYC verification to continue using the
                  platform. This won&apos;t take long.
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
