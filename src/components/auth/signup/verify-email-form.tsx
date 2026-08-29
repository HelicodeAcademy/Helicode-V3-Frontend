import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { verifyEmail, resendVerificationCode } from "@/lib/auth-service";
import { Input } from "../../ui/input";
import { Loader2 } from "lucide-react";

/**
 * Email Verification Form - Fourth step of signup
 * Allows user to enter the 6-digit OTP code sent to their email
 * Includes resend functionality for users who didn't receive the code
 * Uses react-hook-form for OTP input management
 */

interface VerifyEmailInputs {
  otp: string[];
}

export function VerifyEmailForm() {
  const router = useRouter();
  const {
    userId,
    signupData,
    setCurrentStep,
    setVerifiedUser,
    setPendingVerification,
    setIsLoading,
  } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // react hook form setup
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyEmailInputs>();

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Management for otp input fields - auto focus and value handling
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste / autofill dumping multiple digits into one field
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (digits.length === 0) return;

      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(index + digits.length - 1, 5)]?.focus();
      return;
    }

    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // Auto-focus next input if user enters a digit
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    [...pasted].forEach((digit, i) => {
      if (index + i < 6) {
        newOtp[index + i] = digit;
      }
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(index + pasted.length - 1, 5)]?.focus();
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

  // Validates that otp is complete
  const isOtpComplete = otp.every((digit) => digit !== "");

  // Submits otp
  // calls verifyEmail APi using otp code and the userId

  const onSubmit = async () => {
    if (!userId) {
      toast.error("User ID is missing. Please restart the signup process.");
      return;
    }

    if (!isOtpComplete) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setIsLoading(true);

      const code = otp.join("");
      const verifiedUserData = await verifyEmail(code, userId);

      // store verified user data
      setVerifiedUser(verifiedUserData);

      // Persist KYC/TOS links from verify-email for the next onboarding step
      setPendingVerification({
        kycLink: verifiedUserData.kycLink,
        tosLink: verifiedUserData.tosLink,
        kycStatus: verifiedUserData.kycStatus,
        tosStatus: verifiedUserData.tosStatus,
      });

      toast.success("Email verified successfully!");

      setCurrentStep("verify");

      // New flow returns KYC links; always send them through verification
      // before sign-in (even if links are temporarily missing).
      if (
        verifiedUserData.kycLink ||
        verifiedUserData.tosLink ||
        verifiedUserData.kycStatus
      ) {
        router.push("/signup/company/verification");
      } else {
        // Legacy / fallback: no KYC payload — go to login
        router.push("/login");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend otp code to users email
  // This calls the resend verification code api

  const handleResend = async () => {
    const email = signupData.email;
    if (!email) {
      toast.error("Email is missing. Please restart the signup process.");
      return;
    }

    try {
      setIsResending(true);

      await resendVerificationCode(email, "SIGNUP");
      toast.success("Verification code resent! Please check your email.");

      setResendTimer(60); // Start 60 second timer for resend
      setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      inputRefs.current[0]?.focus(); // Focus first input
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
    <div>
      {/* Email Icon */}
      <div className="mb-4">
        <Image src="/signup/sms.svg" alt="sms" width={32} height={32} />
      </div>

      {/* Heading */}
      <h1 className="mb-2 text-[2rem] font-medium text-[#212121] leading-[145%]">
        Check your inbox and confirm your email address
      </h1>

      {/* Description */}
      <p className="mb-4 text-sm text-[#444444] leading-[145%]">
        A verification email has been sent to your inbox. Please verify
        <br /> your email to continue.
      </p>
      {/* Input field */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-1.5 mb-10">
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
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={index === 0 ? 6 : 1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handleOtpPaste(index, e)}
              className="w-10 h-10 text-center text-2xl font-bold border-[#D7D7D7] text-black! rounded-[6px]!"
              placeholder="0"
              disabled={isSubmitting || isResending}
            />
          ))}
        </div>
        {/* Resend Button */}
        <div className="space-x-3">
          <Button
            type="submit"
            variant={"surface"}
            className="w-27"
            disabled={isSubmitting || !isOtpComplete || isResending}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              "Continue"
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
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : resendTimer > 0 ? (
              `Resend in ${resendTimer}s`
            ) : (
              "Resend email"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
