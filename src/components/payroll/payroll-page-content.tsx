"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download, Plus, Send } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletStore } from "@/store/wallet-store";
import { getWalletAddress } from "@/lib/wallet-service";
import { getCompanyTransactions } from "@/lib/transaction-service";
import { OneTimePaymentModal } from "./one-time-payment-modal";
import { SchedulePayrollModal } from "./schedule-payroll-modal";
import { ScheduledPayrolls } from "./scheduled-payrolls";
import { PayrollPaymentHistory } from "./payroll-payment-history";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";

function formatMoney(amount?: number) {
  const value = typeof amount === "number" ? amount : 0;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function PayrollPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { walletData, setWalletData } = useWalletStore();
  const [oneTimePaymentOpen, setOneTimePaymentOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedulesKey, setSchedulesKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (searchParams.get("schedule") === "1") {
      setScheduleOpen(true);
    }
  }, [searchParams]);

  const handleScheduleOpenChange = (open: boolean) => {
    setScheduleOpen(open);
    if (!open && searchParams.get("schedule") === "1") {
      router.replace(pathname);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getWalletAddress();
        setWalletData(data);
      } catch {
        // keep existing wallet data if refresh fails
      }
    };
    void load();
  }, [setWalletData]);

  const nextPayrollLabel = useMemo(() => {
    if (!walletData?.nextPayrollDate) return "Not scheduled";
    return format(new Date(walletData.nextPayrollDate), "MMM d, yyyy");
  }, [walletData?.nextPayrollDate]);

  const stats = [
    {
      label: "Balance",
      value: formatMoney(walletData?.balance),
    },
    {
      label: "Total payroll",
      value: formatMoney(walletData?.totalPayoutAmount),
    },
    {
      label: "Team",
      value: String(walletData?.activeTeamsCount ?? 0),
    },
    {
      label: "Next payroll",
      value: nextPayrollLabel,
      muted: !walletData?.nextPayrollDate,
    },
  ];

  const downloadReport = async () => {
    try {
      setIsExporting(true);
      const transactions = await getCompanyTransactions();
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text("Payroll report", 20, 20);
      pdf.setFontSize(11);
      let y = 35;
      transactions.forEach((transaction) => {
        pdf.text(
          `${transaction.date}  ${transaction.name}  ${transaction.status}  $${transaction.amount.toFixed(2)}`,
          20,
          y,
        );
        y += 8;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
      });
      pdf.save("payroll-report.pdf");
      toast.success("Report downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download report",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#0C1424]">
            Payroll
          </h1>
          <p className="mt-1 text-sm text-[#66748C]">
            Run recurring payroll, send one-off payments and export records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOneTimePaymentOpen(true)}
            className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3.5 text-sm font-medium text-[#0C1424] hover:bg-[#F9FAFB]"
          >
            <Send className="h-4 w-4" />
            Pay now
          </Button>
          <Button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="h-10 rounded-lg bg-[#0052FF] text-sm font-medium text-white hover:bg-[#0041CC]"
          >
            <Plus className="h-4 w-4" color="white" /> Schedule payroll
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isExporting}
                className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3.5 text-sm font-medium text-[#0C1424] hover:bg-[#F9FAFB]"
              >
                <Download className="h-4 w-4" />
                Download report
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void downloadReport()}>
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#EAECF0] bg-[#EAECF0] md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white px-5 py-5 border-r">
            <p className="text-sm text-[#66748C]">{stat.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold tracking-tight ${
                stat.muted ? "text-[#66748C]" : "text-[#0C1424]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <ScheduledPayrolls
        key={schedulesKey}
        balance={walletData?.balance ?? 0}
        onNewSchedule={() => setScheduleOpen(true)}
      />
      <PayrollPaymentHistory />

      <OneTimePaymentModal
        open={oneTimePaymentOpen}
        onOpenChange={setOneTimePaymentOpen}
      />
      <SchedulePayrollModal
        open={scheduleOpen}
        onOpenChange={handleScheduleOpenChange}
        onSuccess={() => setSchedulesKey((value) => value + 1)}
      />
    </div>
  );
}
