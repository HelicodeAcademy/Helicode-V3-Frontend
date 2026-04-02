"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
//   MutableRefObject,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";

interface EmailVerificationCodeStepProps {
  onBack: () => void;
  onConfirm: (code: string) => void;
  isSubmitting?: boolean;
  error?: string;
  onResendCode: () => Promise<void>;
  isResending?: boolean;
}

const CODE_LENGTH = 6;

export function EmailVerificationCodeStep({
  onBack,
  onConfirm,
  isSubmitting = false,
  error = "",
  onResendCode,
  isResending = false,
}: EmailVerificationCodeStepProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [resendCountdown, setResendCountdown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Focus first code box on mount
  useEffect(() => {
    setTimeout(() => codeRefs.current[0]?.focus(), 50);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    const newCode = [...code];
    [...pasted].forEach((digit, i) => {
      newCode[i] = digit;
    });
    setCode(newCode);
    codeRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const codeComplete = code.every((d) => d !== "");

  const handleConfirm = () => {
    if (codeComplete) {
      onConfirm(code.join(""));
    }
  };

  const handleResend = async () => {
    try {
      await onResendCode();
      setResendCountdown(300); // 5 minutes
      setCode(Array(CODE_LENGTH).fill("")); // Clear the code input
      codeRefs.current[0]?.focus();
    } catch (err) {
      console.error("Error resending code:", err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-19 w-19 items-center justify-center rounded-full bg-[#EEF4FF]">
          <Lock className="h-8 w-8 text-[#0052FF]" strokeWidth={1.5} />
        </div>

        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Verify with email code
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-[#475367]">
          Enter the 6-digit code sent to your email
        </DialogDescription>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2.5">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(element) => {
                codeRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleCodeChange(index, event.target.value)}
              onKeyDown={(event) => handleCodeKeyDown(index, event)}
              onPaste={index === 0 ? handleCodePaste : undefined}
              className="h-12 w-12 rounded-md border border-[#D7D7D7] text-center text-lg font-semibold text-[#101928]"
              disabled={isSubmitting || isResending}
            />
          ))}
        </div>
        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-[#D0D5DD]"
            onClick={onBack}
            disabled={isSubmitting || isResending}
          >
            Back
          </Button>
          <Button
            className="bg-[#000000] px-6 font-medium text-white"
            onClick={handleConfirm}
            disabled={!codeComplete || isSubmitting || isResending}
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-xs text-[#0052FF] hover:bg-transparent"
            onClick={handleResend}
            disabled={resendCountdown > 0 || isResending || isSubmitting}
          >
            {isResending ? (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Resending...
              </div>
            ) : resendCountdown > 0 ? (
              `Resend code in ${resendCountdown}s`
            ) : (
              "Resend code"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
