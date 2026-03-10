"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TalentSignupFormData {
  firstName: string;
  lastName: string;
  workEmail: string;
  password: string;
}

export function TalentSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TalentSignupFormData>({
    mode: "onBlur",
  });

  const password = watch("password");

  const validatePassword = (value: string) => {
    if (value && value.length < 10) {
      setPasswordError("Password required to be at least 10 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const onSubmit = async (data: TalentSignupFormData) => {
    if (!validatePassword(data.password)) {
      return;
    }

    setIsLoading(true);
    // Placeholder for future Zustand store integration
    console.log("Form data:", data);
    // Future: dispatch to Zustand store
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-91">
      {/* Header Section */}
      <div className="md:mb-8 mb-6">
        <h1 className="text-[2rem] md:text-[2rem] font-medium text-[#212121] mb-2">
          Sign up as a Talent
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
              {...register("workEmail", {
                required: "Work email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              className={`pl-10 ${errors.workEmail ? "border-[#FF383C]" : ""}`}
            />
          </div>
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
                required: "Password is required",
              })}
              onBlur={() => validatePassword(password)}
              className={`pr-10 ${passwordError ? "border-[#FF383C]" : ""}`}
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
          {passwordError && (
            <p className="text-xs text-[#ED2525] mt-1">{passwordError}</p>
          )}
          {errors.password && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mt-8 mb-6">
        <div className="flex-1 h-px bg-[#DAE0EA]"></div>
        <span className="text-sm text-[#444444]">or sign up with</span>
        <div className="flex-1 h-px bg-[#DAE0EA]"></div>
      </div>

      {/* Google Sign Up Button */}
      <Button
        type="button"
        variant="outline"
        className="relative w-full h-10.5 font-medium border-[#DAE0EA] text-[#212121] hover:bg-[#f4f5f7] bg-transparent flex items-center justify-center"
      >
        <Image
          src="/signup/Google.png"
          alt="Google Logo"
          width={26}
          height={26}
          className="absolute left-4"
        />

        <span>Sign Up Using Google</span>
      </Button>

      {/* Legal Text */}
      <p className="text-xs text-[#444444] my-6 font-medium">
        By signing up, you agree to our{" "}
        <a href="#" className="underline">
          Terms & Conditions
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
      </p>

      {/* Submit Button */}
      <Link href="/login">
        <Button
          type="submit"
          variant={"primary"}
          disabled={isLoading}
          className="w-37.75 hover:bg-[#101828] text-white font-medium"
        >
          {isLoading ? "Creating your account..." : "Create your account"}
        </Button>
      </Link>
    </form>
  );
}
