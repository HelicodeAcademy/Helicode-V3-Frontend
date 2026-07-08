"use client";

import { useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../layout";
import { PayrollMetrics } from "@/components/payroll/payroll-metrics";
// import { PayrollTransactionsTable } from "@/components/payroll/payroll-transactions-table";
import { ScheduledPayrolls } from "@/components/payroll/scheduled-payrolls";
import { useTeamStore } from "@/store/team-store";
import { getTeamMembers } from "@/lib/team-service";
import { useKYCStore } from "@/store/kyc-store";
// import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KYCStage2Modal } from "@/components/dashboard-home/kyc/kyc-stage2-modal";
import { AlertCircle } from "lucide-react";

export default function PayrollPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { setMembers, setIsLoading } = useTeamStore();
  const { kycStatus } = useKYCStore();
  const [stage2ModalOpen, setStage2ModalOpen] = useState(false);

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

  // Check if employer KYC is not completed
   const isEmployerKycPending = !kycStatus || kycStatus.employerKycStatus !== 'submitted'

  if (isEmployerKycPending) {
    return (
      <div className="max-w-2xl">
        <div className="border border-[#FCD34D] rounded-lg p-6 bg-[#FFFBEB] space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#101828] text-lg">
                Complete Your Verification
              </h3>
              <p className="text-[#667085] mt-2">
                To access payroll features, you need to complete your employer
                verification. This helps us ensure compliance and security.
              </p>
              <p className="text-sm text-[#92400E] mt-3">
                Your company information has already been verified. We just need
                a few personal details to complete the process.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setStage2ModalOpen(true)}
            className="bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 mt-4"
          >
            Complete Employer Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 px-8">
      <PayrollMetrics />

      <ScheduledPayrolls />

      <KYCStage2Modal
        open={stage2ModalOpen}
        onOpenChange={setStage2ModalOpen}
        onSuccess={() => {
          setStage2ModalOpen(false);
        }}
      />
    </div>
  );
}
