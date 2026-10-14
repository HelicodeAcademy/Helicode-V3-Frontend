"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  verifyStatement,
  type StatementSummary,
  type StatementVerification,
} from "@/lib/statements-service";

function formatWhen(value: string) {
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

function money(amount: string | null | undefined) {
  if (amount == null || amount === "") return "—";
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) return amount;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function summaryRows(statement: StatementVerification) {
  const summary: StatementSummary = statement.summary ?? {};
  if (statement.type === "PAYROLL") {
    const hideTotals = (summary.paymentsWithoutFee ?? 0) > 0;
    return [
      ["Total paid", money(summary.totalPaid)],
      ["Fees", hideTotals ? "—" : money(summary.fees)],
      ["Total cost", hideTotals ? "—" : money(summary.totalCost)],
      ["Payments", String(summary.paymentCount ?? "—")],
      ["People", String(summary.peopleCount ?? "—")],
    ];
  }

  if (statement.currency === "EUR") {
    return [
      ["Money in", summary.moneyIn ? `€${summary.moneyIn}` : "—"],
      ["Converted", money(summary.convertedUsd)],
      ["Transactions", String(summary.transactionCount ?? "—")],
    ];
  }

  return [
    ["Opening balance", money(summary.openingBalance)],
    ["Money in", money(summary.moneyIn)],
    ["Money out", money(summary.moneyOut)],
    ["Closing balance", money(summary.closingBalance)],
    ["Transactions", String(summary.transactionCount ?? "—")],
  ];
}

export default function VerifyStatementPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const [statement, setStatement] = useState<StatementVerification | null>(
    null,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    void verifyStatement(code)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setFailed(true);
          return;
        }
        setStatement(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-16 text-[#101828]">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-[#EAECF0] bg-white p-8">
        <p className="text-sm font-medium text-[#0052FF]">Helicode</p>
        <h1 className="mt-2 text-2xl font-semibold">Verify this statement</h1>

        {!statement && !failed && (
          <p className="mt-6 text-sm text-[#667085]">Checking {code}…</p>
        )}

        {failed && (
          <p className="mt-6 text-sm text-[#667085]">
            We could not verify this statement.
          </p>
        )}

        {statement && (
          <div className="mt-6">
            <p className="text-lg font-semibold">{statement.company}</p>
            <p className="mt-1 text-sm text-[#667085]">
              {statement.type === "PAYROLL" ? "Payroll" : "Account"} statement
              {statement.currency ? ` · ${statement.currency}` : ""} ·{" "}
              {statement.number}
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              {formatWhen(statement.period.from)} –{" "}
              {formatWhen(statement.period.to)}
            </p>

            <dl className="mt-6 divide-y divide-[#F2F4F7] border-y border-[#F2F4F7]">
              {summaryRows(statement).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <dt className="text-[#667085]">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-[#667085]">Generated</dt>
                <dd className="font-medium">
                  {formatWhen(statement.generatedAt)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 break-all font-mono text-xs text-[#667085]">
              {statement.sha256}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}