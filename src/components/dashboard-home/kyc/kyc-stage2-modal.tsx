"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KYCStage2Form } from "./kyc-stage2-form";
import { AlertCircle } from "lucide-react";

interface KYCStage2ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function KYCStage2Modal({
  open,
  onOpenChange,
  onSuccess,
}: KYCStage2ModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Complete Your Employer Verification
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            To proceed with this transaction, we need to verify your personal
            information and documents. This is Stage 2 of our KYC process.
          </DialogDescription>
        </DialogHeader>

        {/* Info Banner */}
        <div className="bg-[#DDE8FF] border border-[#A3C7FF] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#0166F4] shrink-0 mt-0.5" />
          <p className="text-sm text-[#0166F4]">
            Your company information has already been verified. Now we just need
            your personal details to complete the process.
          </p>
        </div>

        <div className="mt-6">
          <KYCStage2Form onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
