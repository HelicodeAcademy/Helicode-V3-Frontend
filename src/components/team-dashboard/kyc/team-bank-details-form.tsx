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
  getSupportedCountries,
  getSupportedBanks,
} from "@/lib/team/team-kyc-service";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface TeamBankDetailsFormProps {
  onSuccess?: () => void;
}

interface CountryOption {
  code: string;
  name: string;
  currency?: string;
}

interface BankOption {
  code: string;
  name: string;
}

export function TeamBankDetailsForm({ onSuccess }: TeamBankDetailsFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BankDetailsSubmissionData>({
    defaultValues: {
      accountType: "bank",
      country: "",
      currencyCode: "",
      bankName: "",
      bankBranch: "",
      accountName: "",
      accountNumber: "",
    },
  });

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const selectedCountry = watch("country");
  const selectedAccountType = watch("accountType");
  const { setTeamMember, teamMember } = useTeamKYCStore();

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await getSupportedCountries();
      setCountries(response.countries as CountryOption[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load countries";
      toast.error(errorMessage);
      console.error("Error fetching countries:", error);
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find((c) => c.code === selectedCountry);
      if (country?.currency) {
        // Auto-set currency when country changes
        // This will be handled by the form state
        fetchBanks(selectedCountry, country.currency);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const fetchBanks = async (countryCode: string, currencyCode: string) => {
    try {
      setLoadingBanks(true);
      const response = await getSupportedBanks(countryCode, currencyCode);
      setBanks((response.banks as BankOption[]) || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load banks";
      toast.error(errorMessage);
      console.error("Error fetching banks:", error);
    } finally {
      setLoadingBanks(false);
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

  const selectedCountryData = countries.find((c) => c.code === selectedCountry);

  if (loadingCountries) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 text-[#667085] animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Account type */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Account Type <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="accountType"
          control={control}
          rules={{ required: "Account type is required" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full border-[#D0D5DD] focus:border-[#0084FD]">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="momo">Mobile Money (Momo)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.accountType && (
          <p className="text-[#DC2626] text-sm mt-1">
            {errors.accountType.message}
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country, index) => (
                  <SelectItem key={index} value={country.code}>
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

      {/* Currency Code: Auto populated */}
      {selectedCountryData?.currency && (
        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Currency
          </label>
          <div className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-md bg-[#F9FAFB] text-[#344054]">
            {selectedCountryData.currency}
          </div>
          <Controller
            name="currencyCode"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="hidden"
                value={selectedCountryData.currency}
              />
            )}
          />
        </div>
      )}

      {/* Bank Name */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          {selectedAccountType === "momo" ? "Momo Provider" : "Bank Name"}{" "}
          <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="bankName"
          control={control}
          rules={{
            required: `${selectedAccountType === "momo" ? "Momo provider" : "Bank name"} is required`,
          }}
          render={({ field }) => {
            // If banks are available and not momo, show dropdown
            if (
              banks.length > 0 &&
              selectedAccountType === "bank" &&
              !loadingBanks
            ) {
              return (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select or type bank name" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank, index) => (
                      <SelectItem key={index} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }
            // Otherwise show text input
            return (
              <Input
                {...field}
                placeholder={
                  selectedAccountType === "momo"
                    ? "e.g., MTN, Vodafone"
                    : "e.g., Access Bank"
                }
                className="border-[#D0D5DD] focus:border-[#0084FD]"
                disabled={loadingBanks}
              />
            );
          }}
        />
        {loadingBanks && (
          <p className="text-[#667085] text-sm mt-1">Loading banks...</p>
        )}
        {errors.bankName && (
          <p className="text-[#DC2626] text-sm mt-1">
            {errors.bankName.message}
          </p>
        )}
      </div>

      {/* Bank Branch */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          {selectedAccountType === "momo" ? "Branch/Region" : "Bank Branch"}{" "}
          <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          name="bankBranch"
          control={control}
          rules={{
            required: `${selectedAccountType === "momo" ? "Branch/Region" : "Bank branch"} is required`,
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={
                selectedAccountType === "momo"
                  ? "e.g., Kigali"
                  : "e.g., Ile-Ife"
              }
              className=""
            />
          )}
        />
        {errors.bankBranch && (
          <p className="text-[#DC2626] text-sm mt-1">
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
