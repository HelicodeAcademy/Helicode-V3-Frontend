"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { PayrollMetrics } from "@/components/payroll/payroll-metrics";
// import { PayrollTransactionsTable } from "@/components/payroll/payroll-transactions-table";
import { ScheduledPayrolls } from "@/components/payroll/scheduled-payrolls";
import { useTeamStore } from "@/store/team-store";
import { getTeamMembers } from "@/lib/team-service";

export default function PayrollPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { setMembers, setIsLoading } = useTeamStore();

  useEffect(() => {
    setTitle("Payroll");
  }, [setTitle]);

  // Always fetch fresh members when landing on payroll — ensures the
  // "Pay Everyone" modal shows the current account's team, not a cached
  // previous account's data. limit:100 to get all members, not just page 1.
  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        const result = await getTeamMembers({ limit: 100 });
        setMembers(result.data, result.total);
      } catch {
        // fail silently — modal handles empty state gracefully
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [setMembers, setIsLoading]);

  return (
    <div className="space-y-6 py-4 px-8">
      <PayrollMetrics />

      {/* <PayrollTransactionsTable /> */}

      <ScheduledPayrolls />
    </div>
  );
}
