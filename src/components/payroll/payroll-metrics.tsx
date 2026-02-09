"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function PayrollMetrics() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* First column */}
      <div className="bg-white p-6 border border-[#F2F2F2] rounded-2xl h-49.75">
        <div>
          <p className="text-sm text-[#475367] font-medium mb-2">
            Total Payout Amount
          </p>
          <div className="flex items-center gap-3">
            <h3 className="text-[2rem] font-bold text-[#1C232D]">
              {showBalance ? "$87,420.80" : "••••••"}
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
            </button>
          </div>
        </div>

        <hr className="my-5" />

        {/* Action buttons */}
        <div>
          <div className="flex gap-4">
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
            <Button className="bg-transparent border border-[#0052FF] text-[#0052FF] text-sm font-medium flex items-center hover:bg-[#f3f4f6]">
              <Image
                src="/payroll/arrow-narrow-up-right.svg"
                alt="calendar"
                width={16}
                height={16}
              />
              Run Payroll
            </Button>
          </div>
        </div>
      </div>

      {/* Second Column */}
      <div className="bg-white p-6 border border-[#F2F2F2] rounded-2x flex justify-between rounded-2xl h-49.75">
        <div className="space-y-9">
          <div>
            <p className="text-sm text-[#475367] font-medium mb-2">
              Available Balance
            </p>
            <p className="text-[#1C232D] text-[2rem] font-bold">$92,000.75</p>
          </div>
          <div>
            <p className="text-sm text-[#475367] font-medium">
              Next Payroll Date
            </p>
            <p className="text-[#1C232D] text-xl font-semibold">Feb 28, 2026</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-[#475367] font-medium">
            Total Team Members
          </p>
          <p className="text-[#1C232D] text-[2rem] font-bold">12</p>
        </div>
      </div>
    </div>
  );
}
