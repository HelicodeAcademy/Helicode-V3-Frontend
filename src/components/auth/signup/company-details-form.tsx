"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore, SignupData } from "@/store/auth-store";
import { countries } from "@/lib/countries";
import { signupCompany } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { AlertCircle, Loader2 } from "lucide-react";

/**
 * Company Details Form - Second step of signup
 * Collects: Company Name, Country — then creates the account
 */

interface CompanyDetailsFormData {
  companyName: string;
  country: string;
}

export function CompanyDetailsForm() {
  const router = useRouter();
  const {
    signupData,
    setSignupData,
    setCurrentStep,
    setUserId,
    setCompanyId,
    setIsLoading,
  } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyDetailsFormData>({
    defaultValues: {
      companyName: signupData.companyName || "",
      country: signupData.country || "",
    },
  });

  const onSubmit = async (data: CompanyDetailsFormData) => {
    try {
      setSubmitError(null);
      setIsLoading(true);
      setSignupData(data);

      const completeSignupData = {
        ...signupData,
        ...data,
      } as SignupData;

      const response = await signupCompany(completeSignupData);

      setUserId(response.userId);
      setCompanyId(response.companyId);
      setCurrentStep("verify");
      toast.success("Account created! Please verify your email.");
      router.push("/signup/company/verify-email");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div className="mb-8">
          <h1 className="mb-3 text-[2rem] font-medium text-[#212121]">
            Your Company details
          </h1>
          <p className="text-sm text-[#444444] leading-[145%]">
            Please provide your Organization information accurately, it will be
            used in all your communications on the platform.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 max-w-90.75"
        >
          {submitError && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
              <p className="text-sm text-[#B91C1C]">{submitError}</p>
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Company <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              placeholder="Helicode"
              {...register("companyName", {
                required: "Company name is required",
                minLength: {
                  value: 2,
                  message: "Company name must be at least 2 characters",
                },
              })}
              className={`rounded-lg border ${
                errors.companyName ? "border-[#ff383c]" : "border-[#C9D1DE]"
              } bg-white px-4 py-2.5 text-[#101828] placeholder:text-[#98a8c1] focus:border-ring focus:ring-2 focus:ring-ring/10`}
              disabled={isSubmitting}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-[#ED2525]">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Country
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="rounded-lg border border-[#E4E7EC] bg-white w-full text-[#101828] focus:border-ring focus:ring-2 focus:ring-ring/10">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button
            type="submit"
            variant={"primary"}
            className="mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Next"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
