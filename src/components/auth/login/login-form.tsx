"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { signin, requestLoginVerificationCode } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface LoginFormStep1Data {
  email: string;
}

interface LoginFormStep2Data {
  code: string;
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const { setLoginData, setIsLoading } = useAuthStore();

  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
  } = useForm<LoginFormStep1Data>({
    defaultValues: {
      email: "",
    },
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 },
  } = useForm<LoginFormStep2Data>({
    mode: "onBlur",
  });

  const onSubmitStep1 = async (data: LoginFormStep1Data) => {
    try {
      setIsLoading(true);
      await requestLoginVerificationCode(data.email, "employer");
      setEmail(data.email);
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(errorMessage);
      console.error("OTP request error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (data: LoginFormStep2Data) => {
    try {
      setIsLoading(true);
      const response = await signin(email, data.code);

      // Store tokens and user data in store
      setLoginData(response);

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid OTP";
      toast.error(errorMessage);
      console.error("Login error:", error);
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
          Please enter your details to sign into your account
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmitStep1(onSubmitStep1)}>
          {/* Form Fields */}
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
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmittingStep1}
            variant={"primary"}
            className="w-20.75 hover:bg-[#101828] text-white mt-8"
          >
            {isSubmittingStep1 ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              6-Digit Code <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter OTP code"
              maxLength={6}
              {...registerStep2("code", {
                required: "OTP code is required",
                minLength: {
                  value: 6,
                  message: "Code must be 6 digits",
                },
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Code must be 6 numbers",
                },
              })}
              className="border-[#d0d5dd] focus:border-[#0084FD] text-center text-2xl tracking-widest"
            />
            {errorsStep2.code && (
              <p className="text-[#ff383c] text-sm mt-1">
                {errorsStep2.code.message}
              </p>
            )}
            <p className="text-[#667085] text-xs mt-2">Sent to {email}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmittingStep2} className="">
              {isSubmittingStep2 ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className=""
            >
              Back to Email
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
