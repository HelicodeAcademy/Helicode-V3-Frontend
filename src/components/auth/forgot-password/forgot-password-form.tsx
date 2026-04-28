"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { forgotPassword } from "@/lib/auth-service";
import { Loader2, Eye, EyeOff } from "lucide-react";

//  Forgot Password Form Component
//  Initiates password recovery by sending email and new password
//  Backend sends verification code to user's email
//  Redirects to code verification step on success

interface ForgetPasswordFormInputs {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const { setIsLoading, setRecoveryData } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordFormInputs>({
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ForgetPasswordFormInputs) => {
    try {
      setIsLoading(true);

      // Call forogot password API
      const recoveryResponse = await forgotPassword(
        data.email,
        data.newPassword,
      );

      // Store recovery data in store
      setRecoveryData({
        userId: recoveryResponse?.userId,
        token: recoveryResponse.token,
        email: data.email,
        newPassword: data.newPassword,
      });

      toast.success("Verification code sent to your email!");
      router.push("/verify-reset-code");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* Work Email */}
      <div className="mb-6 md:mb-8 space-y-4">
        <div className="">
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

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            New password <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={` ${errors.newPassword ? "border-[#ff383c]" : ""}`}
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
          {errors.newPassword && (
            <p className="text-[#ED2525]  text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Confirm password <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className={`${errors.confirmPassword ? "border-[#ff383c]" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[#ED2525] text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}

      <div className="flex gap-x-2.5">
        <Button
          type="submit"
          variant={"primary"}
          disabled={isSubmitting}
          className="w-20.75 hover:bg-[#101828] text-white font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          ) : (
            "Submit"
          )}
        </Button>

        {/* Back to login */}
        <Button
          type="button"
          variant="surface"
          className="w-26.25 border-[#D9D9D9] text-[#131313] hover:bg-[#f4f5f7] bg-transparent"
          onClick={() => router.push("/login")}
        >
          Back to login
        </Button>
      </div>
    </form>
  );
}
