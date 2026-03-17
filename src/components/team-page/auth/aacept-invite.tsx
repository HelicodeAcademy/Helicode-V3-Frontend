"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { acceptTeamInvite } from "@/lib/talent/team-auth-service";
import { Loader2 } from "lucide-react";

// Accept Invite form component for talent
// Allows talent to accept invitation by providing the code sent to their email, their email and password
// Creates account and redirects to talent login page

interface AcceptInviteFormData {
  otp: string;
  email: string;
  password: string;
}

export function AcceptInviteForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoading, isLoading } = useTeamAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormData>({
    defaultValues: {
      otp: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AcceptInviteFormData) => {
    try {
      setIsLoading(true);

      await acceptTeamInvite({
        otp: data.otp,
        email: data.email,
        password: data.password,
      });

      toast.success("Account created successfully! Redirecting to login");
      router.push("/talent/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-100">
      <div className="md:mb-8 mb-6">
        <h1 className="text-[2rem] md:text-[2rem] font-medium text-[#212121] mb-2 leading-[145%]">
          Welcome to Helicode
        </h1>
        <p className="text-[#444444] text-sm">
          Please complete your talent account to start receiving your salaries
          smoothly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Enter Code <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter code"
                {...register("otp", {
                  minLength: {
                    value: 6,
                    message: "Code must be at least 6 characters long",
                  },
                })}
              />
            </div>
            {errors.otp && (
              <p className="text-xs text-[#ED2525] mt-1">
                {errors.otp.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Enter Email Address <span className="text-[#FF3F3F]">*</span>
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
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                className="pl-10"
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
              Enter New Password <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
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
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-20.75 hover:bg-[#101828] text-white mt-8"
          disabled={isSubmitting || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            "Accept"
          )}
        </Button>
      </form>
    </div>
  );
}
