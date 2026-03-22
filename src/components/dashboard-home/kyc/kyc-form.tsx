"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitKYC } from "@/lib/kyc-service";
import { useKYCStore } from "@/store/kyc-store";
import toast from "react-hot-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Country, State, City } from "country-state-city";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FileUpload } from "./file-upload";
import { AcceptTermsModal } from "./accept-terms";
import { Loader2 } from "lucide-react";

interface Country {
  isoCode: string;
  name: string;
  phonetic?: string;
}

interface State {
  isoCode: string;
  name: string;
  countryCode: string;
  type?: string;
}

interface City {
  //   isoCode: string;
  name: string;
  countryCode: string;
  type?: string;
}

interface KYCFormInputs {
  fullName: string;
  dob: Date;
  country: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  taxNumber: string;
  websiteUrl: string;
  invoiceCurrency: string;
  certOfIncorporation: FileList;
  proofOfAddress: FileList;
  idFront: FileList;
  idBack: FileList;
}

interface KYCFormProps {
  onSuccess?: () => void;
}

export function KYCForm({ onSuccess }: KYCFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<KYCFormInputs>({
    defaultValues: {
      fullName: "",
      dob: undefined,
      country: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      taxNumber: "",
      websiteUrl: "",
      invoiceCurrency: "USD",
      certOfIncorporation: undefined,
      proofOfAddress: undefined,
      idFront: undefined,
      idBack: undefined,
    },
  });
  const { setKYCStatus, setIsLoading, isLoading } = useKYCStore();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [dobOpen, setDobOpen] = useState(false);
  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<KYCFormInputs | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: string]: File | null;
  }>({
    certOfIncorporation: null,
    proofOfAddress: null,
    idFront: null,
    idBack: null,
    invoice: null,
  });

  // Load countries on mount
  useEffect(() => {
    try {
      const countryList = Country.getAllCountries();
      setCountries(countryList);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to fetch countries");
    }
  }, []);

  // Load states when country changes
  useEffect(() => {
    try {
      const stateList = State.getStatesOfCountry(selectedCountry);
      setStates(stateList);
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error("Failed to fetch states");
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    try {
      const cityList = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(cityList);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to fetch cities");
    }
  }, [selectedCountry, selectedState]);

  const onSubmit = (data: KYCFormInputs) => {
    // clear any previous file errors
    clearErrors(["certOfIncorporation", "proofOfAddress", "idFront", "idBack"]);

    // Validate that all files are selected and set form errors if not
    let hasError = false;

    if (!selectedFiles.certOfIncorporation) {
      setError("certOfIncorporation", {
        type: "manual",
        message: "Certificate of Incorporation is required",
      });
      hasError = true;
    }
    if (!selectedFiles.proofOfAddress) {
      setError("proofOfAddress", {
        type: "manual",
        message: "Proof of Address is required",
      });
      hasError = true;
    }
    if (!selectedFiles.idFront) {
      setError("idFront", {
        type: "manual",
        message: "ID Front is required",
      });
      hasError = true;
    }
    if (!selectedFiles.idBack) {
      setError("idBack", {
        type: "manual",
        message: "ID Back is required",
      });
      hasError = true;
    }

    if (hasError) {
      // prevent form submission when any file is missing
      return;
    }

    // Store the data and open the terms modal
    setPendingFormData(data);
    setTermsModalOpen(true);
  };

  const onTermsAccepted = async () => {
    if (!pendingFormData) return;

    try {
      setIsLoading(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Text fields
      formData.append("fullName", pendingFormData.fullName);
      formData.append("dob", format(pendingFormData.dob, "yyyy-MM-dd"));
      formData.append("countryCode", pendingFormData.country);
      formData.append("phoneNumber", pendingFormData.phoneNumber);
      formData.append("address", pendingFormData.address);
      formData.append("city", pendingFormData.city);
      formData.append("state", pendingFormData.state);
      formData.append("postalCode", pendingFormData.postalCode);
      formData.append("taxNumber", pendingFormData.taxNumber);
      formData.append("websiteUrl", pendingFormData.websiteUrl);
      formData.append("invoiceCurrency", pendingFormData.invoiceCurrency);

      // File fields
      if (selectedFiles.certOfIncorporation) {
        formData.append(
          "certOfIncorporation",
          selectedFiles.certOfIncorporation,
        );
      }
      if (selectedFiles.proofOfAddress) {
        formData.append("proofOfAddress", selectedFiles.proofOfAddress);
      }
      if (selectedFiles.idFront) {
        formData.append("idFront", selectedFiles.idFront);
      }
      if (selectedFiles.idBack) {
        formData.append("idBack", selectedFiles.idBack);
      }
      // if (selectedFiles.invoice) {
      //   formData.append("invoice", selectedFiles.invoice);
      // }

      // Submit KYC
      const result = await submitKYC(formData);
      setKYCStatus(result);

      toast.success("KYC submitted successfully!");
      setTermsModalOpen(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit KYC";
      toast.error(errorMessage);
      console.error("KYC submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (
    fieldName: keyof KYCFormInputs,
    files: FileList,
  ) => {
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [fieldName]: files.length > 0 ? files[0] : null,
    }));

    if (files.length > 0) {
      clearErrors(fieldName);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Full Name <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Input
          placeholder="John Doe"
          {...register("fullName", { required: "Full name is required" })}
        />
        {errors.fullName && (
          <p className="text-xs text-[#ED2525] mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Date of Birth <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Controller
          control={control}
          name="dob"
          rules={{ required: "Date of birth is required" }}
          render={({ field }) => (
            <Popover open={dobOpen} onOpenChange={setDobOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value
                    ? format(field.value, "MMM dd, yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setDobOpen(false);
                  }}
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
          <p className="text-xs text-[#ED2525] mt-1">{errors.dob.message}</p>
        )}
      </div>

      {/* Country Code and State*/}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
            Country Code <span className="text-[#FF3F3F]">*</span>
          </Label>
          <Controller
            control={control}
            name="country"
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.country && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        {/* State */}
        <div>
          <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
            State <span className="text-[#FF3F3F]">*</span>
          </Label>

          <Controller
            control={control}
            name="state"
            rules={{ required: "State is required" }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedCountry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedCountry ? "Select state" : "Select country first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.state && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone number */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Phone Number <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Input
          placeholder="1234567890"
          {...register("phoneNumber", {
            required: "Phone number is required",
          })}
        />
        {errors.phoneNumber && (
          <p className="text-xs text-[#ED2525] mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Address <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Input
          placeholder="123 Main Street"
          {...register("address", { required: "Address is required" })}
        />
        {errors.address && (
          <p className="text-xs text-[#ED2525] mt-1">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* City and Postal Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
            City <span className="text-[#FF3F3F]">*</span>
          </Label>
          {/* <Input
            placeholder="New York"
            {...register("city", { required: "City is required" })}
          /> */}
          <Controller
            control={control}
            name="city"
            rules={{ required: "State is required" }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedCountry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedCountry ? "Select city" : "Select state first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && (
            <p className="text-xs text-[#ED2525] mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
            Postal Code <span className="text-[#FF3F3F]">*</span>
          </Label>
          <Input
            placeholder="10001"
            {...register("postalCode", { required: "Postal code is required" })}
          />
          {errors.postalCode && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>
      </div>

      {/* Tax Number */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Tax Number <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Input
          placeholder="XX-XXXXXXX"
          {...register("taxNumber", { required: "Tax number is required" })}
        />
        {errors.taxNumber && (
          <p className="text-xs text-[#ED2525] mt-1">
            {errors.taxNumber.message}
          </p>
        )}
      </div>

      {/* Website URL */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Website URL <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Input
          type="url"
          placeholder="https://example.com"
          {...register("websiteUrl", { required: "Website URL is required" })}
        />
        {errors.websiteUrl && (
          <p className="text-xs text-[#ED2525] mt-1">
            {errors.websiteUrl.message}
          </p>
        )}
      </div>
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Invoice Currency <span className="text-[#FF3F3F]">*</span>
        </Label>
        <Controller
          control={control}
          name="invoiceCurrency"
          rules={{ required: "Invoice currency is required" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                {/* <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem> */}
              </SelectContent>
            </Select>
          )}
        />
        {errors.invoiceCurrency && (
          <p className="text-xs text-red-500 mt-1">
            {errors.invoiceCurrency.message}
          </p>
        )}
      </div>

      {/* Document Uploads */}
      <div className="pt-6">
        <h3 className="font-semibold text-[#0F112A] mb-2.5">
          Required Documents
        </h3>

        <div className="space-y-4">
          <FileUpload
            label="Certificate of Incorporation"
            description="PDF, DOC, or image files"
            accept={{
              "application/pdf": [".pdf"],
              "application/msword": [".doc", ".docx"],
              "image/*": [".jpg", ".jpeg", ".png"],
            }}
            onFileSelect={(files) =>
              handleFileSelect("certOfIncorporation", files)
            }
            selectedFile={selectedFiles.certOfIncorporation}
            required
          />
          {errors.certOfIncorporation && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.certOfIncorporation.message}
            </p>
          )}
          <FileUpload
            label="Proof of Address"
            description="PDF, DOC, or image files"
            accept={{
              "application/pdf": [".pdf"],
              "application/msword": [".doc", ".docx"],
              "image/*": [".jpg", ".jpeg", ".png"],
            }}
            onFileSelect={(files) => handleFileSelect("proofOfAddress", files)}
            selectedFile={selectedFiles.proofOfAddress}
            required
          />
          {errors.proofOfAddress && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.proofOfAddress.message}
            </p>
          )}
          <FileUpload
            label="ID Front"
            description="Image or PDF files"
            accept={{
              "image/*": [".jpg", ".jpeg", ".png"],
              "application/pdf": [".pdf"],
            }}
            onFileSelect={(files) => handleFileSelect("idFront", files)}
            selectedFile={selectedFiles.idFront}
            required
          />
          {errors.idFront && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.idFront.message}
            </p>
          )}
          <FileUpload
            label="ID Back"
            description="Image or PDF files"
            accept={{
              "image/*": [".jpg", ".jpeg", ".png"],
              "application/pdf": [".pdf"],
            }}
            onFileSelect={(files) => handleFileSelect("idBack", files)}
            selectedFile={selectedFiles.idBack}
            required
          />
          {errors.idBack && (
            <p className="text-xs text-[#ED2525] mt-1">
              {errors.idBack.message}
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        variant={"primary"}
        className="mt-6"
      >
        {isSubmitting ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          "Submit KYC"
        )}
      </Button>

      {/* Accept terms modal */}
      <AcceptTermsModal
        open={termsModalOpen}
        onAccept={onTermsAccepted}
        onClose={() => setTermsModalOpen(false)}
        // pass the actual KYC loading state, not the form's isSubmitting
        isSubmitting={isLoading}
      />
    </form>
  );
}
