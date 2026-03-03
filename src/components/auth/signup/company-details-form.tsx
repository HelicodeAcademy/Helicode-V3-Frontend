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
import { useAuthStore } from "@/store/auth-store";
import { countries } from "@/lib/countries";
import { Users } from "lucide-react";

/**
 * Company Details Form - Second step of signup
 * Collects: Company Name, Team Size, Country
 * Uses react-hook-form with Controller for the Select component
 */

interface CompanyDetailsForm {
  companyName: string;
  teamSize: number;
  country: string;
}

export function CompanyDetailsForm() {
  const router = useRouter();
  const { signupData, setSignupData, setCurrentStep } = useAuthStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyDetailsForm>({
    defaultValues: {
      companyName: signupData.companyName || "",
      teamSize: signupData.teamSize || 0,
      country: signupData.country || "us",
    },
  });

  const onSubmit = (data: CompanyDetailsForm) => {
    // Save form data to store
    setSignupData(data);
    // Move to next step
    setCurrentStep("product");
    router.push("/signup/company/product");
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
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-[#ED2525]">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Team Size <span className="text-[#FF3F3F]">*</span>
            </label>

            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
              <Input
                type="number"
                placeholder="10"
                {...register("teamSize", {
                  required: "Team size is required",
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "Team size must be at least 1",
                  },
                })}
                className={`pl-10 border-[#d0d5dd] ${
                  errors.teamSize ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.teamSize && (
              <p className="mt-1 text-xs text-[#ED2525]">
                {errors.teamSize.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Country <span className="text-[#FF3F3F]">*</span>
            </label>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-lg border border-[#E4E7EC] bg-white w-full text-[#101828] focus:border-ring focus:ring-2 focus:ring-ring/10">
                    <SelectValue />
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
            {errors.country && (
              <p className="mt-1 text-xs text-[#ED2525]">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" variant={"primary"} className="mt-6">
            Next
          </Button>
        </form>
      </div>
    </div>
  );
}
