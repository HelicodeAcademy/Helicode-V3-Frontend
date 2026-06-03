"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ArrowLeft } from "lucide-react";
import { BulkUploadResponse } from "@/lib/team-service";
import { BulkUploadCSV } from "./bulk-upload-csv";

interface WorkerTypeSelectionProps {
  selectedType: "employee" | "contractor" | "csv" | null;
  onSelect: (type: "employee" | "contractor" | "csv") => void;
  onProceed: () => void;
  onBulkUploadSuccess?: (data: BulkUploadResponse) => void;
}

export function WorkerTypeSelection({
  selectedType,
  onSelect,
  onProceed,
  onBulkUploadSuccess,
}: WorkerTypeSelectionProps) {
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkUploadSuccess = (data: BulkUploadResponse) => {
    onBulkUploadSuccess?.(data);
  };

  if (showBulkUpload) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => setShowBulkUpload(false)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft /> Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#101828] mb-2">
            Bulk Upload Team Members
          </h1>
          <p className="text-[#667085] text-sm">
            Upload multiple team members at once using a CSV file.
          </p>
        </div>
        <BulkUploadCSV onSuccess={handleBulkUploadSuccess} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="max-w-112.5 w-full">
        <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2 leading-[125%]">
          Who would you like to add to your team?
        </h1>
        <p className="text-[#444444] text-sm mb-8">
          Select how you&apos;d like to classify this worker.
        </p>

        <div className="space-y-6">
          {/* Employee Option */}
          <button
            type="button"
            onClick={() => onSelect("employee")}
            className={`w-full text-left p-6 rounded-lg border transition-all ${
              selectedType === "employee"
                ? "border-[#0166f4] bg-[#f0f6ff]"
                : "border-[#e4e7ec] hover:border-[#d0d5dd]"
            }`}
          >
            <div className="flex gap-5 items-start">
              <div
                className={`mt-1 h-5 w-5 rounded-full border shrink-0 ${
                  selectedType === "employee"
                    ? "border-[#0052FF] bg-[#0052FF1A]"
                    : "border-[#E4E7EC]"
                }`}
              ></div>
              <div>
                <h3 className="font-medium text-[#0F112A] text-lg">
                  An employee
                </h3>
                <p className="text-sm text-[#475367] mt-2">
                  Full-time or part-time team members on your payroll. They
                  receive benefits, have taxes withheld, and work under your
                  company&apos;s direction.
                </p>
              </div>
            </div>
          </button>

          {/* Contractor Option */}
          <button
            type="button"
            onClick={() => onSelect("contractor")}
            className={`w-full text-left p-6 rounded-lg border transition-all ${
              selectedType === "contractor"
                ? "border-[#0166f4] bg-[#f0f6ff]"
                : "border-[#E4E7EC] hover:border-[#d0d5dd]"
            }`}
          >
            <div className="flex items-start gap-5">
              <div
                className={`mt-1 h-5 w-5 rounded-full border shrink-0 ${
                  selectedType === "contractor"
                    ? "border-[#0052FF] bg-[#0052FF1A]"
                    : "border-[#d0d5dd]"
                }`}
              ></div>
              <div>
                <h3 className="font-medium text-[#0F112A] text-lg">
                  A Contractor
                </h3>
                <p className="text-sm text-[#475367] mt-2">
                  Independent workers who provide services under a contract.
                  They manage their own taxes, set their own schedules, and
                  typically work on specific projects.
                </p>
              </div>
            </div>
          </button>

          {/* Bulk upload option */}
          <button
            type="button"
            onClick={() => setShowBulkUpload(true)}
            className={`w-full text-left p-6 rounded-lg border transition-all ${
              selectedType === "csv"
                ? "border-[#0166f4] bg-[#f0f6ff]"
                : "border-[#E4E7EC] hover:border-[#d0d5dd]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex items-center justify-center">
                <Upload
                  className={`h-4 w-4 ${selectedType === "csv" ? "text-[#0166f4]" : "text-[#667085]"}`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-[#101828]">Upload CSV</h3>
                <p className="text-sm text-[#667085] mt-1">
                  Bulk upload multiple team members at once using a CSV file.
                  Perfect for importing from your existing team data.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-10 flex justify-end">
          <Button
            onClick={onProceed}
            disabled={!selectedType || selectedType === "csv"}
            variant={"primary"}
            className="hover:bg-[#101828]/90"
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
}
