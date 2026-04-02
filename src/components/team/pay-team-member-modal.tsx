"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/store/team-store";

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { paySingleTeamMember } from "@/lib/team-service";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";

interface PayTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}

type PayStep = "pay" | "verification" | "success";

export function PayTeamMemberModal({
  open,
  onOpenChange,
  member,
}: PayTeamMemberModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<PayStep>("pay");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open && member) {
      setStep("pay");
      setAmount(String(member.amount));
      setAmountError("");
      setVerificationError("");
    }
  }, [open, member]);

  const handleContinueToPay = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Enter a valid amount.");
      return;
    }
    setAmountError("");

    // Request verification code before showing verification step
    requestCode();
  };

  const requestCode = async () => {
    setIsSubmitting(true);
    try {
      await requestTransactionVerificationCode("COMPANY_PAY_NOW_MEMBER");
      toast.success("Verification code sent to your email!");
      setStep("verification");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCode = async () => {
    try {
      await requestTransactionVerificationCode("COMPANY_PAY_NOW_MEMBER");
      toast.success("Verification code sent to your email!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleConfirmCode = async (code: string) => {
    if (!member) return;
    setIsSubmitting(true);
    setVerificationError("");
    try {
      await paySingleTeamMember(member.id, code, Number(amount));
      setStep("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.";
      setVerificationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    onOpenChange(false);
    router.push("/dashboard");
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0 overflow-hidden rounded-xl",
          step === "success" ? "sm:max-w-md" : "sm:max-w-sm",
        )}
        showCloseButton={false}
      >
        {/* ── Step: Pay ── */}
        {step === "pay" && (
          <div className="bg-[#F8F8F8]">
            <DialogTitle className="sr-only">Pay</DialogTitle>
            <div className="bg[#f5f5f5] px-5 pt-5 pb-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-semibold text-black">Pay</h2>
                  <p className="text-sm text-[#667085] mt-1.5">
                    Send an instant payout
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                >
                  <X className="h-4 w-4 text-[#101928]" />
                </button>
              </div>

              {/* Recipient card */}
              <div className="bg-white rounded-xl px-4 py-3.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#667085]">Recipient</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#101928]">
                      {member.fullName}
                    </p>

                    <p className="text-xs text-[#667085]">{member.role}</p>
                  </div>
                </div>
              </div>

              {/* Amount card */}
              <div className="bg-white rounded-xl px-4 pt-3.5 pb-4">
                <p className="text-sm text-[#667085] mb-2">Amount</p>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[2rem] font-bold text-[#101928]">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAmountError("");
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0.00"
                    className="w-full pl-8 text-[2rem] font-bold text-[#101928] bg-transparent outline-none border-none placeholder:text-[#d0d5dd]"
                  />
                </div>
                {amountError && (
                  <p className="text-xs text-red-500 mt-1">{amountError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-4">
              <Button
                variant="primary"
                onClick={handleContinueToPay}
                className="hover:bg-[#101828]/90"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── Step: Verification ── */}
        {step === "verification" && (
          <>
            <DialogTitle className="sr-only">
              Verify with email code
            </DialogTitle>
            <div className="px-6 py-8">
              <EmailVerificationCodeStep
                onBack={() => setStep("pay")}
                onConfirm={handleConfirmCode}
                isSubmitting={isSubmitting}
                error={verificationError}
                onResendCode={handleRequestCode}
                isResending={isResending}
              />
            </div>
          </>
        )}

        {/* ── Step: Success ── */}
        {step === "success" && (
          <>
            <DialogTitle className="sr-only">Payment Sent</DialogTitle>

            <div className="p-2 flexflex-colitems-center">
              <Image
                src="/payroll/modal-illustration.png"
                alt="Success"
                width={384}
                height={220}
                className="w-full rounded-md"
              />
              <div className="px-4 pt-6 pb-6">
                <h2 className="text-2xl font-bold text-[#000000] mb-8">
                  Payment Sent!
                </h2>
                <Button
                  variant="primary"
                  onClick={handleGoHome}
                  className="hover:bg-[#101828]/90"
                >
                  Go to home
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
