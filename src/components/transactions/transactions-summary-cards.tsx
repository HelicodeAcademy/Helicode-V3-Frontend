"use client";

import { Minus, Plus } from "lucide-react";
import type { TransactionsFeedSummary } from "@/lib/transactions-feed-service";

interface TransactionsSummaryCardsProps {
  summary: TransactionsFeedSummary | null;
  isLoading?: boolean;
}

function formatSummaryAmount(amount: string, currency: string) {
  const value = Number.parseFloat(amount);

  if (Number.isNaN(value)) {
    return amount;
  }

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === "USD" || currency === "USDC") {
    return `$${formatted}`;
  }

  return `${formatted} ${currency}`;
}

function SummaryCardSkeleton() {
  return (
    <div className="h-30 animate-pulse rounded-xl border border-[#E4E7EC] bg-[#F9FAFB]" />
  );
}

export function TransactionsSummaryCards({
  summary,
  isLoading,
}: TransactionsSummaryCardsProps) {
  if (isLoading && !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const payInAmount = formatSummaryAmount(
    summary.payIn.totalAmount,
    summary.currency,
  );
  const payOutAmount = formatSummaryAmount(
    summary.payOut.totalAmount,
    summary.currency,
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-md bg-[#F1FCF2] p-4">
        <div className="flex items-center gap-2 text-[#12B76A]">
          <div className="rounded-full h-5 w-5 bg-[#DAEEDC] flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-[#10981C] font-bold">Pay In</span>
        </div>
        <p className="mt-2 text-[2.5rem] font-bold leading-none text-[#050505]">
          {payInAmount.split(".").map((part, index) => (
            <span key={index} className={index === 1 ? "text-[#C5C5C5]" : ""}>
              {part}
              {index === 0 && <span className="text-[#050505]">.</span>}
            </span>
          ))}
        </p>
        <p className="mt-4 font-medium text-sm text-[#10981C]">
          {summary.payIn.transactionCount} transactions
        </p>
      </div>

      <div className="rounded-md bg-[#FFF7ED] p-4">
        <div className="flex items-center gap-2 text-[#F97316]">
          <div className="rounded-full h-5 w-5 bg-[#FFEBDA] flex items-center justify-center">
            <Minus className="h-4 w-4" />
          </div>
          <span className="font-bold font-[#FF7700]">Pay Out</span>
        </div>
        <p className="mt-2 text-[2.5rem] font-bold leading-none text-[#050505]">
          {payOutAmount.split(".").map((part, index) => (
            <span key={index} className={index === 1 ? "text-[#C5C5C5]" : ""}>
              {part}
              {index === 0 && <span className="text-[#050505]">.</span>}
            </span>
          ))}
        </p>
        <p className="mt-4 text-sm font-medium text-[#FF7700]">
          {summary.payOut.transactionCount} transactions
        </p>
      </div>
    </div>
  );
}
