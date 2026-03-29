"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTeamKYCStore } from "@/store/team/team-kyc-store";
import {
  BankDetailsSubmissionData,
  submitTeamBankDetails,
  getOffRampEnums,
} from "@/lib/team/team-kyc-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { COUNTRY_MAP, CURRENCY_MAP } from "./offrap-countries";

interface TeamBankDetailsFormProps {
  onSuccess?: () => void;
}

interface CountryOption {
  code: string;
  name: string;
}

interface CurrencyOption {
  code: string;
  name: string;
}

export function TeamBankDetailsForm({ onSuccess }: TeamBankDetailsFormProps) {
  const {
    control,
    handleSubmit,
    // watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BankDetailsSubmissionData>({
    defaultValues: {
      country: "",
      currencyCode: "",
      bankName: "",
      bankBranch: "",
      accountName: "",
      accountNumber: "",
    },
  });

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [loadingEnums, setLoadingEnums] = useState(true);
  //   const selectedCountry = watch("country");
  const { setTeamMember, teamMember } = useTeamKYCStore();

  useEffect(() => {
    fetchEnums();
  }, []);

  const fetchEnums = async () => {
    try {
      setLoadingEnums(true);
      const enums = await getOffRampEnums();

      if (Array.isArray(enums.countries)) {
        const countriesArray = enums.countries;
        if (typeof countriesArray[0] === "string") {
          setCountries(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            countriesArray.map((c: any) => {
              if (typeof c === "string") {
                return {
                  code: c,
                  name: COUNTRY_MAP[c] || c,
                };
              }
              return c;
            }),
          );
        } else {
          // Array of objects
          setCountries(
            countriesArray.map((c: string) => ({
              code: c,
              name: COUNTRY_MAP[c] || c,
            })),
          );
        }
      }

      setCurrencies(
        (enums.fiatCurrencies || []).map((code: string) => ({
          code,
          name: CURRENCY_MAP[code] || code,
        })),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load bank options";
      toast.error(errorMessage);
      console.error("Error fetching enums:", error);
    } finally {
      setLoadingEnums(false);
    }
  };

  const onSubmit = async (data: BankDetailsSubmissionData) => {
    try {
      await submitTeamBankDetails(data);
      toast.success("Bank details saved successfully!");

      // Update the store if we have team member data
      if (teamMember) {
        setTeamMember({
          ...teamMember,
          bankPayoutStatus: true,
        });
      }

      reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save bank details";
      toast.error(errorMessage);
      console.error("Bank details submission error:", error);
    }
  };

  if (loadingEnums) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 text-[#667085] animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.country && (
          <p className="text-[#DC2626] text-sm mt-1">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* Currency Code */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Currency <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="currencyCode"
          control={control}
          rules={{ required: "Currency is required" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full border-[#D0D5DD] focus:border-[#0084FD]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.currencyCode && (
          <p className="text-[#DC2626] text-sm mt-1">
            {errors.currencyCode.message}
          </p>
        )}
      </div>

      {/* Bank Name */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Bank Name <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="bankName"
          control={control}
          rules={{ required: "Bank name is required" }}
          render={({ field }) => (
            <Input {...field} placeholder="e.g., Access Bank" />
          )}
        />
        {errors.bankName && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.bankName.message}
          </p>
        )}
      </div>

      {/* Bank Branch */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Bank Branch <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="bankBranch"
          control={control}
          rules={{ required: "Bank branch is required" }}
          render={({ field }) => (
            <Input {...field} placeholder="e.g., Ile-Ife" />
          )}
        />
        {errors.bankBranch && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.bankBranch.message}
          </p>
        )}
      </div>

      {/* Account Name */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Account Name <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="accountName"
          control={control}
          rules={{ required: "Account name is required" }}
          render={({ field }) => (
            <Input {...field} placeholder="Your name as shown in bank" />
          )}
        />
        {errors.accountName && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.accountName.message}
          </p>
        )}
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Account Number <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="accountNumber"
          control={control}
          rules={{ required: "Account number is required" }}
          render={({ field }) => (
            <Input {...field} placeholder="Your account number" />
          )}
        />
        {errors.accountNumber && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.accountNumber.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="mt-6">
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </div>
        ) : (
          "Save Bank Details"
        )}
      </Button>
    </form>
  );
}
