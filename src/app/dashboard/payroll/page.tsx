"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { PayrollMetrics } from "@/components/payroll/payroll-metrics";
import { PayrollTransactionsTable } from "@/components/payroll/payroll-transactions-table";

export default function PayrollPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Payroll");
  }, [setTitle]);

  return (
    <div className="space-y-6 py-4 px-8">
      <PayrollMetrics />
      <PayrollTransactionsTable />
    </div>
  );
}
