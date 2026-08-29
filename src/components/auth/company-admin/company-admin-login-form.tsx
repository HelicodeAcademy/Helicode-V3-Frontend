"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { loginCompanyAdmin } from "@/lib/company-admins-service";
import toast from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

export function CompanyAdminLoginForm() {
  const router = useRouter();
  const { setLoginData } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginResponse = await loginCompanyAdmin(
        data.email.trim(),
        data.password,
      );
      setLoginData(loginResponse);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-91">
      <div className="md:mb-8 mb-6">
        <h1 className="text-[2rem] font-medium text-[#212121] mb-2">
          Company admin login
        </h1>
        <p className="text-[#444444] text-sm">
          Sign in with the email and password from your admin invite setup.
        </p>
      </div>

      <div className="space-y-5">
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
            Password <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
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

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-sm text-[#667085] text-center">
          Company owner?{" "}
          <Link href="/login" className="font-semibold text-[#0052FF]">
            Employer login
          </Link>
        </p>
      </div>
    </form>
  );
}
