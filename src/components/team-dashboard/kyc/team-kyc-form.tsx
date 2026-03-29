"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { useTeamKYCStore } from "@/store/team/team-kyc-store";
import {
  getOffRampEnums,
  submitTeamKYC,
  KYCSubmissionData,
  OffRampEnums,
} from "@/lib/team/team-kyc-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const COUNTRY_MAP: Record<string, string> = {
  BJ: "Benin",
  BW: "Botswana",
  BF: "Burkina Faso",
  CM: "Cameroon",
  CG: "Republic of the Congo",
  CD: "Democratic Republic of the Congo",
  CI: "Côte d'Ivoire",
  GA: "Gabon",
  GH: "Ghana",
  KE: "Kenya",
  MW: "Malawi",
  ML: "Mali",
  NG: "Nigeria",
  RW: "Rwanda",
  SN: "Senegal",
  ZA: "South Africa",
  TZ: "Tanzania",
  TG: "Togo",
  UG: "Uganda",
  ZM: "Zambia",
};

export function TeamKYCForm({ onSuccess }: { onSuccess?: () => void }) {
  const { setIsLoading, isLoading, setError } = useTeamKYCStore();
  const [enums, setEnums] = useState<OffRampEnums | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    control,
  } = useForm<KYCSubmissionData>({
    defaultValues: {
      country: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      dob: "",
      idType: "",
      idNumber: "",
      additionalIdType: "",
      additionalIdNumber: "",
    },
  });

  const watchCountry = watch("country");

  useEffect(() => {
    // Fetch enums on component mount
    const fetchEnums = async () => {
      try {
        const data = await getOffRampEnums();
        setEnums(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load form data";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    };

    fetchEnums();
  }, [setError]);

  const onSubmit = async (data: KYCSubmissionData) => {
    try {
      setIsLoading(true);

      // Remove additionalId fields if country is not NG
      const submitData: KYCSubmissionData = {
        country: data.country,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dob: data.dob,
        idType: data.idType,
        idNumber: data.idNumber,
      };

      // Only include additional ID fields for Nigeria
      if (data.country === "NG") {
        submitData.additionalIdType = data.additionalIdType;
        submitData.additionalIdNumber = data.additionalIdNumber;
      }

      await submitTeamKYC(submitData);

      //   setKYCStatus("pending");
      toast.success("KYC submitted successfully!");
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit KYC";
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("KYC submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!enums) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#667085]">Loading form...</p>
      </div>
    );
  }

  const isNigeria = watchCountry === "NG";

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Country <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          control={control}
          name="country"
          rules={{ required: "Country is required" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {enums.countries.map((code) => (
                  <SelectItem key={code} value={code}>
                    {COUNTRY_MAP[code] || code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.country && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Full Name <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., John Doe"
          {...register("fullName", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Full name must be at least 2 characters",
            },
          })}
          className={`${errors.fullName ? "text-[#FF3F3F]" : ""}`}
        />
        {errors.fullName && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Email <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          type="email"
          placeholder="e.g., john@example.com"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email",
            },
          })}
          className={`${errors.email ? "text-[#FF3F3F]" : ""}`}
        />
        {errors.email && (
          <p className="text-[#ED2525] text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Phone Number <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          type="tel"
          placeholder="e.g., +234801234567"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^\+?[0-9]{7,15}$/,
              message: "Please enter a valid phone number",
            },
          })}
          className={`${errors.phone ? "text-[#FF3F3F]" : ""}`}
        />
        {errors.phone && (
          <p className="text-[#ED2525] text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Address <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., 123 Main St, City, Country"
          {...register("address", {
            required: "Address is required",
            minLength: {
              value: 5,
              message: "Address must be at least 5 characters",
            },
          })}
          className={`${errors.address ? "text-[#FF3F3F]" : ""}`}
        />
        {errors.address && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          Date of Birth <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          control={control}
          name="dob"
          rules={{ required: "Date of birth is required" }}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={!enums}
                >
                  {field.value
                    ? format(new Date(field.value), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  autoFocus
                  captionLayout="dropdown-years"
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.dob && (
          <p className="text-[#ED2525] text-sm mt-1">{errors.dob.message}</p>
        )}
      </div>

      {/* ID Type */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          ID Type <span className="text-[#FF3F3F]">*</span>
        </label>
        <Controller
          control={control}
          name="idType"
          rules={{ required: "ID type is required" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {enums.idTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.idType && (
          <p className="text-[#ED2525] text-sm mt-1">{errors.idType.message}</p>
        )}
      </div>

      {/* ID Number */}
      <div>
        <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
          ID Number <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g., 12345678901"
          {...register("idNumber", {
            required: "ID number is required",
            minLength: {
              value: 5,
              message: "ID number must be at least 5 characters",
            },
          })}
          className={`${errors.idNumber ? "text-[#FF3F3F]" : ""}`}
        />
        {errors.idNumber && (
          <p className="text-[#ED2525] text-sm mt-1">
            {errors.idNumber.message}
          </p>
        )}
      </div>

      {/* Additional ID Fields (Nigeria only) */}
      {isNigeria && (
        <>
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Additional ID Type <span className="text-[#FF3F3F]">*</span>
            </label>
            <Controller
              control={control}
              name="additionalIdType"
              rules={{
                required: isNigeria
                  ? "Additional ID type is required for Nigeria"
                  : false,
              }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select additional ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.idTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.additionalIdType && (
              <p className="text-[#ED2525] text-sm mt-1">
                {errors.additionalIdType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Additional ID Number
              <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., 22334455667"
              {...register("additionalIdNumber", {
                required: isNigeria
                  ? "Additional ID number is required for Nigeria"
                  : false,
                minLength: {
                  value: 5,
                  message: "Additional ID number must be at least 5 characters",
                },
              })}
              className={`${errors.additionalIdNumber ? "text-[#FF3F3F]" : ""}`}
            />
            {errors.additionalIdNumber && (
              <p className="text-[#ED2525] text-sm mt-1">
                {errors.additionalIdNumber.message}
              </p>
            )}
          </div>
        </>
      )}

      <Button type="submit" disabled={isSubmitting || isLoading} className="">
        {isSubmitting || isLoading ? "Submitting KYC..." : "Submit KYC"}
      </Button>
    </form>
  );
}
