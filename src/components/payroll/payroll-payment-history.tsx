"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import toast from "react-hot-toast";
import { format, subDays } from "date-fns";
import { jsPDF } from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPaymentHistory,
  type PaymentHistoryPagination,
  type PaymentHistoryRow,
} from "@/lib/transaction-service";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function formatMoney(amount: string | number) {
  const value = typeof amount === "number" ? amount : Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  return `$${safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

function titleCasePaymentType(value: string | null) {
  if (!value) return null;
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function frequencyLabel(frequency: string) {
  const base = frequency.charAt(0) + frequency.slice(1).toLowerCase();
  return `${base} run`;
}

function paymentTitle(row: PaymentHistoryRow) {
  if (row.type === "ONE_TIME") {
    return row.recipient?.name ?? "One-time payment";
  }
  return row.group?.name ?? "Payroll run";
}

function paymentSubtitle(row: PaymentHistoryRow) {
  if (row.type === "ONE_TIME") {
    const typeLabel = titleCasePaymentType(row.paymentType);
    const role = row.recipient?.role;
    if (typeLabel && role) return `${typeLabel} · ${role}`;
    if (typeLabel) return typeLabel;
    if (role) return role;
    return null;
  }

  const freq = row.group?.frequency
    ? frequencyLabel(row.group.frequency)
    : "Payroll run";
  if (row.scheduledFor) {
    const month = format(new Date(row.scheduledFor), "MMMM");
    return `${freq} · ${month}`;
  }
  return freq;
}

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }
  if (end < total - 1) items.push("ellipsis");
  items.push(total);

  return items;
}

function rangeToFrom(range: string) {
  const days = Number(range);
  return format(subDays(new Date(), Number.isFinite(days) ? days : 90), "yyyy-MM-dd");
}

export function PayrollPaymentHistory() {
  const [rows, setRows] = useState<PaymentHistoryRow[]>([]);
  const [pagination, setPagination] = useState<PaymentHistoryPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("90");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPaymentHistory({
        page,
        limit: PAGE_SIZE,
        from: rangeToFrom(range),
      });
      setRows(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load payment history",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, range]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRangeChange = (value: string) => {
    setRange(value);
    setPage(1);
  };

  const downloadReceipt = (row: PaymentHistoryRow) => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Payment receipt", 20, 20);
    pdf.setFontSize(12);
    let y = 40;
    const lines = [
      `Reference: ${row.reference}`,
      `Payment: ${paymentTitle(row)}`,
      `Type: ${row.type === "ONE_TIME" ? "One-time" : "Payroll run"}`,
      `People: ${row.peopleCount}`,
      `Date: ${formatDisplayDate(row.date)}`,
      `Status: ${row.status}`,
      `Amount: ${formatMoney(row.amount)}`,
    ];
    if (row.fee) lines.push(`Fee: ${formatMoney(row.fee)}`);
    if (row.localAmount && row.localCurrency) {
      lines.push(`Local amount: ${row.localAmount} ${row.localCurrency}`);
    }
    if (row.note) lines.push(`Note: ${row.note}`);
    lines.forEach((line) => {
      pdf.text(line, 20, y);
      y += 10;
    });
    pdf.save(`receipt-${row.reference}.pdf`);
  };

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const currentPage = Math.min(page, totalPages);
  const pageStart =
    pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
  const pageEnd = Math.min(currentPage * pagination.limit, pagination.total);
  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <section className="rounded-xl border border-[#EAECF0] bg-white">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#0C1424]">
            Payment history
          </h2>
          <p className="mt-1 text-sm text-[#66748C]">
            Every payroll run and one-time payment. Download a PDF receipt for
            any row.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="h-9 w-35 border-[#D0D5DD] text-sm text-[#0C1424]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 1 year</SelectItem>
            </SelectContent>
          </Select>
          <Link
            href="/dashboard/transactions"
            className="text-sm font-semibold text-[#66748C]"
          >
            View all
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center border-t border-[#EAECF0] py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0052FF]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="border-t border-[#EAECF0] px-5 py-12 text-center text-sm text-[#66748C]">
          No payments in this period.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-205 text-left">
              <thead>
                <tr className="border-y border-[#EAECF0] text-[11px] font-medium tracking-wide text-[#66748C] uppercase">
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">People</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isOneTime = row.type === "ONE_TIME";
                  const subtitle = paymentSubtitle(row);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[#EAECF0] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0C1424]">
                          {paymentTitle(row)}
                        </p>
                        {subtitle && (
                          <p className="text-sm text-[#66748C]">{subtitle}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            isOneTime
                              ? "inline-flex rounded-full bg-[#EEF4FF] px-2.5 py-1 text-xs font-medium text-[#0052FF]"
                              : "inline-flex rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#66748C]"
                          }
                        >
                          {isOneTime ? "One-time" : "Payroll run"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0C1424]">
                        {row.peopleCount}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0C1424]">
                        {formatDisplayDate(row.date)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#ECFDF3] px-2.5 py-1 text-xs font-medium text-[#027A48]">
                          Paid
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-sm font-semibold text-[#0C1424]">
                              {formatMoney(row.amount)}
                            </span>
                            {row.localAmount && row.localCurrency && (
                              <p className="text-xs text-[#66748C]">
                                {row.localAmount} {row.localCurrency}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            aria-label="Download receipt"
                            className="rounded-lg border border-[#E2E7F0] p-1 text-[#66748C] hover:text-[#0C1424]"
                            onClick={() => downloadReceipt(row)}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#EAECF0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#66748C]">
              Showing {pageStart}-{pageEnd} of {pagination.total} payments
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                disabled={!pagination.hasPrevious && currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] text-[#66748C] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-8 w-8 items-center justify-center text-sm text-[#66748C]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium",
                      item === currentPage
                        ? "border-[#B2CCFF] bg-[#EEF4FF] text-[#0052FF]"
                        : "border-[#E4E7EC] bg-white text-[#66748C] hover:bg-[#F9FAFB]",
                    )}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="Next page"
                disabled={!pagination.hasNext && currentPage >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] text-[#0C1424] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
