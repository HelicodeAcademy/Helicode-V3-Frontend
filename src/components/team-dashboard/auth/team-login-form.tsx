"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import {
  teamLogin,
  verifyTeamLoginCode,
  resendTeamLoginCode,
} from "@/lib/team/team-auth-service";
import toast from "react-hot-toast";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Talent Login Form Component
 * Authenticates talent user with email and password
 * Stores tokens and user data in Zustand store on success
 */

type TeamLoginStep = "credentials" | "otp";

interface TeamLoginFormStep1Inputs {
  email: string;
  password: string;
}

interface TeamLoginFormStep2Inputs {
  code: string;
}

export function TeamLoginForm() {
  const router = useRouter();
  const { setTeamLoginData, setIsLoading, isLoading } = useTeamAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<TeamLoginStep>("credentials");
  const [authFlowToken, setAuthFlowToken] = useState<string | null>(null);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(10);
  const [email, setEmail] = useState<string>("");

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<TeamLoginFormStep1Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
  } = useForm<TeamLoginFormStep2Inputs>({
    defaultValues: {
      code: "",
    },
  });

  const onSubmitStep1 = async (data: TeamLoginFormStep1Inputs) => {
    try {
      setIsLoading(true);

      // Call talent login API
      const loginResponse = await teamLogin(data.email, data.password);

      setAuthFlowToken(loginResponse.authFlowToken);
      setExpiresInMinutes(loginResponse.expiresInMinutes);
      setEmail(data.email);
      setStep("otp");

      // Store tokens and user data in Zustand
      // setTeamLoginData(loginResponse);

      toast.success("OTP Sent to your email!");

      // If only one company, auto-select and redirect to dashboard

      // if (loginResponse.companies.length === 1) {
      //   router.push("/team/dashboard");
      // } else {
      //   router.push("/team/select-company");
      // }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Talent login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (data: TeamLoginFormStep2Inputs) => {
    try {
      setIsLoading(true);

      if (!authFlowToken) {
        throw new Error("Auth flow token missing");
      }

      // Verify OTP code
      const loginResponse = await verifyTeamLoginCode(data.code, authFlowToken);

      // Store tokens, user data, and companies in Zustand
      setTeamLoginData(loginResponse);

      toast.success("Login successful!");

      // If only one company, auto-select and redirect to dashboard
      // If multiple companies, redirect to company selection page
      if (loginResponse.companies.length === 1) {
        router.push("/team/dashboard");
      } else {
        router.push("/team/select-company");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid OTP code";
      toast.error(errorMessage);
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);

      if (!authFlowToken) {
        throw new Error("Auth flow token missing");
      }

      const response = await resendTeamLoginCode(authFlowToken);
      setAuthFlowToken(response.authFlowToken);
      setExpiresInMinutes(response.expiresInMinutes);
      toast.success("New OTP sent to your email!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend OTP";
      toast.error(errorMessage);
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-91">
      {/* Header Section */}
      <div className="md:mb-8 mb-6">
        <h1 className="text-[1.625rem] md:text-[2rem] font-medium text-[#212121] mb-2 leading-[135%] md:leading-[145%]">
          Login to Helicode
        </h1>
        <p className="text-[#444444] text-[13px] md:text-sm">
          {step === "credentials"
            ? "Please enter your details to sign into your account"
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      {step === "credentials" && (
        <form onSubmit={handleSubmitStep1(onSubmitStep1)}>
          {/* Form Fields */}
          {/* Email */}
          <div className="space-y-6">
            {/* Work Email */}
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
                Work Email <span className="text-[#FF3F3F]">*</span>
              </label>
              <div className="relative">
                <Image
                  src="/signup/mail-01.png"
                  alt="Email Icon"
                  width={18}
                  height={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />

                <Input
                  type="email"
                  placeholder="Enter your email address"
                  {...registerStep1("email", {
                    required: "Work email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className={`pl-10 ${errorsStep1.email ? "border-[#FF383C]" : ""}`}
                />
              </div>
              {errorsStep1.email && (
                <p className="text-xs text-[#ED2525] mt-1">
                  {errorsStep1.email.message}
                </p>
              )}
            </div>

            {/* Password with visibility toggle */}
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
                Password <span className="text-[#FF3F3F]">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...registerStep1("password", {
                    required: "Password is required",
                  })}
                  className={`pr-10 ${errorsStep1.password ? "border-[#ff383c]" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errorsStep1.password && (
                <p className="text-xs text-[#ED2525] mt-1">
                  {errorsStep1.password.message}
                </p>
              )}
              {/* Forgot Password Link */}
              <div className="flex justify-between mt-4 items-center">
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-[#101828] hover:text-[#0166f4] transition-colors"
                >
                  Forgot Password?
                </a>

                <Link
                  href="/signup"
                  className="font-medium hover:underline text-black text-[13px] md:block block lg:hidden"
                >
                  Don&apos;t have an account?{" "}
                  <span className="font-bold text-[#355587]">Sign up</span>
                </Link>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant={"primary"}
            className="w-20.75 hover:bg-[#101828] text-white mt-8"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              6-Digit Code <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter the 6-digit code"
              {...registerStep2("code", {
                required: "6-digit code is required",
                minLength: {
                  value: 6,
                  message: "OTP must be 6 digits",
                },
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Code must be 6 numbers",
                },
              })}
            />

            {errorsStep2.code && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errorsStep2.code.message}
              </p>
            )}

            <p className="text-[#667085] text-xs mt-2">
              Expires in {expiresInMinutes} minutes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isLoading} variant="primary">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("credentials")}
            >
              Back to Login
            </Button>
          </div>

          <div>
            <p className="text-[#667085] text-sm">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-[#0084FD] font-medium hover:underline disabled:opacity-50 cursor-pointer"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
