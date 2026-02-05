"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { Button } from "@/components/ui/button";
import { PayrollMetrics } from "@/components/payroll/payroll-metrics";
import { PayrollTransactionsTable } from "@/components/payroll/payroll-transactions-table";
import Link from "next/link";
import Image from "next/image";

export default function PayrollPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Payroll");
  }, [setTitle]);

  return (
    <div className="space-y-4 py-4 px-8">
      <PayrollMetrics />

      <div className="flex gap-4">
        <Link href="/dashboard/payroll/schedule">
          <Button
            variant="outline"
            className="border-[#363636] text-[#363636] hover:bg-[#f3f4f6] bg-transparent flex items-center"
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
        <Button className="bg-[#363636] text-white hover:bg-[#1f2937]/90 text-sm font-medium flex items-center">
          <Image
            src="/payroll/send-01.svg"
            alt="calendar"
            width={16}
            height={16}
          />
          Pay now
        </Button>
      </div>

      <PayrollTransactionsTable />
    </div>
  );
}
