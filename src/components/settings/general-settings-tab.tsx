"use client";

import { Button } from "@/components/ui/button";
import { CompanyDetailsResponse } from "@/lib/company-details";
import {
  formatKycStatusLabel,
  isKycFullyApproved,
  needsUserKycAction,
  useKYCStore,
} from "@/store/kyc-store";
import { getKYCStatus } from "@/lib/kyc-service";
import { Award, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { CompanyOfframpSettingsSection } from "./company-offramp-settings-section";

interface GeneralSettingsTabProps {
  companyDetails: CompanyDetailsResponse | null;
  onRefreshCompanyDetails?: () => void;
}

export function GeneralSettingsTab({
  companyDetails,
  onRefreshCompanyDetails,
}: GeneralSettingsTabProps) {
  const { kycStatus, setKYCStatus } = useKYCStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const companyName = companyDetails?.name ?? "—";
  const initial = companyName.trim().charAt(0).toUpperCase() || "H";
  const adminEmail = companyDetails?.employer.email ?? "—";

  const companyKyc = companyDetails?.kyc;
  const verified =
    isKycFullyApproved(kycStatus) ||
    (companyKyc?.bridgeKycStatus === "approved" &&
      companyKyc?.bridgeTosStatus === "approved");

  const createdAt = companyDetails?.createdAt ?? null;

  const openVerification = async (type: "kyc" | "tos") => {
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
        error instanceof Error ? error.message : "Failed to open verification",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVerifyNow = async () => {
    if (kycStatus?.tosStatus !== "approved") {
      await openVerification("tos");
      return;
    }
    if (needsUserKycAction(kycStatus?.kycStatus) || !verified) {
      await openVerification("kyc");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto mt-10">
      {/* Workspace */}
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-[#737373]">
          Workspace
        </h3>
        <div className="rounded-md border border-[#EAEAEA] bg-white p-4 sm:p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#D0D5DD] flex items-center justify-center shrink-0">
            <span className="text-white text-lg font-semibold">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#101828] truncate">
              {companyName}
            </p>
            <p className="text-sm text-[#667085] mt-0.5">
              {createdAt
                ? `Created on ${format(new Date(createdAt), "MMMM d, yyyy")}`
                : "Your company workspace"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full h-9 px-4 border-[#D0D5DD] text-[#344054] shrink-0"
            disabled
            title="Editing workspace details is not available yet"
          >
            Edit
          </Button>
        </div>
      </section>

      {/* Business */}
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-[#737373]">
          Business
        </h3>
        <div className="rounded-md border border-[#EAEAEA] bg-white p-4 sm:p-5 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-base font-semibold text-[#101828]">
                Company details
              </p>
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] text-[#027A48] text-xs font-medium px-2 py-0.5">
                  <Award className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E8] text-[#FF7700] text-xs font-medium px-2 py-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatKycStatusLabel(kycStatus?.kycStatus) === "Pending" ||
                  !kycStatus?.kycStatus
                    ? "Unverified"
                    : formatKycStatusLabel(kycStatus?.kycStatus)}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-[#101828]">{companyName}</p>
            <p className="text-sm text-[#667085] mt-0.5">{adminEmail}</p>
          </div>

          {!verified && (
            <Button
              type="button"
              variant="outline"
              onClick={handleVerifyNow}
              disabled={isRefreshing}
              className="rounded-full h-9 px-4 border-[#D0D5DD] text-[#344054] shrink-0"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify now"
              )}
            </Button>
          )}
        </div>
      </section>

      <CompanyOfframpSettingsSection
        companyDetails={companyDetails}
        onRefresh={onRefreshCompanyDetails}
      />
    </div>
  );
}
