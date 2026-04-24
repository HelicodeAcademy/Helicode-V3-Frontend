"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

// This is the first step of signup
// Collects first name, last name, work email and password from the user
// Validates the inputs and moves to company details step

interface CompanySignupFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export function CompanySignupForm() {
  const router = useRouter();
  const { signupData, setSignupData, setCurrentStep } = useAuthStore();

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<CompanySignupFormData>({
    defaultValues: {
      firstName: signupData.firstName || "",
      lastName: signupData.lastName || "",
      email: signupData.email || "",
    },
    mode: "onBlur",
  });

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
      </div>

      {/* Divider */}
      {/* <div className="flex items-center gap-4 mt-8 mb-6">
        <div className="flex-1 h-px bg-[#DAE0EA]"></div>
        <span className="text-sm text-[#444444]">or sign up with</span>
        <div className="flex-1 h-px bg-[#DAE0EA]"></div>
      </div> */}

      {/* Google Sign Up Button */}
      {/* <Button
        type="button"
        variant="outline"
        className="relative w-full h-10.5 font-medium border-[#DAE0EA] text-[#212121] hover:bg-[#f4f5f7] bg-transparent flex items-center justify-center"
      >
        <Image
          src="/signup/Google.svg"
          alt="Google Logo"
          width={26}
          height={26}
          className="absolute left-4"
        />

        <span>Sign Up Using Google</span>
      </Button> */}

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

      <Button
        type="submit"
        variant={"primary"}
        // disabled={isLoading}
        className="mt-2"
      >
        Next
      </Button>
    </form>
  );
}
