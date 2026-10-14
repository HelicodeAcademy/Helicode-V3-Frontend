"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  downloadAccountStatementCsv,
  getAccountStatement,
  type AccountStatement,
} from "@/lib/accounts-service";
import { downloadBlob } from "@/lib/account-documents";
import {
  openStatementDownload,
  prepareStatement,
} from "@/lib/statements-service";
import { formatAccountMoney, formatSignedMoney } from "@/lib/account-format";
import { cn } from "@/lib/utils";

type PeriodPreset = "month" | "quarter" | "ytd" | "custom";
type StatementFormat = "pdf" | "csv";

interface DownloadStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  accountName: string;
}

function rangeFor(preset: Exclude<PeriodPreset, "custom">) {
  const now = new Date();
  if (preset === "month") {
    const previous = subMonths(now, 1);
    return { from: startOfMonth(previous), to: endOfMonth(previous) };
  }
  if (preset === "quarter") {
    const end = endOfMonth(subMonths(now, 1));
    return { from: startOfMonth(subMonths(end, 2)), to: end };
  }
  return { from: startOfYear(now), to: now };
}

export function DownloadStatementModal({
  open,
  onOpenChange,
  currency,
  accountName,
}: DownloadStatementModalProps) {
  const [preset, setPreset] = useState<PeriodPreset>("month");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [formatOption, setFormatOption] = useState<StatementFormat>("pdf");
  const [includePending, setIncludePending] = useState(false);
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  const range = useMemo(
    () => ({
      from: fromDate ? format(fromDate, "yyyy-MM-dd") : "",
      to: toDate ? format(toDate, "yyyy-MM-dd") : "",
    }),
    [fromDate, toDate],
  );

  useEffect(() => {
    if (!open) return;
    const initial = rangeFor("month");
    setPreset("month");
    setFromDate(initial.from);
    setToDate(initial.to);
    setFromOpen(false);
    setToOpen(false);
    setFormatOption("pdf");
    setIncludePending(false);
    setStatement(null);
  }, [open]);

  useEffect(() => {
    if (!open || !range.from || !range.to) return;
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getAccountStatement({
          currency,
          from: range.from,
          to: range.to,
          includePending,
        });
        if (!cancelled) setStatement(data);
      } catch (error) {
        if (!cancelled) {
          setStatement(null);
          toast.error(
            error instanceof Error ? error.message : "Failed to load statement",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, currency, range.from, range.to, includePending]);

  const download = async () => {
    if (!range.from || !range.to) return;
    try {
      setIsDownloading(true);
      if (formatOption === "csv") {
        const blob = await downloadAccountStatementCsv({
          currency,
          from: range.from,
          to: range.to,
          includePending,
        });
        downloadBlob(blob, `statement-${currency}-${range.from}.csv`);
      } else {
        const record = await prepareStatement(
          {
            type: "ACCOUNT",
            currency,
            from: range.from,
            to: range.to,
            includePending,
          },
          { shouldStop: () => !openRef.current },
        );
        if (record.status === "FAILED") {
          throw new Error(
            record.error ||
              "We couldn't prepare this statement. Please try again.",
          );
        }
        await openStatementDownload(record.id);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error && error.message === "Cancelled") return;
      toast.error(
        error instanceof Error ? error.message : "Failed to download statement",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const moneyCurrency = statement?.currency || "USDC";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <div className="border-b border-[#EAECF0] px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-[#101828]">
            Download statement
          </DialogTitle>
          <p className="mt-1 text-sm text-[#667085]">{accountName} account</p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-[#344054]">Period</p>
            <div className="mt-2 inline-flex rounded-xl bg-[#F2F4F7] p-1">
              {(
                [
                  ["month", "Last month"],
                  ["quarter", "Last 3 months"],
                  ["ytd", "Year to date"],
                  ["custom", "Custom"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPreset(value);
                    if (value === "custom") return;
                    const next = rangeFor(value);
                    setFromDate(next.from);
                    setToDate(next.to);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    preset === value
                      ? "bg-white text-[#101828] shadow-sm"
                      : "text-[#667085]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-start rounded-xl border-[#E4E7EC] text-left font-normal text-[#101828]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#667085]" />
                    {fromDate ? format(fromDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setPreset("custom");
                      setFromOpen(false);
                    }}
                    autoFocus
                    captionLayout="dropdown-years"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-[#98A2B3]">→</span>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-start rounded-xl border-[#E4E7EC] text-left font-normal text-[#101828]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#667085]" />
                    {toDate ? format(toDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setPreset("custom");
                      setToOpen(false);
                    }}
                    autoFocus
                    captionLayout="dropdown-years"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#344054]">Format</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormatOption("pdf")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left",
                  formatOption === "pdf"
                    ? "border-[#0052FF] bg-[#F5F8FF]"
                    : "border-[#E4E7EC] bg-white",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full",
                      formatOption === "pdf"
                        ? "bg-[#0052FF]"
                        : "border border-[#D0D5DD] bg-white",
                    )}
                  >
                    {formatOption === "pdf" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  PDF statement
                </span>
                <span className="mt-1 block pl-6 text-xs text-[#667085]">
                  Bank-style, with running balance. Accepted by banks, auditors
                  and visa offices.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormatOption("csv")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left",
                  formatOption === "csv"
                    ? "border-[#0052FF] bg-[#F5F8FF]"
                    : "border-[#E4E7EC] bg-white",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full",
                      formatOption === "csv"
                        ? "bg-[#0052FF]"
                        : "border border-[#D0D5DD] bg-white",
                    )}
                  >
                    {formatOption === "csv" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  CSV
                </span>
                <span className="mt-1 block pl-6 text-xs text-[#667085]">
                  Every transaction as a row, for spreadsheets and accounting
                  tools.
                </span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[#344054]">
            <input
              type="checkbox"
              checked={includePending}
              onChange={(event) => setIncludePending(event.target.checked)}
              className="h-4 w-4 accent-[#0052FF] rounded-sm"
            />
            Include pending transactions
          </label>

          <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-[#EAECF0]">
            {(
              [
                [
                  "Opening balance",
                  formatAccountMoney(statement?.openingBalance, moneyCurrency),
                ],
                [
                  "Money in",
                  formatSignedMoney(statement?.moneyIn, "in", moneyCurrency),
                ],
                [
                  "Money out",
                  formatSignedMoney(statement?.moneyOut, "out", moneyCurrency),
                ],
                [
                  "Closing balance",
                  formatAccountMoney(statement?.closingBalance, moneyCurrency),
                ],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="px-3 py-3">
                <p className="text-xs text-[#667085]">{label}</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    label === "Money in" ? "text-[#039855]" : "text-[#101828]",
                  )}
                >
                  {isLoading ? "…" : value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#EAECF0] px-6 py-4">
          <p className="text-sm text-[#667085]">
            {statement ? `${statement.rows.length} transactions` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg border-[#D0D5DD]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
              disabled={isDownloading || isLoading || !range.from || !range.to}
              onClick={() => void download()}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download statement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
