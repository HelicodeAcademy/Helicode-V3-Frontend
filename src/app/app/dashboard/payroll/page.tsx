"use client";

import { Suspense, useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../layout";
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
import { PayrollPageContent } from "@/components/payroll/payroll-page-content";

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

    void fetchTeam();
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

  if (payrollLocked) {
    return (
      <div className="mx-auto max-w-2xl px-8 py-4">
        <div className="space-y-4 rounded-lg border border-[#FCD34D] bg-[#FFFBEB] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-[#F59E0B]" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#0C1424]">
                Verification required for payroll
              </h3>
              <p className="mt-2 text-[#66748C]">
                Payroll unlocks after your account verification is approved.
                Current status:{" "}
                <span className="font-medium text-[#9A5B00]">
                  {formatKycStatusLabel(kycStatus?.kycStatus)}
                </span>
                .
              </p>
              {rejectionDetails.length > 0 && (
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[#9A5B00]">
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
                    <ExternalLink className="mr-2 h-4 w-4" />
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
                className="border-[#F59E0B] text-[#9A5B00]"
              >
                Continue verification
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <PayrollPageContent />
    </Suspense>
  );
}
