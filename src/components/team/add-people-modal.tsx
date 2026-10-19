"use client";

import { FileSpreadsheet, FileText, UserRound, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function AddPeopleModal({
  open,
  onOpenChange,
  companyName,
  onEmployee,
  onContractor,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onEmployee: () => void;
  onContractor: () => void;
  onImport: () => void;
}) {
  const options = [
    {
      key: "employee",
      icon: UserRound,
      title: "Employee",
      description: "Full-time or part-time, paid on your payroll",
      onClick: onEmployee,
    },
    {
      key: "contractor",
      icon: FileText,
      title: "Contractor",
      description: "Freelancers & agencies paid per invoice or monthly",
      onClick: onContractor,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-[440px]">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <DialogTitle className="text-base font-semibold text-[#101828]">
              Add people
            </DialogTitle>
            <p className="mt-1 text-sm text-[#667085]">
              Choose how you want to add someone
              {companyName ? ` to ${companyName}` : ""}.
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

        <div className="space-y-3 px-5 py-5">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                type="button"
                onClick={option.onClick}
                className="flex w-full items-center gap-3 rounded-xl border border-[#EAECF0] px-4 py-3 text-left hover:bg-[#F9FAFB]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAECF0] text-[#344054]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#101828]">
                    {option.title}
                  </span>
                  <span className="block text-sm text-[#667085]">
                    {option.description}
                  </span>
                </span>
                <span className="text-[#98A2B3]">›</span>
              </button>
            );
          })}

          <div className="flex items-center gap-3 py-1 text-xs text-[#98A2B3]">
            <span className="h-px flex-1 bg-[#EAECF0]" />
            or add in bulk
            <span className="h-px flex-1 bg-[#EAECF0]" />
          </div>

          <button
            type="button"
            onClick={onImport}
            className="flex w-full items-center gap-3 rounded-xl border border-[#EAECF0] px-4 py-3 text-left hover:bg-[#F9FAFB]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAECF0] text-[#344054]">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                Import from CSV
                <span className="rounded-full bg-[#EFF4FF] px-1.5 py-0.5 text-[10px] font-semibold text-[#0052FF]">
                  Bulk
                </span>
              </span>
              <span className="block text-sm text-[#667085]">
                Add your whole team at once from a spreadsheet
              </span>
            </span>
            <span className="text-[#98A2B3]">›</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
