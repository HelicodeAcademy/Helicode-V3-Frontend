"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileUp, CheckCircle2, X } from "lucide-react";

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: Record<string, string[]>;
  onFileSelect: (files: FileList) => void;
  selectedFile?: File | null;
  required?: boolean;
}

export function FileUpload({
  label,
  description,
  accept,
  onFileSelect,
  selectedFile,
  required = false,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Create a FileList-like object
        const dataTransfer = new DataTransfer();
        acceptedFiles.forEach((file) => dataTransfer.items.add(file));
        onFileSelect(dataTransfer.files);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  const handleRemove = () => {
    const dataTransfer = new DataTransfer();
    onFileSelect(dataTransfer.files);
  };

  return (
    <div>
      <label className="text-sm font-medium text-[#0F112A] mb-2.5">
        {label} {required && <span className="text-[#FF3F3F]">*</span>}
      </label>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragActive
              ? "border-[#0166f4] bg-[#dde8ff]"
              : "border-[#d0d5dd] hover:border-[#0166f4]"
          }`}
        >
          <input {...getInputProps()} />
          <FileUp className="h-8 w-8 text-[#667085] mx-auto mb-2" />
          <p className="text-sm text-[#0166f4] font-medium">Click to upload</p>
          {description && (
            <p className="text-xs text-[#667085] mt-1">{description}</p>
          )}
        </div>
      ) : (
        <div className="mt-2 border border-[#e0e0e0] rounded-lg p-4 bg-[#f9fafb]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#101828] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#667085]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleRemove}
              className="h-8 w-8"
            >
              <X className="h-4 w-4 text-[#667085]" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
