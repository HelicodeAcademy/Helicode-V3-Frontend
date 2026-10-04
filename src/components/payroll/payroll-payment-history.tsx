"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
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

export function PayrollPaymentHistory() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("90");

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
              {visible.map((transaction) => {
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
                          className="text-[#66748C] hover:text-[#0C1424] border border-[#E2E7F0] rounded-lg p-1"
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
      )}
    </section>
  );
}
