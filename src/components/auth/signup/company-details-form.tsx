"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore, SignupData } from "@/store/auth-store";
import { countries } from "@/lib/countries";
import { signupCompany } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { AlertCircle, Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

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

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((country) =>
      country.toLowerCase().includes(query),
    );
  }, [countrySearch]);

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
                <Popover
                  open={countryOpen}
                  onOpenChange={(open) => {
                    setCountryOpen(open);
                    if (!open) setCountrySearch("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className={cn(
                        "flex h-9 w-full items-center justify-between rounded-lg border border-[#E4E7EC] bg-white px-3 py-2 text-sm text-[#101828] outline-none focus:border-ring focus:ring-2 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50",
                        !field.value && "text-[#98a8c1]",
                      )}
                    >
                      <span className="truncate">
                        {field.value || "Select a country"}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-[#667085]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                  >
                    <div className="border-b border-[#E4E7EC] p-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />
                        <Input
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country..."
                          className="h-9 border-[#E4E7EC] pl-8"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        "max-h-60 overflow-y-auto overscroll-contain p-1",
                        "scrollbar-thin scrollbar-thumb-[#D0D5DD] scrollbar-track-transparent",
                        "[scrollbar-width:thin] [scrollbar-color:#D0D5DD_transparent]",
                        "[&::-webkit-scrollbar]:w-2",
                        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D0D5DD]",
                        "[&::-webkit-scrollbar-track]:bg-transparent",
                      )}
                    >
                      {filteredCountries.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-[#667085]">
                          No country found
                        </p>
                      ) : (
                        filteredCountries.map((country) => {
                          const selected = field.value === country;
                          return (
                            <button
                              key={country}
                              type="button"
                              onClick={() => {
                                field.onChange(country);
                                setCountryOpen(false);
                                setCountrySearch("");
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm text-[#101828] hover:bg-[#F2F4F7]",
                                selected && "bg-[#EFF4FF]",
                              )}
                            >
                              <span>{country}</span>
                              {selected && (
                                <Check className="size-4 text-[#0052FF]" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <p className="border-t border-[#E4E7EC] px-3 py-1.5 text-[11px] text-[#98A2B3]">
                      Scroll for more countries
                    </p>
                  </PopoverContent>
                </Popover>
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
