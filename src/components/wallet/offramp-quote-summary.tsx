"use client";

import {
  formatLocalAmount,
  formatUsdc,
  type OfframpCryptoQuote,
  type OfframpFiatQuote,
} from "@/lib/offramp-fee";

function QuoteRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 ${emphasize ? "border-t border-[#eaeaea] pt-2" : ""}`}
    >
      <span className="text-[#667085]">{label}</span>
      <span
        className={
          emphasize
            ? "text-base font-bold text-[#0166f4] text-right"
            : "font-medium text-[#101828] text-right"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function OfframpFiatQuoteSummary({ quote }: { quote: OfframpFiatQuote }) {
  const feeLocal = quote.feeLocal ?? 0;
  const feeUsdc = quote.feeUsdc ?? 0;
  const amountUsdc = quote.amountUsdc ?? 0;

  return (
    <div className="mt-3 rounded-lg border border-[#e0e0e0] bg-[#f9fafb] p-4 space-y-3">
      <p className="text-sm font-medium text-[#101828]">Quote Summary</p>
      <div className="space-y-2 text-xs">
        <QuoteRow
          label="Exchange Rate"
          value={`1 USDC = ${quote.rate.toFixed(4)} ${quote.currency}`}
        />
        <QuoteRow label="You send" value={`${formatUsdc(amountUsdc)} USDC`} />
        <QuoteRow
          label="Helicode fee"
          value={`${formatLocalAmount(feeLocal)} ${quote.currency} (${formatUsdc(feeUsdc)} USDC)`}
        />
        <QuoteRow
          label="You receive"
          value={`${formatLocalAmount(quote.amountReceived)} ${quote.currency}`}
          emphasize
        />
      </div>
    </div>
  );
}

export function OfframpCryptoQuoteSummary({
  quote,
}: {
  quote: OfframpCryptoQuote;
}) {
  const amountUsdc = quote.amountUsdc ?? 0;
  const feeUsdc = quote.feeUsdc ?? 0;
  const netUsdc = quote.netUsdc ?? quote.amountReceived ?? 0;

  return (
    <div className="mt-3 rounded-lg border border-[#e0e0e0] bg-[#f9fafb] p-4 space-y-3">
      <p className="text-sm font-medium text-[#101828]">Quote Summary</p>
      <div className="space-y-2 text-xs">
        <QuoteRow label="You send" value={`${formatUsdc(amountUsdc)} USDC`} />
        <QuoteRow
          label="Helicode fee"
          value={`${formatUsdc(feeUsdc)} USDC`}
        />
        <QuoteRow
          label="Destination receives"
          value={`${formatUsdc(netUsdc)} USDC`}
          emphasize
        />
      </div>
    </div>
  );
}
