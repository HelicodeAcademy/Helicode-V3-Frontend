"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { PayrollOverviewModal } from "./payroll-overview-modal";
import { OneTimePaymentModal } from "./one-time-payment-modal";
import { useWalletStore } from "@/store/wallet-store";
import { format } from "date-fns";
// import { PaymentSuccessModal } from "./payment-success-modal";

export function PayrollMetrics() {
  const [showBalance, setShowBalance] = useState(true);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [oneTimePaymentOpen, setOneTimePaymentOpen] = useState(false);
  const { walletData, isLoading } = useWalletStore();
  // const [successOpen, setSuccessOpen] = useState(false);

  // const handlePayEveryone = () => {
  //   setOverviewOpen(true);
  // };

  // const handlePayNow = () => {
  //   setOverviewOpen(false);
  //   setSuccessOpen(true);
  // };

  const balance = walletData ? walletData.balance : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First column */}
      <div className="bg-white p-6 border border-[#F2F2F2] rounded-2xl h-auto">
        <div>
          <p className="text-sm text-[#475367] font-medium mb-2">
            Total Payout Amount
          </p>
          <div className="flex items-center gap-3">
            {/* <h3 className="text-[2rem] font-bold text-[#1C232D]">
              {showBalance ? (
                <div>{walletData?.totalPayoutAmount?.toFixed(2)}</div>
              ) : (
                "••••••"
              )}
            </h3>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#141B34] hover:text-[#667085] transition-colors"
            >
              {showBalance ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button> */}
            {isLoading ? (
              <div className="h-12 w-40 animate-pulse rounded bg-gray-200"></div>
            ) : (
              <>
                <div className="text-[1.75rem] font-bold text-[#1C232D] sm:text-[2rem]">
                  {showBalance
                    ? `$${walletData?.totalPayoutAmount?.toFixed(2)}`
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

        <hr className="my-5" />

        {/* Action buttons */}
        <div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/payroll/schedule">
              <Button
                variant="outline"
                className="bg-[#0052FF] border-none text-white hover:bg-[#0052FF]/80 flex items-center hover:text-white"
              >
                <Image
                  src="/payroll/calendar-plus-02.svg"
                  alt="calendar"
                  width={16}
                  height={16}
                />
                Schedule Payroll
              </Button>
            </Link>
            <Button
              // onClick={handlePayEveryone}
              onClick={() => setOverviewOpen(true)}
              className="bg-transparent border border-[#0052FF] text-[#0052FF] text-sm font-medium flex items-center hover:bg-[#f3f4f6]"
            >
              <Image
                src="/payroll/arrow-narrow-up-right.svg"
                alt="calendar"
                width={16}
                height={16}
              />
              Pay Everyone
            </Button>
            <Button
              onClick={() => setOneTimePaymentOpen(true)}
              className="bg-transparent border border-[#0052FF] text-[#0052FF] text-sm font-medium flex items-center hover:bg-[#f3f4f6]"
            >
              <Image
                src="/payroll/arrow-narrow-up-right.svg"
                alt="calendar"
                width={16}
                height={16}
              />
              Make a one time payment
            </Button>
          </div>
        </div>
      </div>

      {/* Second Column */}
      <div className="bg-white p-6 border border-[#F2F2F2] rounded-2x flex justify-between rounded-2xl h-auto">
        <div className="space-y-9">
          <div>
            <p className="text-sm text-[#475367] font-medium mb-2">
              Available Balance
            </p>
            <p className="text-[#1C232D] text-[2rem] font-bold">
              ${balance.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#475367] font-medium">
              Next Payroll Date
            </p>
            {/* <p className="text-[#1C232D] text-xl font-semibold">Feb 28, 2026</p> */}
            <p className="text-[#1C232D] text-xl font-semibold">
              {walletData?.nextPayrollDate
                ? format(new Date(walletData.nextPayrollDate), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-[#475367] font-medium">
            Total Team Members
          </p>
          <p className="text-[#1C232D] text-[2rem] font-bold">
            {walletData?.activeTeamsCount}
          </p>
        </div>
      </div>

      <PayrollOverviewModal
        open={overviewOpen}
        onOpenChange={setOverviewOpen}
      />

      <OneTimePaymentModal
        open={oneTimePaymentOpen}
        onOpenChange={setOneTimePaymentOpen}
      />

      {/* <PayrollOverviewModal
        open={overViewOpen}
        onOpenChange={setOverviewOpen}
        onPayNow={handlePayNow}
      /> */}

      {/* Payment Success Modal */}
      {/* <PaymentSuccessModal open={successOpen} onOpenChange={setSuccessOpen} /> */}
    </div>
  );
}
