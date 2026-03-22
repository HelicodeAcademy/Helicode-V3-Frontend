"use client";

import { TeamPageTitleContext } from "./layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
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

const payrollData = [
  { label: "Incoming", value: "$3,000.40" },
  { label: "Next Payroll", value: "Mar 31, 2026" },
];

export default function TalentDashboardHomePage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const [currency, setCurrency] = useState<string>("usd");
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamMeResponse | null>(null);

  useEffect(() => {
    setTitle("Home");
    fetchTeamData();
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

  const balance = teamData?.wallet.balance ?? 0;

  return (
    <div className="py-4 px-8 space-y-6">
      <div className="bg-white border border-[#F2F2F2] p-6 rounded-2xl">
        <div className="flex justify-between items-end">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="border-[#d1d5db] h-8! text-sm rounded-lg font-medium">
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
                        className="w-4 h-4"
                      />
                      <span className="mt-1">US Dollars (USD)</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="eur">
                    <span className="flex items-center gap-2">
                      🇪🇺 Euro (EUR)
                    </span>
                  </SelectItem>
                  <SelectItem value="gbp">
                    <span className="flex items-center gap-2">
                      🇬🇧 British Pound (GBP)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#475367] mb-2">
                    Available Balance
                  </p>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <>
                        <div className="text-[2rem] font-bold text-[#1C232D]">
                          {showBalance ? `${balance.toFixed(2)} ` : "••••••"}

                          {/* ${teamData?.payroll?.currency} */}
                        </div>

                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className="text-[#141B34] hover:text-[#667085] transition-colors"
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
            </div>
          </div>

          <div className="grid gap-20 md:grid-cols-2 justify-end place-items-end">
            {payrollData.map((metric) => (
              <div key={metric.label}>
                <div className="font-medium text-[#475367] text-sm text-right">
                  {metric.label}
                </div>

                <div className="space-y-4 text-right">
                  <div className="text-[32px] font-bold text-[#1C232D]">
                    {metric.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-6" />

        <div className="flex gap-3">
          <Button
            className="bg-[#0052FF] rounded-lg text-white font-medium"
            onClick={() => setSendFundsModalOpen(true)}
          >
            <Image
              src="/home/arrow-narrow-up-right-white.svg"
              alt="send"
              width={16}
              height={16}
            />
            Send
          </Button>
          <Button className="bg-[#FFFFFF] border border-[#0052FF] rounded-lg text-[#0052FF] font-medium hover:bg-[#ECF2FF]/20">
            <Image
              src="/home/arrow-narrow-down-left.svg"
              alt="withdraw"
              width={16}
              height={16}
            />
            Withdraw funds
          </Button>
        </div>
      </div>

      <div className="">
        <PaymentHistory />
      </div>

      <SendFundsModal
        open={sendFundsModalOpen}
        onOpenChange={setSendFundsModalOpen}
      />
    </div>
  );
}
