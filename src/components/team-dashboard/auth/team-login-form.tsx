"use client";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { teamLogin } from "@/lib/team/team-auth-service";
import toast from "react-hot-toast";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Talent Login Form Component
 * Authenticates talent user with email and password
 * Stores tokens and user data in Zustand store on success
 */

interface TeamLoginFormInputs {
  email: string;
  password: string;
}

export function TeamLoginForm() {
  // const router = useRouter();
  const { setTeamLoginData, setIsLoading, isLoading } = useTeamAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamLoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TeamLoginFormInputs) => {
    try {
      setIsLoading(true);

      // Call talent login API
      const loginResponse = await teamLogin(data.email, data.password);

      // Store tokens and user data in Zustand
      setTeamLoginData(loginResponse);

      toast.success("Login successful!");

      // // If only one company, auto-select and redirect to dashboard

      // if (loginResponse.companies.length === 1) {
      //   router.push("/team/dashboard");
      // } else {
      //   router.push("/team/select-company");
      // }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
      console.error("Talent login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="w-full max-w-91" onSubmit={handleSubmit(onSubmit)}>
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

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
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
