"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCompanyTransactions,
  type TransactionData,
} from "@/lib/transaction-service";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 3;

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isWithinDays(dateLabel: string, days: number) {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return parsed >= cutoff;
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

export function PayrollPaymentHistory() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("90");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getCompanyTransactions();
        setTransactions(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load payment history",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const visible = useMemo(
    () =>
      transactions.filter((transaction) =>
        isWithinDays(transaction.date, Number(range)),
      ),
    [transactions, range],
  );

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart =
    visible.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, visible.length);
  const paged = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const pageItems = getPageItems(currentPage, totalPages);

  useEffect(() => {
    setPage(1);
  }, [range]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const downloadReceipt = (transaction: TransactionData) => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Payment receipt", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Payment: ${transaction.name}`, 20, 40);
    pdf.text(`Role: ${transaction.role}`, 20, 50);
    pdf.text(`Date: ${transaction.date}`, 20, 60);
    pdf.text(`Status: ${transaction.status}`, 20, 70);
    pdf.text(`Amount: ${formatMoney(transaction.amount)}`, 20, 80);
    pdf.save(`receipt-${transaction.id}.pdf`);
  };

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
          <Select value={range} onValueChange={setRange}>
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
      ) : visible.length === 0 ? (
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
                {paged.map((transaction) => {
                  const isOneTime =
                    Boolean(transaction.role) && transaction.role !== "N/A";
                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-[#EAECF0] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#0C1424]">
                          {transaction.name}
                        </p>
                        {transaction.role && transaction.role !== "N/A" && (
                          <p className="text-sm text-[#66748C]">
                            {transaction.role}
                          </p>
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
                        {isOneTime ? "1" : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0C1424]">
                        {transaction.date}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            transaction.status === "Paid"
                              ? "inline-flex rounded-full bg-[#ECFDF3] px-2.5 py-1 text-xs font-medium text-[#027A48]"
                              : transaction.status === "Failed"
                                ? "inline-flex rounded-full bg-[#FEF3F2] px-2.5 py-1 text-xs font-medium text-[#B42318]"
                                : "inline-flex rounded-full bg-[#FFFAEB] px-2.5 py-1 text-xs font-medium text-[#B54708]"
                          }
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-[#0C1424]">
                            {formatMoney(transaction.amount)}
                          </span>
                          <button
                            type="button"
                            aria-label="Download receipt"
                            className="rounded-lg border border-[#E2E7F0] p-1 text-[#66748C] hover:text-[#0C1424]"
                            onClick={() => downloadReceipt(transaction)}
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
              Showing {pageStart}-{pageEnd} of {visible.length} payments
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage <= 1}
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
                disabled={currentPage >= totalPages}
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
