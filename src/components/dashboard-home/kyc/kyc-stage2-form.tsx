"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { submitEmployerDocuments } from "@/lib/kyc-service";
import { useKYCStore } from "@/store/kyc-store";
import toast from "react-hot-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { FileUpload } from "./file-upload";

interface Stage2FormInputs {
  dob: Date;
  proofOfAddress: FileList;
  idFront: FileList;
  idBack: FileList;
}

interface KYCStage2FormProps {
  onSuccess?: () => void;
}

export function KYCStage2Form({ onSuccess }: KYCStage2FormProps) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Stage2FormInputs>({
    defaultValues: {
      dob: undefined,
    },
  });
  const { setIsLoading, setKYCStatus } = useKYCStore();
  const [dobOpen, setDobOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    proofOfAddress: File | null;
    idFront: File | null;
    idBack: File | null;
  }>({
    proofOfAddress: null,
    idFront: null,
    idBack: null,
  });

  const onSubmit = (data: Stage2FormInputs) => {
    // Validate that all files are selected
    if (!selectedFiles.proofOfAddress) {
      toast.error("Please upload Proof of Address");
      return;
    }
    if (!selectedFiles.idFront) {
      toast.error("Please upload ID Front");
      return;
    }
    if (!selectedFiles.idBack) {
      toast.error("Please upload ID Back");
      return;
    }

    submitEmployerDocumentsForm(data);
  };

  const submitEmployerDocumentsForm = async (data: Stage2FormInputs) => {
    try {
      setIsLoading(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Text fields
      formData.append("dob", format(data.dob, "yyyy-MM-dd"));

      // File fields
      if (selectedFiles.proofOfAddress) {
        formData.append("proofOfAddress", selectedFiles.proofOfAddress);
      }
      if (selectedFiles.idFront) {
        formData.append("idFront", selectedFiles.idFront);
      }
      if (selectedFiles.idBack) {
        formData.append("idBack", selectedFiles.idBack);
      }

      // Submit Employer Documents (Stage 2)
      const result = await submitEmployerDocuments(formData);
      setKYCStatus({
        employerKycStatus: result.employerKycStatus,
        message: result.message,
      });

      toast.success("Employer documents submitted successfully!");
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit employer documents";
      toast.error(errorMessage);
      console.error("Employer documents submission error:", error);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Date of Birth with Popover */}
      <div>
        <Label className="text-sm font-medium text-[#101828]">
          Date of Birth <span className="text-red-500">*</span>
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
                  className="mt-2 h-11 w-full justify-start text-left font-normal border-[#d0d5dd]"
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
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.dob && (
          <p className="text-xs text-red-500 mt-1">{errors.dob.message}</p>
        )}
      </div>

      {/* Document Uploads */}
      <div className="border-t border-[#eaeaea] pt-6">
        <h3 className="font-semibold text-[#101828] mb-4">
          Personal Documents
        </h3>

        <div className="space-y-4">
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
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#0166f4] text-white rounded-lg hover:bg-[#0166f4]/90 mt-6"
      >
        {isSubmitting ? "Submitting..." : "Submit Documents"}
      </Button>
    </form>
  );
}
