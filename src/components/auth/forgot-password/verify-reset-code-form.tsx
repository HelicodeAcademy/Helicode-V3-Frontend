"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import {
  confirmPasswordReset,
  resendVerificationCode,
} from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";

//  verify Reset Code Form Component
//  Allows user to enter 6-digit verification code sent to their email
//  Confirms password reset after code validation
//  Includes resend functionality for users who didn't receive the code

interface VerifyResetCodeInputs {
  otp: string[];
}

export function VerifyResetCodeForm() {
  const router = useRouter();
  const { recoveryData, setIsLoading } = useAuthStore();

  // OTP split into individual digits for UI
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // React Hook Form setup
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyResetCodeInputs>();

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-focus next input when digit is entered
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to move to previous input
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Check if OTP is complete
  const isOtpComplete = otp.every((digit) => digit !== "");

  //  Verify the reset code and confirm password reset

  const onSubmit = async () => {
    if (!recoveryData.userId) {
      toast.error("Recovery data not found. Please start over.");
      return;
    }

    if (!isOtpComplete) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);

      const code = otp.join("");

      // Confirm password reset with code
      await confirmPasswordReset(recoveryData.userId, code);

      toast.success("Password reset successfully!");

      // Redirect to login
      router.push("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend verification code to email
   */
  const handleResend = async () => {
    if (!recoveryData.email) {
      toast.error("Email not found. Please start over.");
      return;
    }

    try {
      setIsResending(true);
      await resendVerificationCode(recoveryData.email, "RECOVERY");
      toast.success("Verification code resent!");
      setResendTimer(60); // 60-second countdown
      setOtp(["", "", "", "", "", ""]); // Clear OTP input
      inputRefs.current[0]?.focus();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend code";
      toast.error(errorMessage);
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <div className="mb-2">
          <Image src="/signup/sms.svg" alt="lock" width={32} height={32} />
        </div>

        <h1 className="text-2xl font-medium text-[#212121] mb-2 leading-[145%]">
          Verify reset code
        </h1>
        <p className="text-[#444444] text-sm">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="space-y-6">
        {/* OTP Input Fields */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-2">
              Enter verification code <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="flex gap-2 mb-10">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {
                    if (el !== null) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-10 text-center text-2xl font-bold border-[#D7D7D7] text-black! rounded-[6px]!"
                  placeholder="0"
                  disabled={isSubmitting || isResending}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="space-x-3">
              <Button
                type="submit"
                disabled={!isOtpComplete || isSubmitting || isResending}
                variant={"surface"}
                className="w-29"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  "Confirm Reset"
                )}
              </Button>
              <Button
                onClick={handleResend}
                type="button"
                variant={"primary"}
                className="w-27 text-white rounded-lg transition-colors"
                disabled={resendTimer > 0 || isResending || isSubmitting}
              >
                {/* Resend email */}
                {isResending ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </span>
                ) : resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  "Resend email"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
