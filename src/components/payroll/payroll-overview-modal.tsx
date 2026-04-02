"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamStore } from "@/store/team-store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { payAllPayrollGroups } from "@/lib/payroll-service";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";

interface PayrollOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OverviewStep = "overview" | "verification" | "success";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic pastel color per name so avatars don't all look the same
const AVATAR_COLORS = [
  "bg-[#FFED94] text-[#7A6500]",
  "bg-[#D1FAE5] text-[#065F46]",
  "bg-[#DBEAFE] text-[#1E40AF]",
  "bg-[#FCE7F3] text-[#9D174D]",
  "bg-[#FEF3C7] text-[#92400E]",
  "bg-[#EDE9FE] text-[#5B21B6]",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function PayrollOverviewModal({
  open,
  onOpenChange,
}: PayrollOverviewModalProps) {
  // const totalPayout = employees.reduce((sum, emp) => sum + emp.amount, 0);

  const router = useRouter();
  const { members } = useTeamStore();
  const [step, setStep] = useState<OverviewStep>("overview");
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);

  // Only active members
  const activeMembers = members.filter((m) => m.status === "Active");
  const totalPayout = activeMembers.reduce((sum, m) => sum + m.amount, 0);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("overview");
      setVerificationError("");
    }
  }, [open]);

  const handleRequestCode = async () => {
    try {
      await requestTransactionVerificationCode("COMPANY_PAY_NOW_ALL");
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

  const handlePayNow = async () => {
    setIsSubmitting(true);
    try {
      await requestTransactionVerificationCode("COMPANY_PAY_NOW_ALL");
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

  const handleConfirmCode = async (code: string) => {
    setIsSubmitting(true);
    setVerificationError("");
    try {
      await payAllPayrollGroups(code);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 p-0 overflow-hidden",
          step === "overview" ? "sm:max-w-2xl bg-[#F8F8F8]" : "sm:max-w-md",
        )}
        showCloseButton={step !== "overview"}
      >
        {/* ── Overview ── */}
        {step === "overview" && (
          <>
            <DialogTitle className="sr-only">Payroll Overview</DialogTitle>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F112A]">
                    Helicode Inc
                  </h2>
                  <p className="text-base text-[#475367]">Payroll overview</p>
                </div>
                <span className="text-xs text-[#0052FF] font-medium border border-[#E3ECFF] bg-[#ECF2FF] px-2.5 py-1 rounded-full">
                  {activeMembers.length} Member
                  {activeMembers.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Members grid */}
              {activeMembers.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-[#667085]">
                  No active team members to pay.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {activeMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 border border-[#E4E7EC] rounded-md bg-white"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                          avatarColor(member.fullName),
                        )}
                      >
                        {getInitials(member.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#101928] truncate">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-[#BEBEBE] truncate">
                          {member.role ??
                            member.type.charAt(0) +
                              member.type.slice(1).toLowerCase()}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-[#101828] shrink-0 bg-[#F2F2F2] px-2 py-1 rounded-full">
                        $
                        {member.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-end justify-between mt-6">
                <div>
                  <p className="text-sm text-[#000000] mb-1">Total Payout</p>
                  <h3 className="text-3xl font-bold text-[#000000]">
                    $
                    {totalPayout.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <button
                  onClick={handlePayNow}
                  disabled={activeMembers.length === 0 || isSubmitting}
                  className="bg-[#363636] text-white hover:bg-[#1f2937]/90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {isSubmitting ? "Sending code..." : "Pay now"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Verification ── */}
        {step === "verification" && (
          <>
            <DialogTitle className="sr-only">
              Verify with email code
            </DialogTitle>
            <div className="px-6 py-8">
              <EmailVerificationCodeStep
                onBack={() => setStep("overview")}
                onConfirm={handleConfirmCode}
                isSubmitting={isSubmitting}
                error={verificationError}
                onResendCode={handleRequestCode}
                isResending={isResending}
              />
            </div>
          </>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <>
            <DialogTitle className="sr-only">Payment Sent</DialogTitle>

            <div className="p-2">
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
                  // variant="outline"
                  // className="border-[#E4E7EC] text-[#101928] hover:bg-[#f9fafb]"
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
