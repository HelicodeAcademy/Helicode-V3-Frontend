"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Download, FileSpreadsheet, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  bulkUploadTeamMembersFromCSV,
  downloadSampleCSV,
} from "@/lib/team-service";

const COLUMNS = [
  { name: "full_name", required: true },
  { name: "email", required: true },
  { name: "type", required: true },
  { name: "country", required: true },
  { name: "pay_amount", required: true },
  { name: "currency", required: true },
  { name: "start_date", required: true },
  { name: "job_title", required: false },
  { name: "pay_schedule", required: false },
];

const MAX_BYTES = 5 * 1024 * 1024;

export function ImportCsvModal({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const chooseFile = (next: File | null) => {
    if (!next) return;
    const name = next.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      toast.error("Use a .csv or .xlsx file");
      return;
    }
    if (next.size > MAX_BYTES) {
      toast.error("File must be 5 MB or smaller");
      return;
    }
    setFile(next);
  };

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);
      await downloadSampleCSV();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download template",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const continueImport = async () => {
    if (!file) return;
    try {
      setIsUploading(true);
      const result = await bulkUploadTeamMembersFromCSV(file);
      toast.success(
        result.result?.message || `Imported ${result.acceptedCount} people`,
      );
      setFile(null);
      onOpenChange(false);
      onImported();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import CSV",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setFile(null);
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-140">
        <div className="flex items-start gap-3 px-5 pt-5">
          <button
            type="button"
            aria-label="Back"
            onClick={() => onOpenChange(false)}
            className="mt-1 text-[#3F3F46] border p-1 rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" color="#3F3F46" />
          </button>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold text-[#101828]">
              Import from CSV
            </DialogTitle>
            <p className="mt-1 text-sm text-[#667085]">
              Upload a spreadsheet to add employees and contractors in one go.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="text-[#98A2B3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3 px-5 text-sm">
          <span className="flex items-center gap-2 font-medium text-[#101828]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101828] text-[11px] text-white">
              1
            </span>
            Upload
          </span>
          <span className="h-px flex-1 bg-[#EAECF0]" />
          <span className="flex items-center gap-2 text-[#98A2B3]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#D0D5DD] text-[11px]">
              2
            </span>
            Match columns
          </span>
          <span className="h-px flex-1 bg-[#EAECF0]" />
          <span className="flex items-center gap-2 text-[#98A2B3]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#D0D5DD] text-[11px]">
              3
            </span>
            Review & invite
          </span>
        </div>

        <div className="px-5 py-5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className="flex w-full flex-col items-center rounded-xl border border-dashed border-[#D0D5DD] bg-[#F9FAFB] px-6 py-10 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAECF0] bg-white text-[#667085]">
              <Upload className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-medium text-[#101828]">
              {file ? (
                file.name
              ) : (
                <>
                  Drop your CSV here, or{" "}
                  <span className="text-[#0052FF]">browse</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-[#98A2B3]">
              .csv or .xlsx · up to 500 people · max 5 MB
            </p>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#101828]">
              Columns we look for
            </p>
            <p className="text-xs text-[#98A2B3]">Order doesn&apos;t matter</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLUMNS.map((column) => (
              <span
                key={column.name}
                className="rounded-md border border-[#EAECF0] bg-white px-2 py-1 text-xs text-[#344054]"
              >
                {column.name}
                {column.required && <span className="text-[#F04438]">*</span>}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#EAECF0] px-3 py-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-[#12B76A]" />
              <div>
                <p className="text-sm font-medium text-[#101828]">
                  helicode-team-template.csv
                </p>
                <p className="text-xs text-[#667085]">
                  Pre-filled headers and 2 example rows
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isDownloading}
              onClick={() => void downloadTemplate()}
              className="h-9 rounded-lg border-[#D0D5DD] bg-white text-sm font-medium text-[#344054]"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#EAECF0] px-5 py-4">
          <p className="text-xs text-[#667085]">
            Invites go out only after you review.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-lg border-[#D0D5DD] bg-white text-sm text-[#344054]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!file || isUploading}
              onClick={() => void continueImport()}
              className="h-9 rounded-lg bg-[#101828] text-sm text-white hover:bg-[#101828]/90 disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
