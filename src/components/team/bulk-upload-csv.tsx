"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BulkUploadResponse,
  downloadSampleCSV,
  bulkUploadTeamMembersFromCSV,
} from "@/lib/team-service";
import toast from "react-hot-toast";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface BulkUploadCSVProps {
  onSuccess?: (data: BulkUploadResponse) => void;
}

export function BulkUploadCSV({ onSuccess }: BulkUploadCSVProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(
    null,
  );
  const [dragActive, setDragActive] = useState(false);

  const handleDownloadSample = async () => {
    try {
      setIsDownloadingSample(true);
      await downloadSampleCSV();
      toast.success("Sample CSV downloaded successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to download sample CSV";
      toast.error(errorMessage);
      console.error("Sample CSV download error:", error);
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      setIsUploading(true);
      const result = await bulkUploadTeamMembersFromCSV(file);
      setUploadResult(result);

      if (result.result.failed.length === 0) {
        toast.success(
          `Successfully uploaded ${result.acceptedCount} team members!`,
        );
      } else {
        toast.success(
          `Uploaded ${result.acceptedCount} members with ${result.rejectedCount} failures`,
        );
      }

      onSuccess?.(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload CSV";
      toast.error(errorMessage);
      console.error("CSV upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Sample Section */}
      <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#101828] text-sm">
              Download Sample CSV
            </h3>
            <p className="text-[#667085] text-xs mt-1">
              Download a template CSV file to see the correct format and headers
              required.
            </p>
          </div>
          <Button
            onClick={handleDownloadSample}
            disabled={isDownloadingSample}
            className="whitespace-nowrap"
            size="sm"
          >
            {isDownloadingSample ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? "border-[#0084FD] bg-[#f0f6ff]"
            : "border-[#d0d5dd] bg-white hover:border-[#b3b9c4]"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          disabled={isUploading}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer block">
          <div className="flex justify-center mb-3">
            <Upload className="h-8 w-8 text-[#667085]" />
          </div>
          <h3 className="font-semibold text-[#101828] mb-1">Upload CSV File</h3>
          <p className="text-[#667085] text-sm mb-4">
            Drag and drop your CSV file here, or click to select
          </p>
          <Button disabled={isUploading} className="" size="sm">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Select CSV File"
            )}
          </Button>
        </label>
      </div>

      {/* Results Section */}
      {uploadResult && (
        <div className="space-y-4">
          <div className="bg-[#f0f6ff] border border-[#b3d9f2] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#0084FD] mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-[#101828]">Upload Summary</h3>
                <p className="text-[#667085] text-sm mt-1">
                  {uploadResult.result.message}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-[#667085]">Parsed</p>
                    <p className="text-lg font-semibold text-[#101828]">
                      {uploadResult.parsedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#667085]">Accepted</p>
                    <p className="text-lg font-semibold text-[#219d53]">
                      {uploadResult.acceptedCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#667085]">Rejected</p>
                    <p className="text-lg font-semibold text-[#f04438]">
                      {uploadResult.rejectedCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Successful Members */}
          {uploadResult.result.successful.length > 0 && (
            <div className="border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="font-semibold text-[#101828] mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#219d53]" />
                Successfully Invited ({uploadResult.result.successful.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadResult.result.successful.map((member, index) => (
                  <div
                    key={index}
                    className="bg-[#f9fafb] p-3 rounded border border-[#e5e7eb]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[#101828]">
                          {member.memberFirstName} {member.memberLastName}
                        </p>
                        <p className="text-xs text-[#667085]">{member.email}</p>
                        <p className="text-xs text-[#667085]">
                          {member.memberType} • {member.memberRole}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono bg-[#e5e7eb] px-2 py-1 rounded text-[#344054]">
                          OTP: {member.otp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Members */}
          {uploadResult.result.failed.length > 0 && (
            <div className="border border-[#fecaca] rounded-lg p-4 bg-[#fef2f2]">
              <h3 className="font-semibold text-[#101828] mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#f04438]" />
                Failed Uploads ({uploadResult.result.failed.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadResult.result.failed.map((failure, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded border border-[#fecaca]"
                  >
                    <p className="text-sm font-medium text-[#101828]">
                      {failure.email}
                    </p>
                    <p className="text-xs text-[#f04438]">{failure.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
