"use client";

import { useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../layout";
import { PayrollMetrics } from "@/components/payroll/payroll-metrics";
import { ScheduledPayrolls } from "@/components/payroll/scheduled-payrolls";
import { useTeamStore } from "@/store/team-store";
import { getTeamMembers } from "@/lib/team-service";
import {
  formatKycStatusLabel,
  getRejectionDetails,
  isKycFullyApproved,
  needsUserKycAction,
  useKYCStore,
} from "@/store/kyc-store";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { getKYCStatus } from "@/lib/kyc-service";
import toast from "react-hot-toast";
import { getCompanyDetails } from "@/lib/company-details";

export default function PayrollPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { setMembers, setIsLoading } = useTeamStore();
  const { kycStatus, setKYCStatus } = useKYCStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canCreatePayroll, setCanCreatePayroll] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    setTitle("Payroll");
  }, [setTitle]);

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

  useEffect(() => {
    const load = async () => {
      try {
        const [status, company] = await Promise.all([
          getKYCStatus(),
          getCompanyDetails(),
        ]);
        setKYCStatus(status);
        setCanCreatePayroll(
          company.kyc?.canCreateActivePayrollGroup ??
            isKycFullyApproved(status),
        );
      } catch (error) {
        console.error("Failed to load payroll eligibility", error);
      }
    };
    void load();
  }, [setKYCStatus]);

  const verificationApproved = isKycFullyApproved(kycStatus);
  const payrollLocked =
    canCreatePayroll === false ||
    (canCreatePayroll === null && !verificationApproved);

  const openLink = async (type: "kyc" | "tos") => {
    try {
      setIsRefreshing(true);
      const latest = await getKYCStatus();
      setKYCStatus(latest);
      const link = type === "kyc" ? latest.kycLink : latest.tosLink;
      if (!link) {
        toast.error(
          type === "kyc"
            ? "Identity verification link is not available yet."
            : "Terms of service link is not available yet.",
        );
        return;
      }
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to open link",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const rejectionDetails = getRejectionDetails(kycStatus?.rejectionReason);

  return (
    <>
      {payrollLocked ? (
        <div className="max-w-2xl mx-auto py-4 px-8">
          <div className="border border-[#FCD34D] rounded-lg p-6 bg-[#FFFBEB] space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-[#F59E0B] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#101828] text-lg">
                  Verification required for payroll
                </h3>
                <p className="text-[#667085] mt-2">
                  Payroll unlocks after your account verification is approved.
                  Current status:{" "}
                  <span className="font-medium text-[#92400E]">
                    {formatKycStatusLabel(kycStatus?.kycStatus)}
                  </span>
                  .
                </p>
                {rejectionDetails.length > 0 && (
                  <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-[#92400E]">
                    {rejectionDetails.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {kycStatus?.tosStatus !== "approved" && (
                <Button
                  onClick={() => openLink("tos")}
                  disabled={isRefreshing}
                  className="bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90"
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Accept terms
                    </>
                  )}
                </Button>
              )}
              {(needsUserKycAction(kycStatus?.kycStatus) ||
                kycStatus?.kycStatus === "rejected") && (
                <Button
                  onClick={() => openLink("kyc")}
                  disabled={isRefreshing}
                  variant="outline"
                  className="border-[#F59E0B] text-[#92400E]"
                >
                  Continue verification
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 py-4 px-8">
          <PayrollMetrics />
          <ScheduledPayrolls />
        </div>
      )}
    </>
  );
}
