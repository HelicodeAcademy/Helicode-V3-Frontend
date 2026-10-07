"use client";

import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CompanyFeedTransaction } from "@/lib/transactions-feed-service";

interface TransactionDetailSheetProps {
  transaction: CompanyFeedTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusStyles: Record<string, string> = {
  Success:
    "bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC]",
  Pending:
    "bg-[#FFEFE2] text-[#EE7D1F] border border-[#E5D7CB]",
  Failed:
    "bg-[#FDECEC] text-[#D32828] border border-[#F0D0D0]",
};

function formatKind(kind: string) {
  return kind
    .toLowerCase()
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPaymentMethodLabel(paymentMethod: string) {
  const normalized = paymentMethod.toLowerCase();

  if (
    normalized.includes("fiat") ||
    normalized.includes("offramp") ||
    normalized.includes("local bank") ||
    normalized.includes("company_fiat_offramp")
  ) {
    return "Local bank withdrawal";
  }

  if (normalized.includes("crypto") || normalized.includes("wallet")) {
    return "Crypto";
  }

  return paymentMethod;
}

function formatAmount(transaction: CompanyFeedTransaction) {
  if (transaction.localAmount && transaction.localCurrency) {
    const prefix = transaction.type === "Received" ? "+" : "−";
    return `${prefix}${transaction.localAmount} ${transaction.localCurrency}`;
  }

  const value = Number.parseFloat(transaction.amount);
  const formatted = Number.isNaN(value)
    ? transaction.amount
    : value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  const currency =
    transaction.currency === "USDC" ? "USD" : transaction.currency;

  if (transaction.type === "Received") {
    return `+$${formatted} ${currency}`;
  }

  return `−$${formatted} ${currency}`;
}

function displayValue(value: string | null | undefined) {
  if (value == null || value.trim() === "") return null;
  return value;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  const display = displayValue(value);
  if (!display) return null;

  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <dt className="shrink-0 text-sm text-[#667085]">{label}</dt>
      <dd
        className={`min-w-0 text-right text-sm font-medium text-[#101928] break-all ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {display}
      </dd>
    </div>
  );
}

function PartyCard({
  label,
  name,
  kind,
}: {
  label: string;
  name: string | null | undefined;
  kind: string | undefined;
}) {
  if (!kind && !displayValue(name)) return null;

  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#98A2B3]">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-[#101928]">
        {displayValue(name) ?? "Unknown"}
      </p>
      {kind && (
        <span className="mt-2 inline-flex rounded-md bg-white px-2 py-0.5 text-xs font-medium text-[#667085] ring-1 ring-[#E4E7EC]">
          {formatKind(kind)}
        </span>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#98A2B3]">
        {title}
      </h3>
      <dl className="divide-y divide-[#F2F4F7]">{children}</dl>
    </section>
  );
}

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  const isReceived = transaction?.type === "Received";
  const amountTone = isReceived ? "text-[#039855]" : "text-[#101928]";
  const sourceEntries = [
    { label: "Method", value: transaction?.source?.method },
    { label: "Institution", value: transaction?.source?.institution },
    { label: "Account", value: transaction?.source?.account },
    { label: "Reference", value: transaction?.source?.reference },
  ].filter((entry) => displayValue(entry.value));

  const copyId = async () => {
    if (!transaction) return;
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      toast.success("Transaction ID copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy ID");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-[#E4E7EC] p-0 sm:max-w-md"
      >
        {transaction && (
          <>
            <SheetHeader className="border-b border-[#E4E7EC] px-6 py-5 pr-12 text-left">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F7]">
                  <Image
                    src={
                      isReceived
                        ? "/transaction/received.svg"
                        : "/transaction/sent.svg"
                    }
                    alt=""
                    width={24}
                    height={24}
                  />
                </span>
                <div className="min-w-0">
                  <SheetTitle className="text-base font-semibold text-[#101928]">
                    {transaction.type} payment
                  </SheetTitle>
                  <SheetDescription className="mt-0.5 text-sm text-[#667085]">
                    {transaction.dateDisplay}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="rounded-2xl border border-[#E4E7EC] bg-linear-to-b from-[#F9FAFB] to-white px-5 py-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-[#98A2B3]">
                  Amount
                </p>
                <p
                  className={`mt-2 text-3xl font-semibold tracking-tight ${amountTone}`}
                >
                  {formatAmount(transaction)}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[transaction.status] ?? statusStyles.Pending
                    }`}
                  >
                    {transaction.status}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#E4E7EC] bg-white px-2.5 py-1 text-xs font-medium text-[#667085]">
                    {formatPaymentMethodLabel(transaction.paymentMethod)}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PartyCard
                  label="From"
                  name={transaction.sender?.name}
                  kind={transaction.sender?.kind}
                />
                <PartyCard
                  label="To"
                  name={transaction.receiver?.name}
                  kind={transaction.receiver?.kind}
                />
              </div>

              <div className="mt-8 space-y-8">
                <Section title="Details">
                  <DetailRow label="Date" value={transaction.dateDisplay} />
                  <DetailRow
                    label="Payment method"
                    value={formatPaymentMethodLabel(transaction.paymentMethod)}
                  />
                  <DetailRow
                    label="Currency"
                    value={
                      transaction.localCurrency ||
                      (transaction.currency === "USDC"
                        ? "USD"
                        : transaction.currency)
                    }
                  />
                  {transaction.localAmount && transaction.localCurrency && (
                    <DetailRow
                      label="Settlement"
                      value={`${transaction.amount} ${transaction.currency}`}
                    />
                  )}
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="shrink-0 text-sm text-[#667085]">
                      Transaction ID
                    </dt>
                    <dd className="flex min-w-0 items-start gap-2">
                      <span className="break-all text-right font-mono text-[12px] font-medium text-[#101928]">
                        {transaction.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copyId()}
                        className="mt-0.5 shrink-0 rounded-md p-1 text-[#667085] transition-colors hover:bg-[#F2F4F7] hover:text-[#101928]"
                        aria-label="Copy transaction ID"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-[#039855]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </dd>
                  </div>
                </Section>

                {sourceEntries.length > 0 && (
                  <Section title="Source">
                    {sourceEntries.map((entry) => (
                      <DetailRow
                        key={entry.label}
                        label={entry.label}
                        value={entry.value}
                        mono={
                          entry.label === "Account" ||
                          entry.label === "Reference"
                        }
                      />
                    ))}
                  </Section>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
