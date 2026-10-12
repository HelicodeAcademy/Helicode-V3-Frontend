"use client";

import { useState } from "react";
import { Check, Copy, Download, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadAccountLetter } from "@/lib/account-documents";
import { formatAccountNumber } from "@/lib/account-format";
import type { AccountDetails } from "@/lib/accounts-service";
import { CurrencyMark } from "./currency-mark";

interface ReceiveDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  accountName: string;
  details: AccountDetails;
}

function FieldRow({
  label,
  value,
  display,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  display?: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#EAECF0] px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-xs text-[#667085]">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#101828] break-all">
          {display || value}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#667085]"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#039855]" />
            <span className="text-[#039855]">Copied</span>
          </>
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function ReceiveDetailsModal({
  open,
  onOpenChange,
  currency,
  accountName,
  details,
}: ReceiveDetailsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fields = [
    details.accountName
      ? { key: "holder", label: "Account holder", value: details.accountName }
      : null,
    details.accountNumber
      ? {
          key: "number",
          label: "Account number",
          value: details.accountNumber,
          display: formatAccountNumber(details.accountNumber),
        }
      : null,
    details.routingNumber
      ? {
          key: "ach",
          label: "ACH routing number",
          value: details.routingNumber,
        }
      : null,
    details.routingNumber
      ? {
          key: "wire",
          label: "Wire routing number",
          value: details.routingNumber,
        }
      : null,
    details.iban
      ? { key: "iban", label: "IBAN", value: details.iban }
      : null,
    details.bic ? { key: "bic", label: "BIC", value: details.bic } : null,
    details.bankName
      ? { key: "bank", label: "Bank name", value: details.bankName }
      : null,
    details.bankAddress
      ? { key: "address", label: "Bank address", value: details.bankAddress }
      : null,
    details.beneficiaryAddress
      ? {
          key: "beneficiary",
          label: "Beneficiary address",
          value: details.beneficiaryAddress,
        }
      : null,
  ].filter((field): field is NonNullable<typeof field> => Boolean(field));

  const copyValue = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1600);
  };

  const copyAll = async () => {
    const text = fields
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Account details copied");
  };

  const email = () => {
    const body = encodeURIComponent(
      fields.map((field) => `${field.label}: ${field.value}`).join("\n"),
    );
    const subject = encodeURIComponent(`${accountName} account details`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <div className="flex items-start gap-3 border-b border-[#EAECF0] px-5 py-4 pr-12">
          <CurrencyMark currency={currency} size={36} />
          <div>
            <DialogTitle className="text-base font-semibold text-[#101828]">
              Receive {currency}
            </DialogTitle>
            <p className="mt-0.5 text-sm text-[#667085]">
              Share these details to get paid into your {accountName} account.
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
            {fields.map((field) => (
              <FieldRow
                key={field.key}
                label={field.label}
                value={field.value}
                display={field.display}
                copied={copiedKey === field.key}
                onCopy={() => void copyValue(field.key, field.value)}
              />
            ))}
          </div>

          {currency === "USD" && (
            <p className="mt-3 flex gap-2 text-xs leading-5 text-[#667085]">
              <span className="mt-0.5">ⓘ</span>
              Payments usually arrive same day by wire, 1–2 business days by ACH.
              Helicode never asks for these details by email.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#EAECF0] px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-[#D0D5DD]"
            onClick={email}
          >
            <Mail className="h-4 w-4" />
            Email details
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-[#D0D5DD]"
            onClick={() =>
              downloadAccountLetter(
                currency,
                `Receive ${currency}`,
                fields.map((field) => ({
                  label: field.label,
                  value: field.value,
                })),
              )
            }
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
            onClick={() => void copyAll()}
          >
            <Copy className="h-4 w-4" />
            Copy all
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
