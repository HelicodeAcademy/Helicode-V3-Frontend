"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { resendSigninCode, signin, verifySigninCode } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type LoginStep = "credentials" | "otp";

interface LoginFormStep1Data {
  email: string;
  password: string;
}

interface LoginFormStep2Data {
  code: string;
}

export function LoginForm() {
  const router = useRouter();
  const { setLoginData } = useAuthStore();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authFlowToken, setAuthFlowToken] = useState<string | null>(null);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(10);
  const [email, setEmail] = useState<string>("");

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm<LoginFormStep1Data>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
  } = useForm<LoginFormStep2Data>({
    defaultValues: {
      code: "",
    },
    mode: "onBlur",
  });

  const onSubmitStep1 = async (data: LoginFormStep1Data) => {
    try {
      setIsLoading(true);

      // Call the signin API
      const response = await signin(data.email, data.password);

      // Store the data
      setAuthFlowToken(response.authFlowToken);
      setExpiresInMinutes(response.expiresInMinutes);
      setEmail(data.email);

      // Move to OTP step
      setStep("otp");
      toast.success("OTP sent to your email!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login Failed";
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (data: LoginFormStep2Data) => {
    try {
      setIsLoading(true);

      if (!authFlowToken) {
        throw new Error("Auth flow token missing");
      }

      // Call the signin API
      const loginResponse = await verifySigninCode(data.code, authFlowToken);

      // Store tokens and user data in store
      setLoginData(loginResponse);

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Inv";
      toast.error(errorMessage);
      console.error("Login error:", error);
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

      const response = await resendSigninCode(authFlowToken);
      setAuthFlowToken(response.authFlowToken);
      setExpiresInMinutes(response.expiresInMinutes);

      toast.success("OTP resent to your email!");
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

      {/* Form Fields */}

      {step === "credentials" && (
        <div>
          <form
            onSubmit={handleSubmitStep1(onSubmitStep1, (error) => {
              console.log(error);
            })}
            className="space-y-6"
          >
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
              <div className="flex items-center justify-between mt-4">
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              variant={"primary"}
              className="w-20.75 hover:bg-[#101828] text-white "
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
        </div>
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

          <div className="">
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
