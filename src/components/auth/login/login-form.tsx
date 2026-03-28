"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { signin } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { setLoginData, setIsLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      // Call the signin API
      const loginResponse = await signin(data.email, data.password);

      // Store tokens and user data in store
      setLoginData(loginResponse);

      toast.success("Login successful!");
      router.push("/dashboard");
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
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-91">
      {/* Header Section */}
      <div className="md:mb-8 mb-6">
        <h1 className="text-[1.625rem] md:text-[2rem] font-medium text-[#212121] mb-2 leading-[135%] md:leading-[145%]">
          Login to Helicode
        </h1>
        <p className="text-[#444444] text-[13px] md:text-sm">
          Please enter your details to sign into your account
        </p>
      </div>

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
                required: "Password is required",
              })}
              className={`pr-10 ${errors.password ? "border-[#ff383c]" : ""}`}
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
          {errors.password && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.password.message}
            </p>
          )}
          {/* Forgot Password Link */}
          <div>
            <a
              href="/forgot-password"
              className="text-xs font-medium text-[#101828] hover:text-[#0166f4] transition-colors"
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        variant={"primary"}
        className="w-20.75 hover:bg-[#101828] text-white mt-8"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}
