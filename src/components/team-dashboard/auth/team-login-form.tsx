"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import {
  teamLogin,
  requestTeamLoginVerificationCode,
} from "@/lib/team/team-auth-service";
import toast from "react-hot-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";

/**
 * Talent Login Form Component
 * Authenticates talent user with email and code
 * Stores tokens and user data in Zustand store on success
 */

interface TeamLoginStep1Data {
  email: string;
}

interface TeamLoginStep2Data {
  code: string;
}

export function TeamLoginForm() {
  const router = useRouter();
  const { setTeamLoginData, setIsLoading, isLoading } = useTeamAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
  } = useForm<TeamLoginStep1Data>({
    defaultValues: {
      email: "",
    },
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 },
  } = useForm<TeamLoginStep2Data>({
    defaultValues: {
      code: "",
    },
  });

  const onSubmitStep1 = async (data: TeamLoginStep1Data) => {
    try {
      setIsLoading(true);
      await requestTeamLoginVerificationCode(data.email);
      setEmail(data.email);
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Talent login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (data: TeamLoginStep2Data) => {
    try {
      setIsLoading(true);

      // Call team login API with email and OTP code
      const loginResponse = await teamLogin(email, data.code);

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
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Team login error:", error);
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
          {step === 1
            ? "Please enter your details to sign into your account"
            : "Enter the OTP sent to your email"}
        </p>
      </div>

      {step === 1 && (
        <form
          onSubmit={handleSubmitStep1(onSubmitStep1)}
          className="w-full max-w-91"
        >
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
                  {...register("email", {
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

            <Button
              type="submit"
              disabled={isSubmittingStep1 || isLoading}
              variant={"primary"}
              className="w-20.75 hover:bg-[#101828] text-white mt-4"
            >
              {isSubmittingStep1 ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="space-y-4" onSubmit={handleSubmitStep2(onSubmitStep2)}>
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
              className=""
            />
            {errorsStep2.code && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errorsStep2.code.message}
              </p>
            )}
            <p className="text-[#667085] text-xs mt-2">Sent to {email}</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isLoading || isSubmittingStep2}
              className=""
            >
              {isLoading || isSubmittingStep2 ? (
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
