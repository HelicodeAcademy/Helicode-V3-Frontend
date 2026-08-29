"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { confirmCompanyAdminSetup } from "@/lib/company-admins-service";

interface SetupFormData {
  firstName: string;
  lastName: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export function CompanyAdminSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromLink = searchParams.get("code") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      code: codeFromLink,
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (data: SetupFormData) => {
    try {
      await confirmCompanyAdminSetup({
        email: data.email.trim(),
        code: data.code.trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      });
      toast.success("Account activated. Please sign in.");
      router.push("/company-admin/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete setup",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-[2rem] font-medium text-[#212121] mb-2 leading-[145%]">
          Complete your admin setup
        </h1>
        <p className="text-sm text-[#444444] leading-[145%]">
          Enter your details and the code from your invite email to activate
          your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              First name <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              placeholder="Amara"
              {...register("firstName", {
                required: "First name is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
              className={errors.firstName ? "border-[#FF383C]" : ""}
              disabled={isSubmitting}
            />
            {errors.firstName && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Last name <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              placeholder="Obi"
              {...register("lastName", {
                required: "Last name is required",
                minLength: { value: 2, message: "At least 2 characters" },
              })}
              className={errors.lastName ? "border-[#FF383C]" : ""}
              disabled={isSubmitting}
            />
            {errors.lastName && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Work email <span className="text-[#FF3F3F]">*</span>
          </label>
          <Input
            type="email"
            placeholder="amara@acme.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
            className={errors.email ? "border-[#FF383C]" : ""}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-[#ED2525] mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Setup code <span className="text-[#FF3F3F]">*</span>
          </label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="484842"
            {...register("code", {
              required: "Setup code is required",
              minLength: { value: 4, message: "Enter the full code" },
            })}
            className={errors.code ? "border-[#FF383C]" : ""}
            disabled={isSubmitting}
          />
          {errors.code && (
            <p className="text-xs text-[#ED2525] mt-1">{errors.code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Password <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className={`pr-10 ${errors.password ? "border-[#FF383C]" : ""}`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Confirm password <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={`pr-10 ${errors.confirmPassword ? "border-[#FF383C]" : ""}`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Activate account"
          )}
        </Button>
      </div>
    </form>
  );
}
