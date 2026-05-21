"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { PayrollMetrics } from "@/components/payroll/payroll-metrics";
// import { PayrollTransactionsTable } from "@/components/payroll/payroll-transactions-table";
import { ScheduledPayrolls } from "@/components/payroll/scheduled-payrolls";
import { useTeamStore } from "@/store/team-store";
import { getTeamMembers } from "@/lib/team-service";
import { useKYCStore } from "@/store/kyc-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PayrollPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { setMembers, setIsLoading } = useTeamStore();
  const { kycStatus } = useKYCStore();

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

  if (kycStatus?.kycStatus !== "approved") {
    return (
      <div className="space-y-6 py-4 px-8 mt-10">
        <div className="rounded-lg border border-[#eaeaea] bg-[#f9fafb] p-6 text-center">
          <h2 className="text-lg font-semibold">KYC Verification Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please complete your KYC verification to access payroll features.
          </p>

          {kycStatus?.kycStatus === "pending" && !kycStatus.kycLink && (
            <Link href="/dashboard/setup-account">
              <Button className="mt-3 bg-[#0166f4] text-white text-xs h-7 hover:bg-[#0166f4]/90">
                Start KYC
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 px-8">
      <PayrollMetrics />

      <ScheduledPayrolls />
    </div>
  );
}
