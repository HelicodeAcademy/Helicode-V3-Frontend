"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { SubmitCompanyKYC } from "@/lib/kyc-service";
import { useKYCStore } from "@/store/kyc-store";
import toast from "react-hot-toast";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { Country, State, City } from "country-state-city";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import { FileUpload } from "./file-upload";
import { AcceptTermsModal } from "./accept-terms";
import { Loader2 } from "lucide-react";

interface KYCFormInputs {
  fullName: string;
  address: string;
  taxNumber: string;
  websiteUrl: string;
  certOfIncorporation: FileList;
}

interface KYCFormProps {
  onSuccess?: () => void;
}

// interface Country {
//   isoCode: string;
//   name: string;
//   phonetic?: string;
// }

// interface State {
//   isoCode: string;
//   name: string;
//   countryCode: string;
//   type?: string;
// }

// interface City {
//   //   isoCode: string;
//   name: string;
//   countryCode: string;
//   type?: string;
// }

// interface KYCFormInputs {
//   fullName: string;
//   dob: Date;
//   country: string;
//   phoneNumber: string;
//   address: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   taxNumber: string;
//   websiteUrl: string;
//   invoiceCurrency: string;
//   certOfIncorporation: FileList;
//   proofOfAddress: FileList;
//   idFront: FileList;
//   idBack: FileList;
// }

// interface KYCFormProps {
//   onSuccess?: () => void;
// }

export function KYCForm({ onSuccess }: KYCFormProps) {
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<KYCFormInputs>();
  const { setKYCStatus, setIsLoading, isLoading, kycStatus } = useKYCStore();
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<KYCFormInputs | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<{
    certOfIncorporation: File | null;
  }>({
    certOfIncorporation: null,
  });

  const onSubmit = (data: KYCFormInputs) => {
    // Validate that certtifcate file is selected
    if (!selectedFiles.certOfIncorporation) {
      toast.error("Please upload Certifcae of Incorporation");
      return;
    }

    // Store the data and open the terms modal
    setPendingFormData(data);
    setTermsModalOpen(true);
  };

  const onTermsAccepted = async () => {
    if (!pendingFormData) {
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Text fields
      formData.append("fullName", pendingFormData.fullName);
      formData.append("address", pendingFormData.address);
      formData.append("taxNumber", pendingFormData.taxNumber);
      formData.append("websiteUrl", pendingFormData.websiteUrl);

      // File fields
      if (selectedFiles.certOfIncorporation) {
        formData.append(
          "certOfIncorporation",
          selectedFiles.certOfIncorporation,
        );
      }

      const result = await SubmitCompanyKYC(formData);

      setKYCStatus({
        companyKycStatus: 'submitted',
        employerKycStatus: kycStatus?.employerKycStatus || 'not_started',
        tosStatus: result.tosStatus,
        kycStatus: result.kycStatus,
        kycLink: result.kycLink,
        tosLink: result.tosLink,
        message: result.message,
        rejectionReason: null,
      })

      toast.success("Company KYC submitted successfully!");
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

  const handleFileSelect = (fieldName: string, files: FileList) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fieldName]: files.length > 0 ? files[0] : null,
    }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <Label className="text-sm font-medium text-[#0F112A] mb-2.5">
          Company Full Name <span className="text-[#FF3F3F]">*</span>
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
