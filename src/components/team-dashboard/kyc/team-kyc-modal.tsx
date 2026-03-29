"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { TeamKYCForm } from "./team-kyc-form";

interface TeamKYCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeamKYCModal({
  open,
  onOpenChange,
  onSuccess,
}: TeamKYCModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Complete KYC Verification
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            To access full features and process withdrawals, please complete
            your Know Your Customer (KYC) verification.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <TeamKYCForm
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
          />
        </div>

        <p className="text-xs text-[#667085] mt-4 text-center">
          Your information is secure and will be used only for verification
          purposes.
        </p>
      </DialogContent>
    </Dialog>
  );
}
