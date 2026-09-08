"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import {
  PasswordRequirements,
  isSignupPasswordValid,
} from "@/components/auth/signup/password-requirements";

// This is the first step of signup
// Collects first name, last name, work email and password from the user
// Validates the inputs and moves to company details step

interface CompanySignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function CompanySignupForm() {
  const router = useRouter();
  const { signupData, setSignupData, setCurrentStep } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompanySignupFormData>({
    defaultValues: {
      firstName: signupData.firstName || "",
      lastName: signupData.lastName || "",
      email: signupData.email || "",
      password: signupData.password || "",
    },
    mode: "onBlur",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch("password") || "";

  const onSubmit = async (data: CompanySignupFormData) => {
    // Save from data to store
    setSignupData(data);

    // Move to next step in the signup flow
    setCurrentStep("details");
    router.push("/signup/company/details");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-91">
      {/* Header Section */}
      <div className="md:mb-8 mb-6">
        <h1 className="text-[2rem] md:text-[2rem] font-medium text-[#212121] mb-2">
          Sign up your company
        </h1>
        <p className="text-[#444444] text-sm">
          To get started, fill in the information
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* First Name and Last Name - Two columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              First Name <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              placeholder="Enter your first name"
              {...register("firstName", {
                required: "First name is required",
              })}
              className={`${errors.firstName ? "border-[#ff383c]" : ""}`}
            />
            {errors.firstName && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Last Name <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              placeholder="Enter your last name"
              {...register("lastName", {
                required: "Last name is required",
              })}
              className={`${errors.lastName ? "border-[#ff383c]" : ""}`}
            />
            {errors.lastName && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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
              className={`pl-10 ${errors.email ? "border-[#FF383C]" : ""}`}
            />
          </div>

          {errors.email && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.email.message}
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
              {...register("password", {
                required: true,
              })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <PasswordRequirements password={password} />
        </div>
      </div>

      {/* Legal Text */}
      <p className="text-xs text-[#444444] my-6 font-medium">
        By signing up, you agree to our{" "}
        <a href="/terms-of-use" className="underline">
          Terms & Conditions
        </a>{" "}
        and{" "}
        <a href="/privacy-policy" className="underline">
          Privacy Policy
        </a>
      </p>

      {/* Submit Button */}

      <Button
        type="submit"
        variant={"primary"}
        className="mt-2"
        disabled={!isSignupPasswordValid(password)}
      >
        Next
      </Button>
    </form>
  );
}
