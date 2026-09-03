"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Copy, Check } from "lucide-react";
import {
  getCompanyBankPayout,
  type CompanyOfframpBank,
} from "@/lib/company-offramp-service";

interface CompanyOfframpViewBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg bg-[#F9FAFB] border border-[#F2F2F2] px-4 py-3">
      <p className="text-xs text-[#667085] mb-1">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#101928] break-all">{value}</p>
        <button
          onClick={handleCopy}
          className="shrink-0 text-[#667085] hover:text-[#101928] transition-colors"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="rounded-lg bg-[#F9FAFB] border border-[#F2F2F2] px-4 py-3">
      <div className="h-3 w-20 bg-[#e9eaec] rounded animate-pulse mb-2" />
      <div className="h-4 w-40 bg-[#e9eaec] rounded animate-pulse" />
    </div>
  );
}

export function CompanyOfframpViewBankModal({
  open,
  onOpenChange,
}: CompanyOfframpViewBankModalProps) {
  const [bank, setBank] = useState<CompanyOfframpBank | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const fetchBank = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCompanyBankPayout();
        if (!cancelled) setBank(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load bank details.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchBank();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const countryName = bank
    ? (new Intl.DisplayNames(["en"], { type: "region" }).of(bank.country) ??
      bank.country)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md gap-0 p-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Bank payout details</DialogTitle>

        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#F2F2F2]">
          <div>
            <h2 className="text-lg font-semibold text-[#101928]">
              Bank payout details
            </h2>
            <p className="text-sm text-[#667085] mt-0.5">
              Your linked bank account for local withdrawals
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors mt-0.5"
          >
            <X className="h-4 w-4 text-[#667085]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : isLoading || !bank ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonField key={i} />)
          ) : (
            <>
              <CopyField label="Bank name" value={bank.bankName} />
              <CopyField label="Account name" value={bank.accountName} />
              <CopyField label="Account number" value={bank.accountNumber} />
              <CopyField label="Currency" value={bank.currencyCode} />
              {bank.bankBranch ? (
                <CopyField label="Bank branch" value={bank.bankBranch} />
              ) : null}
              <CopyField label="Country" value={countryName} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
