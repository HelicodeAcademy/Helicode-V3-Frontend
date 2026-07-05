"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember, useTeamStore } from "@/store/team-store";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { paySingleTeamMember, getTeamMembers } from "@/lib/team-service";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";

interface OneTimePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PayStep = "pay" | "verification" | "success";

export function OneTimePaymentModal({
  open,
  onOpenChange,
}: OneTimePaymentModalProps) {
  const router = useRouter();
  const { members, setMembers } = useTeamStore();
  const [step, setStep] = useState<PayStep>("pay");
  const [searchInput, setSearchInput] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [amount, setAmount] = useState("");
  const [searchError, setSearchError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const resetState = useCallback(() => {
    setStep("pay");
    setSearchInput("");
    setSelectedMember(null);
    setShowSuggestions(false);
    setAmount("");
    setSearchError("");
    setAmountError("");
    setVerificationError("");
  }, []);

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const result = await getTeamMembers({ search: "", page: 1, limit: 100 });
      setMembers(result.data, result.total);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load team members.";
      toast.error(message);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [setMembers]);

  useEffect(() => {
    if (open) {
      resetState();
      void loadMembers();
    }
  }, [open, loadMembers, resetState]);

  const suggestions = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q || selectedMember) {
      return [];
    }

    return members
      .filter((member) => member.fullName.toLowerCase().includes(q))
      .slice(0, 8);
  }, [members, searchInput, selectedMember]);

  const handleNameChange = (value: string) => {
    setSearchInput(value);
    setShowSuggestions(true);
    setSearchError("");

    if (!value.trim()) {
      setSelectedMember(null);
      setAmount("");
      return;
    }

    const exactMatch = members.find(
      (member) => member.fullName.toLowerCase() === value.trim().toLowerCase(),
    );

    if (exactMatch) {
      setSelectedMember(exactMatch);
      setShowSuggestions(false);
      setAmount(String(exactMatch.amount));
    } else {
      setSelectedMember(null);
    }
  };

  const handleSelectSuggestion = (member: TeamMember) => {
    setSelectedMember(member);
    setSearchInput(member.fullName);
    setShowSuggestions(false);
    setAmount(String(member.amount));
    setSearchError("");
  };

  const handleContinueToPay = () => {
    if (!selectedMember) {
      setSearchError("Select a team member to pay.");
      return;
    }

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Enter a valid amount.");
      return;
    }

    setSearchError("");
    setAmountError("");
    void requestCode();
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
    if (!selectedMember) return;
    setIsSubmitting(true);
    setVerificationError("");
    try {
      await paySingleTeamMember(selectedMember.id, code, Number(amount));
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

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-xl p-0",
          step === "success" ? "sm:max-w-md" : "sm:max-w-sm",
        )}
        showCloseButton={false}
      >
        {step === "pay" && (
          <div className="bg-[#F8F8F8]">
            <DialogTitle className="sr-only">
              Make a one-time payment
            </DialogTitle>
            <div className="bg-[#f5f5f5] px-5 pb-4 pt-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-black">
                    One-time payment
                  </h2>
                  <p className="mt-1.5 text-sm text-[#667085]">
                    Pay a team member instantly
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-black/10"
                >
                  <X className="h-4 w-4 text-[#101928]" />
                </button>
              </div>

              <div className="mb-3 rounded-xl bg-white px-4 py-3.5">
                <label className="mb-2 block text-sm text-[#667085]">
                  Team member
                </label>
                <div className="relative">
                  <Input
                    placeholder="Search by name"
                    value={searchInput}
                    onChange={(event) => handleNameChange(event.target.value)}
                    className="h-11 rounded-xl border-[#E4E7EC] bg-white"
                    disabled={isLoadingMembers}
                  />
                  {showSuggestions &&
                    searchInput.trim() &&
                    suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-xl border border-[#E4E7EC] bg-white shadow-sm">
                        {suggestions.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(member)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[#F9FAFB]"
                          >
                            <span className="font-medium text-[#101928]">
                              {member.fullName}
                            </span>
                            <span className="text-xs text-[#667085]">
                              {member.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                {searchError && (
                  <p className="mt-1 text-xs text-red-500">{searchError}</p>
                )}
                {showSuggestions &&
                  searchInput.trim() &&
                  suggestions.length === 0 &&
                  !selectedMember &&
                  !isLoadingMembers && (
                    <p className="mt-1 text-xs text-[#667085]">
                      No matching team members found.
                    </p>
                  )}
              </div>

              {selectedMember && (
                <div className="mb-3 rounded-xl bg-white px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#667085]">Recipient</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#101928]">
                        {selectedMember.fullName}
                      </p>
                      <p className="text-xs text-[#667085]">
                        {selectedMember.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-white px-4 pb-4 pt-3.5">
                <p className="mb-2 text-sm text-[#667085]">Amount</p>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[2rem] font-bold text-[#101928]">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setAmountError("");
                    }}
                    onWheel={(event) => event.currentTarget.blur()}
                    placeholder="0.00"
                    className="w-full border-none bg-transparent pl-8 text-[2rem] font-bold text-[#101928] outline-none placeholder:text-[#d0d5dd]"
                  />
                </div>
                {amountError && (
                  <p className="mt-1 text-xs text-red-500">{amountError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end px-5 py-4">
              <Button
                variant="primary"
                onClick={handleContinueToPay}
                disabled={isSubmitting || isLoadingMembers}
                className="hover:bg-[#101828]/90"
              >
                {isLoadingMembers ? "Loading..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

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

        {step === "success" && (
          <>
            <DialogTitle className="sr-only">Payment Sent</DialogTitle>
            <div className="flex flex-col items-center p-2">
              <Image
                src="/payroll/modal-illustration.png"
                alt="Success"
                width={384}
                height={220}
                className="w-full rounded-md"
              />
              <div className="px-4 pb-6 pt-6">
                <h2 className="mb-8 text-2xl font-bold text-[#000000]">
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
