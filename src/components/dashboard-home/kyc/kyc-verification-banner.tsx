"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, ExternalLink, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getKYCStatus } from "@/lib/kyc-service";
import {
  formatKycStatusLabel,
  getRejectionDetails,
  isKycFullyApproved,
  needsUserKycAction,
  useKYCStore,
} from "@/store/kyc-store";
import toast from "react-hot-toast";

const POLL_INTERVAL_MS = 15_000;

/**
 * Shown on the dashboard home when verification is not fully approved.
 * Placed above the promotional "Use Helicode..." section.
 */
export function KycVerificationBanner() {
  const { kycStatus, setKYCStatus } = useKYCStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const approved = isKycFullyApproved(kycStatus);

  useEffect(() => {
    if (approved || !kycStatus) return;

    const poll = async () => {
      try {
        const status = await getKYCStatus();
        setKYCStatus(status);
      } catch (error) {
        console.error("KYC status poll error:", error);
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    const onFocus = () => {
      void poll();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [approved, kycStatus, setKYCStatus]);

  if (!kycStatus || approved) {
    return null;
  }

  const rejectionDetails = getRejectionDetails(kycStatus.rejectionReason);
  const kycNeedsAction = needsUserKycAction(kycStatus.kycStatus);
  const tosNeedsAction = kycStatus.tosStatus !== "approved";
  const underReview =
    kycStatus.kycStatus === "under_review" ||
    (kycStatus.kycStatus === "pending" && !kycStatus.kycLink);

  const openLink = async (type: "kyc" | "tos") => {
    try {
      setIsRefreshing(true);
      // Always re-fetch the latest hosted link before opening
      const latest = await getKYCStatus();
      setKYCStatus(latest);
      const link = type === "kyc" ? latest.kycLink : latest.tosLink;
      if (!link) {
        toast.error(
          type === "kyc"
            ? "Identity verification link is not available yet. Try again shortly."
            : "Terms of service link is not available yet. Try again shortly.",
        );
        return;
      }
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load verification link";
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const statusLabel = formatKycStatusLabel(kycStatus.kycStatus);
  const Icon =
    kycStatus.kycStatus === "rejected"
      ? XCircle
      : underReview
        ? Clock
        : AlertCircle;

  const borderColor =
    kycStatus.kycStatus === "rejected"
      ? "border-[#FECACA] bg-[#FEF2F2]"
      : underReview
        ? "border-[#BFDBFE] bg-[#EFF6FF]"
        : "border-[#FCD34D] bg-[#FFFBEB]";

  const titleColor =
    kycStatus.kycStatus === "rejected"
      ? "text-[#991B1B]"
      : underReview
        ? "text-[#1E3A8A]"
        : "text-[#92400E]";

  const bodyColor =
    kycStatus.kycStatus === "rejected"
      ? "text-[#B91C1C]"
      : underReview
        ? "text-[#1D4ED8]"
        : "text-[#B45309]";

  const iconColor =
    kycStatus.kycStatus === "rejected"
      ? "text-[#DC2626]"
      : underReview
        ? "text-[#2563EB]"
        : "text-[#F59E0B]";

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${borderColor}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 items-start gap-3 min-w-0">
          <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-sm font-semibold ${titleColor}`}>
                Account verification
              </p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  kycStatus.kycStatus === "rejected"
                    ? "bg-[#FEE2E2] text-[#991B1B]"
                    : underReview
                      ? "bg-[#DBEAFE] text-[#1E40AF]"
                      : "bg-[#FEF3C7] text-[#92400E]"
                }`}
              >
                {statusLabel}
              </span>
              {tosNeedsAction && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                  Terms pending
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${bodyColor}`}>
              {kycStatus.kycStatus === "rejected"
                ? "Your verification was rejected. Please review the reasons below and try again."
                : underReview
                  ? "Your verification is under review. You can explore the dashboard — payroll will unlock once approved."
                  : "Finish verification to unlock payroll and funding. You can continue using the rest of your dashboard in the meantime."}
            </p>

            {rejectionDetails.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {rejectionDetails.map((reason) => (
                  <li key={reason} className={`text-sm ${bodyColor}`}>
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 sm:justify-end">
          {tosNeedsAction && (
            <Button
              onClick={() => openLink("tos")}
              disabled={isRefreshing}
              className="h-9 text-sm bg-[#0052FF] text-white hover:bg-[#0052FF]/90"
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
          {(kycNeedsAction || kycStatus.kycStatus === "rejected") && (
            <Button
              onClick={() => openLink("kyc")}
              disabled={isRefreshing}
              variant="outline"
              className="h-9 text-sm border-[#0052FF] text-[#0052FF]"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {kycStatus.kycStatus === "rejected"
                    ? "Retry verification"
                    : "Continue verification"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
