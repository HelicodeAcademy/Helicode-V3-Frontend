"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  getQuarter,
  getYear,
  isWithinInterval,
  parse,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCompanyDetails } from "@/lib/company-details";
import {
  getCompanyTransactions,
  type TransactionData,
} from "@/lib/transaction-service";
import { useWalletStore } from "@/store/wallet-store";

interface DownloadReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReportType = "summary" | "payslips" | "receipts" | "costByPerson";
type PeriodMode = "month" | "quarter" | "year" | "custom";
type IncludeOption = "all" | "schedules" | "oneTime";
type CurrencyOption = "usdLocal" | "usdOnly";
type FormatOption = "pdf" | "csv" | "both";
type FlowStep = "configure" | "ready";

interface PeriodOption {
  id: string;
  label: string;
  start: Date;
  end: Date;
}

interface GeneratedReport {
  fileName: string;
  pages: number;
  sizeLabel: string;
  generatedAt: Date;
  total: number;
  periodLabel: string;
  reportTypeLabel: string;
  pdfBlob: Blob | null;
  csvBlob: Blob | null;
  format: FormatOption;
}

const REPORT_TYPES: {
  value: ReportType;
  title: string;
  description: string;
}[] = [
  {
    value: "summary",
    title: "Payroll summary",
    description: "Totals, per-person lines and fees",
  },
  {
    value: "payslips",
    title: "Payslips",
    description: "One PDF per person, zipped",
  },
  {
    value: "receipts",
    title: "Payment receipts",
    description: "Bank refs and on-chain tx hashes",
  },
  {
    value: "costByPerson",
    title: "Cost by person",
    description: "What each person was paid in the period",
  },
];

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildPeriodOptions(mode: PeriodMode): PeriodOption[] {
  const now = new Date();

  if (mode === "month") {
    return Array.from({ length: 6 }, (_, index) => {
      const date = subMonths(now, index);
      return {
        id: `month-${format(date, "yyyy-MM")}`,
        label: `${format(date, "MMM yyyy")} · ${format(startOfMonth(date), "MMM d")} – ${format(endOfMonth(date), "MMM d")}`,
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });
  }

  if (mode === "year") {
    return Array.from({ length: 4 }, (_, index) => {
      const date = subYears(now, index);
      return {
        id: `year-${getYear(date)}`,
        label: `${getYear(date)} · ${format(startOfYear(date), "MMM d")} – ${format(endOfYear(date), "MMM d, yyyy")}`,
        start: startOfYear(date),
        end: endOfYear(date),
      };
    });
  }

  // quarter + custom use quarter options
  return Array.from({ length: 6 }, (_, index) => {
    const date = subQuarters(now, index);
    const quarter = getQuarter(date);
    const year = getYear(date);
    const start = startOfQuarter(date);
    const end = endOfQuarter(date);
    return {
      id: `q${quarter}-${year}`,
      label: `Q${quarter} ${year} · ${format(start, "MMM d")} – ${format(end, "MMM d")}`,
      start,
      end,
    };
  });
}

function parseTransactionDate(value: string): Date | null {
  if (!value || value === "N/A") return null;
  const formats = ["MMM d, yyyy", "MMM dd, yyyy", "yyyy-MM-dd"];
  for (const pattern of formats) {
    const parsed = parse(value, pattern, new Date());
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function filterTransactions(
  transactions: TransactionData[],
  period: PeriodOption,
  include: IncludeOption,
) {
  return transactions.filter((transaction) => {
    const date = parseTransactionDate(transaction.date);
    if (date) {
      const inPeriod = isWithinInterval(date, {
        start: period.start,
        end: period.end,
      });
      if (!inPeriod) return false;
    }

    if (include === "oneTime") {
      return transaction.workerType === "Contractor";
    }
    if (include === "schedules") {
      return transaction.workerType === "Employee";
    }
    return true;
  });
}

function reportTypeLabel(type: ReportType) {
  return REPORT_TYPES.find((item) => item.value === type)?.title ?? "Report";
}

function shortPeriodLabel(option: PeriodOption, mode: PeriodMode) {
  if (mode === "month") return format(option.start, "MMM yyyy");
  if (mode === "year") return String(getYear(option.start));
  return `Q${getQuarter(option.start)} ${getYear(option.start)}`;
}

function buildCsv(transactions: TransactionData[]) {
  const header = ["Name", "Role", "Type", "Date", "Status", "Amount"];
  const rows = transactions.map((transaction) => [
    transaction.name,
    transaction.role,
    transaction.workerType,
    transaction.date,
    transaction.status,
    transaction.amount.toFixed(2),
  ]);
  return [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

function buildPdf(
  companyName: string,
  reportTitle: string,
  periodLabel: string,
  transactions: TransactionData[],
  total: number,
) {
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text(`${companyName} ${reportTitle}`, 20, 20);
  pdf.setFontSize(11);
  pdf.text(`Period: ${periodLabel}`, 20, 30);
  pdf.text(`Total: ${formatMoney(total)}`, 20, 38);
  pdf.text(`Generated: ${format(new Date(), "MMM d, yyyy, HH:mm")}`, 20, 46);

  let y = 60;
  pdf.setFontSize(10);
  transactions.forEach((transaction) => {
    const line = `${transaction.date}  ${transaction.name}  ${transaction.status}  ${formatMoney(transaction.amount)}`;
    pdf.text(line.slice(0, 95), 20, y);
    y += 8;
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
  });

  if (transactions.length === 0) {
    pdf.text("No payments found for this period.", 20, y);
  }

  return pdf;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DownloadReportModal({
  open,
  onOpenChange,
}: DownloadReportModalProps) {
  const { walletData } = useWalletStore();

  const [step, setStep] = useState<FlowStep>("configure");
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("quarter");
  const [periodId, setPeriodId] = useState("");
  const [include, setInclude] = useState<IncludeOption>("all");
  const [currency, setCurrency] = useState<CurrencyOption>("usdLocal");
  const [formatOption, setFormatOption] = useState<FormatOption>("pdf");
  const [emailCopy, setEmailCopy] = useState(true);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyName, setCompanyName] = useState("Helicode");
  const [companyEmail, setCompanyEmail] = useState("");
  const [generated, setGenerated] = useState<GeneratedReport | null>(null);

  const periodOptions = useMemo(
    () => buildPeriodOptions(periodMode),
    [periodMode],
  );

  const selectedPeriod =
    periodOptions.find((option) => option.id === periodId) ?? periodOptions[0];

  const resetState = useCallback(() => {
    setStep("configure");
    setReportType("summary");
    setPeriodMode("quarter");
    setInclude("all");
    setCurrency("usdLocal");
    setFormatOption("pdf");
    setEmailCopy(true);
    setPeriodOpen(false);
    setIsGenerating(false);
    setGenerated(null);
    const quarters = buildPeriodOptions("quarter");
    setPeriodId(quarters[0]?.id ?? "");
  }, []);

  useEffect(() => {
    if (!open) return;
    resetState();

    const loadCompany = async () => {
      try {
        const details = await getCompanyDetails();
        setCompanyName(details.name || "Helicode");
        setCompanyEmail(details.employer.email || "");
      } catch {
        setCompanyName("Helicode");
      }
    };
    void loadCompany();
  }, [open, resetState]);

  useEffect(() => {
    if (!periodOptions.some((option) => option.id === periodId)) {
      setPeriodId(periodOptions[0]?.id ?? "");
    }
  }, [periodOptions, periodId]);

  const generateReport = async () => {
    if (!selectedPeriod) return;
    setIsGenerating(true);
    try {
      const transactions = await getCompanyTransactions();
      const filtered = filterTransactions(
        transactions,
        selectedPeriod,
        include,
      );
      const total =
        filtered.reduce((sum, item) => sum + item.amount, 0) ||
        walletData?.totalPayoutAmount ||
        0;
      const typeLabel = reportTypeLabel(reportType);
      const periodShort = shortPeriodLabel(selectedPeriod, periodMode);
      const safeCompany =
        companyName.replace(/[^\w\s-]/g, "").trim() || "Company";
      const baseName = `${safeCompany} ${typeLabel} ${periodShort.replace(/\s+/g, "-")}`;

      let pdfBlob: Blob | null = null;
      let csvBlob: Blob | null = null;
      let pages = 1;
      let size = 0;

      if (formatOption === "pdf" || formatOption === "both") {
        const pdf = buildPdf(
          companyName,
          typeLabel,
          selectedPeriod.label,
          filtered,
          total,
        );
        pages = pdf.getNumberOfPages();
        pdfBlob = pdf.output("blob");
        size += pdfBlob.size;
      }

      if (formatOption === "csv" || formatOption === "both") {
        const csv = buildCsv(filtered);
        csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        size += csvBlob.size;
      }

      const extension =
        formatOption === "csv"
          ? "csv"
          : formatOption === "both"
            ? "pdf"
            : "pdf";

      setGenerated({
        fileName: `${baseName}.${extension}`,
        pages,
        sizeLabel: formatBytes(size || 1024),
        generatedAt: new Date(),
        total,
        periodLabel: periodShort,
        reportTypeLabel: typeLabel,
        pdfBlob,
        csvBlob,
        format: formatOption,
      });
      setStep("ready");

      if (emailCopy && companyEmail) {
        toast.success(`A copy will be emailed to ${companyEmail}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generated) return;
    if (generated.pdfBlob) {
      const name =
        generated.format === "both"
          ? generated.fileName
          : generated.fileName.replace(/\.csv$/, ".pdf");
      downloadBlob(
        generated.pdfBlob,
        name.endsWith(".pdf") ? name : `${name}.pdf`,
      );
    }
    if (generated.csvBlob) {
      const csvName = generated.fileName.replace(/\.pdf$/, ".csv");
      downloadBlob(
        generated.csvBlob,
        csvName.endsWith(".csv") ? csvName : `${csvName}.csv`,
      );
    }
  };

  const downloadButtonLabel =
    generated?.format === "csv"
      ? "Download CSV"
      : generated?.format === "both"
        ? "Download files"
        : "Download PDF";

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-2xl p-0",
          step === "ready" ? "sm:max-w-md" : "sm:max-w-140",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Custom payroll report</DialogTitle>

        {step === "configure" && (
          <>
            <div className="border-b border-[#EAECF0] px-6 pt-6 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#0C1424]">
                    Custom payroll report
                  </h2>
                  <p className="mt-1 text-sm text-[#66748C]">
                    For your accountant, auditors or investors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7] transition-colors hover:bg-[#E4E7EC]"
                >
                  <X className="h-4 w-4 text-[#0C1424]" />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <p className="mb-2 text-sm font-medium text-[#66748C]">
                  Report type
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {REPORT_TYPES.map((option) => {
                    const selected = reportType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setReportType(option.value)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                          selected
                            ? "border-[#0052FF] bg-[#F5F8FF]"
                            : "border-[#E4E7EC] bg-white hover:border-[#D0D5DD]",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-[#0052FF] bg-[#0052FF]"
                              : "border-[#D0D5DD] bg-white",
                          )}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#0C1424]">
                            {option.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#66748C]">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#66748C]">
                  Period
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="inline-flex rounded-xl bg-[#F2F4F7] p-1">
                    {(
                      [
                        ["month", "Month"],
                        ["quarter", "Quarter"],
                        ["year", "Year"],
                        ["custom", "Custom"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPeriodMode(value)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          periodMode === value
                            ? "bg-white text-[#0C1424] shadow-sm"
                            : "text-[#66748C]",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 text-left text-sm text-[#0C1424]"
                      >
                        <CalendarIcon className="h-4 w-4 shrink-0 text-[#66748C]" />
                        <span className="min-w-0 flex-1 truncate">
                          {selectedPeriod?.label ?? "Select period"}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#66748C]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 p-1">
                      {periodOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setPeriodId(option.id);
                            setPeriodOpen(false);
                          }}
                          className={cn(
                            "flex w-full rounded-lg px-3 py-2 text-left text-sm",
                            selectedPeriod?.id === option.id
                              ? "bg-[#F5F8FF] font-medium text-[#0052FF]"
                              : "text-[#0C1424] hover:bg-[#F9FAFB]",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#66748C]">
                    Include
                  </label>
                  <Select
                    value={include}
                    onValueChange={(value) =>
                      setInclude(value as IncludeOption)
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-[#E4E7EC] text-[#0C1424]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All schedules + one-time
                      </SelectItem>
                      <SelectItem value="schedules">Schedules only</SelectItem>
                      <SelectItem value="oneTime">One-time only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#66748C]">
                    Currency
                  </label>
                  <Select
                    value={currency}
                    onValueChange={(value) =>
                      setCurrency(value as CurrencyOption)
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-[#E4E7EC] text-[#0C1424]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usdLocal">
                        USD, with local amounts
                      </SelectItem>
                      <SelectItem value="usdOnly">USD only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#66748C]">
                  Format
                </p>
                <div className="inline-flex w-full rounded-xl bg-[#F2F4F7] p-1">
                  {(
                    [
                      ["pdf", "PDF"],
                      ["csv", "CSV"],
                      ["both", "PDF + CSV"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormatOption(value)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        formatOption === value
                          ? "bg-white text-[#0C1424] shadow-sm"
                          : "text-[#66748C]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EAECF0] px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-[#FBFCFE]">
              <button
                type="button"
                onClick={() => setEmailCopy((value) => !value)}
                className="flex items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border",
                    emailCopy
                      ? "border-[#0052FF] bg-[#0052FF]"
                      : "border-[#D0D5DD] bg-white",
                  )}
                >
                  {emailCopy && (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <span className="text-sm text-[#0C1424]">
                  Email a copy to {companyEmail || "your company email"}
                </span>
              </button>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-2 text-sm font-medium text-[#66748C]"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => void generateReport()}
                  className="h-10 rounded-lg bg-[#0052FF] px-4 text-sm font-medium text-white hover:bg-[#0041CC]"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "ready" && generated && (
          <div className="px-6 py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E4F4EC]">
              <Check className="h-7 w-7 text-[#079455]" strokeWidth={2} />
            </div>
            <h2 className="text-center text-xl font-semibold text-[#0C1424]">
              Your report is ready
            </h2>
            <p className="mt-2 text-center text-sm text-[#66748C]">
              {generated.reportTypeLabel} for {generated.periodLabel},{" "}
              {formatMoney(generated.total)} total.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#EAECF0] px-4 py-3">
              <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded bg-[#D92D20] text-[10px] font-bold text-white">
                PDF
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0C1424]">
                  {generated.fileName}
                </p>
                <p className="mt-0.5 text-sm text-[#66748C]">
                  {generated.pages} pages · {generated.sizeLabel} ·{" "}
                  {format(generated.generatedAt, "MMM d, yyyy, HH:mm")}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#66748C] text-center">
              {emailCopy && companyEmail
                ? `A copy was emailed to ${companyEmail}. `
                : ""}
              Every report carries a verification link so auditors can confirm
              it wasn&apos;t edited.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("configure");
                  setGenerated(null);
                }}
                className="h-11 rounded-lg border-[#D0D5DD] bg-white text-sm font-medium text-[#0C1424]"
              >
                New report
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                className="h-11 rounded-lg bg-[#0052FF] text-sm font-medium text-white hover:bg-[#0041CC]"
              >
                <Download className="h-4 w-4" />
                {downloadButtonLabel}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
