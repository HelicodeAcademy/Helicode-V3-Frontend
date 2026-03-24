"use client";

import { TeamPageTitleContext } from "./layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import PaymentHistory from "@/components/team-dashboard/home/payment-history";
import { SendFundsModal } from "@/components/team-dashboard/home/send-funds-modal";
import toast from "react-hot-toast";
import { getTeamMe } from "@/lib/team/team-auth-service";
import { TeamMeResponse } from "@/store/team/team-auth-store";
import { TalentWithdrawFundsModal } from "@/components/team-dashboard/home/withdraw-funds-modal";
import {
  getTeamTransactions,
  TeamTransactionData,
} from "@/lib/team/team-transaction-service";

export default function TalentDashboardHomePage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const [currency, setCurrency] = useState<string>("usd");
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamMeResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    TeamTransactionData[]
  >([]);
  const [withdrawFundsModalOpen, setWithdrawFundsModalOpen] =
    useState<boolean>(false);

  const handleSelectCrypto = () => {
    setWithdrawFundsModalOpen(false);
    setSendFundsModalOpen(true);
  };

  useEffect(() => {
    setTitle("Home");
    fetchTeamData();
    fetchTeamTransactions();
  }, [setTitle]);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const data = await getTeamMe();
      setTeamData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch team data";
      toast.error(errorMessage);
      console.error("Team data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamTransactions = async () => {
    try {
      const transactions = await getTeamTransactions();
      setRecentTransactions(transactions.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch team transactions";
      toast.error(errorMessage);
      console.error("Team transactions fetch error:", error);
    }
  };

  const balance = teamData?.wallet.balance ?? 0;
  const selectedCurrency = currency.toUpperCase();

  const getCurrencySymbol = (currencyCode?: string) => {
    switch (currencyCode?.toUpperCase()) {
      case "USD":
      case "USDC":
      case "USDT":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return currencyCode ?? "";
    }
  };

  const formatIncomingAmount = (amount?: number, currencyCode?: string) => {
    if (typeof amount !== "number") return "--";

    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  };

  const payrollData = [
    {
      label: "Incoming",
      value: formatIncomingAmount(
        teamData?.incomingPayrollAmount,
        selectedCurrency,
      ),
    },
    {
      label: "Next Payroll",
      value: teamData?.incomingPayrollDate
        ? format(new Date(teamData.incomingPayrollDate), "MMM d, yyyy")
        : "",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#F2F2F2] bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-6 xl:max-w-sm">
            <div className="flex items-center justify-between">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-10 w-full max-w-64 border-[#d1d5db] text-sm font-medium rounded-lg">
                  <SelectValue className="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">
                    <span className="flex items-center gap-2">
                      <Image
                        src="/home/usa.svg"
                        alt="USD"
                        width={16}
                        height={16}
                        priority
                        className="h-4 w-4"
                      />
                      <span className="mt-1">US Dollars (USD)</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="eur">
                    <span className="flex items-center gap-2">Euro (EUR)</span>
                  </SelectItem>
                  <SelectItem value="gbp">
                    <span className="flex items-center gap-2">
                      British Pound (GBP)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#475367]">
                Available Balance
              </p>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="h-12 w-40 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  <>
                    <div className="text-[1.75rem] font-bold text-[#1C232D] sm:text-[2rem]">
                      {showBalance
                        ? `${getCurrencySymbol(selectedCurrency)}${balance.toFixed(2)}`
                        : "••••••"}
                    </div>

                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-[#141B34] transition-colors hover:text-[#667085]"
                    >
                      {showBalance ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid w-full gap-6 sm:grid-cols-2 xl:w-auto xl:gap-12">
            {payrollData.map((metric) => (
              <div key={metric.label} className="text-left sm:text-right">
                <div className="text-sm font-medium text-[#475367]">
                  {metric.label}
                </div>
                <div className="mt-2 text-[1.75rem] font-bold text-[#1C232D] sm:text-[2rem]">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => setWithdrawFundsModalOpen(true)}
            className="w-full items-center rounded-lg bg-[#0052FF] font-medium text-white hover:bg-[#0052FF]/90 sm:w-auto"
          >
            <Image
              src="/home/arrow-narrow-up-right-white.svg"
              alt="withdraw"
              className="rotate-180"
              width={16}
              height={16}
            />
            Withdraw funds
          </Button>
        </div>
      </div>

      <PaymentHistory payments={recentTransactions} />

      <SendFundsModal
        open={sendFundsModalOpen}
        onOpenChange={setSendFundsModalOpen}
      />
      <TalentWithdrawFundsModal
        open={withdrawFundsModalOpen}
        onOpenChange={setWithdrawFundsModalOpen}
        onSelectCrypto={handleSelectCrypto}
      />
    </div>
  );
}
