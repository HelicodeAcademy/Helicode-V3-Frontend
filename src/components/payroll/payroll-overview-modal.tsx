"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamStore } from "@/store/team-store";
import { apiCall } from "@/lib/api-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

// interface PayrollOverviewModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onPayNow: () => void;
// }
interface PayrollOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OverviewStep = "overview" | "pin" | "success";

const PIN_LENGTH = 4;

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

// const employees = [
//   { id: 1, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 2, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 3, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 4, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 5, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 6, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 7, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
//   { id: 8, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
// ];

export function PayrollOverviewModal({
  open,
  onOpenChange,
}: PayrollOverviewModalProps) {
  // const totalPayout = employees.reduce((sum, emp) => sum + emp.amount, 0);

  const router = useRouter();
  const { members } = useTeamStore();
  const [step, setStep] = useState<OverviewStep>("overview");
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Only active members
  const activeMembers = members.filter((m) => m.status === "Active");
  const totalPayout = activeMembers.reduce((sum, m) => sum + m.amount, 0);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("overview");
      setPin(Array(PIN_LENGTH).fill(""));
      setPinError("");
    }
  }, [open]);

  // Focus first pin box when entering pin step
  useEffect(() => {
    if (step === "pin") {
      setTimeout(() => pinRefs.current[0]?.focus(), 50);
    }
  }, [step]);

  // PIN handlers
  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setPinError("");
    if (digit && index < PIN_LENGTH - 1) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    const newPin = [...pin];
    [...pasted].forEach((digit, i) => { newPin[i] = digit; });
    setPin(newPin);
    pinRefs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
  };

  const pinComplete = pin.every((d) => d !== "");

  const handleConfirm = async () => {
    if (!pinComplete) return;
    setIsSubmitting(true);
    setPinError("");
    try {
      // await apiCall("/payroll-groups/pay-now/all", {
      //   method: "POST",
      //   body: JSON.stringify({ pin: pin.join("") }),
      // });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
      if (message === "Wallet PIN not configured") {
        setPinError(message);
      } else {
        toast.error(message);
      }
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
                  <h2 className="text-2xl font-bold text-[#0F112A]">Helicode Inc</h2>
                  <p className="text-base text-[#475367]">Payroll overview</p>
                </div>
                <span className="text-xs text-[#0052FF] font-medium border border-[#E3ECFF] bg-[#ECF2FF] px-2.5 py-1 rounded-full">
                  {activeMembers.length} Member{activeMembers.length !== 1 ? "s" : ""}
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
                          {member.role ?? member.type.charAt(0) + member.type.slice(1).toLowerCase()}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-[#101828] shrink-0 bg-[#F2F2F2] px-2 py-1 rounded-full">
                        ${member.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    ${totalPayout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <button
                  onClick={() => setStep("pin")}
                  disabled={activeMembers.length === 0}
                  className="bg-[#363636] text-white hover:bg-[#1f2937]/90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Pay now
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── PIN ── */}
        {step === "pin" && (
          <>
            <DialogTitle className="sr-only">Input Pin</DialogTitle>
            <div className="px-8 py-10 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[#EFF4FF] flex items-center justify-center mb-5">
                <Lock className="h-7 w-7 text-[#2563eb]" strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl font-bold text-[#101928] mb-1">
                Input Pin
              </h2>
              <p className="text-sm text-[#667085] mb-7">
                Enter your 4-digit code to proceed
              </p>

              {/* PIN boxes */}
              <div className="flex items-center gap-3 mb-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    onPaste={i === 0 ? handlePinPaste : undefined}
                    className={cn(
                      "h-13 w-13 rounded-lg border text-center text-xl font-semibold text-[#101928] outline-none transition-all",
                      pinError
                        ? "border-red-400 bg-red-50"
                        : digit
                          ? "border-[#101928] bg-white shadow-sm"
                          : "border-[#E4E7EC] bg-white",
                      !pinError && "focus:border-[#101928] focus:ring-2 focus:ring-[#101928]/10",
                    )}
                  />
                ))}
              </div>

              {/* PIN error */}
              {pinError ? (
                <div className="mb-6 text-center">
                  <p className="text-sm text-red-500 mb-1">{pinError}</p>
                  <button
                    onClick={() => { onOpenChange(false); router.push("/dashboard/settings"); }}
                    className="text-sm text-[#0052FF] underline underline-offset-2 hover:text-[#0041cc] transition-colors"
                  >
                    Set up your PIN in Settings →
                  </button>
                </div>
              ) : (
                <div className="mb-6" />
              )}

              <Button
                variant="primary"
                className="w-full hover:bg-[#101828]/90"
                disabled={!pinComplete || isSubmitting}
                onClick={handleConfirm}
              >
                {isSubmitting ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <>
            <DialogTitle className="sr-only">Payment Sent</DialogTitle>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* <img src="/payroll/modal-illustration.png" alt="" className="w-full" /> */}

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
