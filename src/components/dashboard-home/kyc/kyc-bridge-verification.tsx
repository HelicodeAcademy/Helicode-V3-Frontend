"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import {
  formatKycStatusLabel,
  getRejectionDetails,
  isKycFullyApproved,
  useKYCStore,
} from "@/store/kyc-store";
import { getKYCStatus } from "@/lib/kyc-service";

interface KYCBridgeVerificationProps {
  onVerificationComplete: () => void;
}

export function KYCBridgeVerification({
  onVerificationComplete,
}: KYCBridgeVerificationProps) {
  const { kycStatus, setKYCStatus } = useKYCStore();
  const [isPolling, setIsPolling] = useState(false);

  const currentKycStatus = kycStatus?.kycStatus || "not_started";
  const currentTosStatus = kycStatus?.tosStatus || "pending";
  const kycLink = kycStatus?.kycLink;
  const tosLink = kycStatus?.tosLink;
  const isComplete = isKycFullyApproved(kycStatus);
  const rejectionDetails = getRejectionDetails(kycStatus?.rejectionReason);

  useEffect(() => {
    if (isComplete) {
      onVerificationComplete?.();
    }
  }, [isComplete, onVerificationComplete]);

  useEffect(() => {
    if (isComplete) return;

    const pollInterval = setInterval(async () => {
      try {
        const updatedStatus = await getKYCStatus();
        setKYCStatus(updatedStatus);
      } catch (error) {
        console.error("Error polling KYC status:", error);
      }
    }, 10_000);

    return () => clearInterval(pollInterval);
  }, [setKYCStatus, isComplete]);

  const getStatusBadge = (status: string | null | undefined) => {
    if (status === "approved" || status === "accepted") {
      return <Badge className="bg-[#DBEAFE] text-[#0369A1]">Completed</Badge>;
    }
    if (status === "rejected") {
      return <Badge className="bg-[#FEE2E2] text-[#991B1B]">Rejected</Badge>;
    }
    if (status === "under_review") {
      return <Badge className="bg-[#FEF3C7] text-[#92400E]">Under review</Badge>;
    }
    return (
      <Badge className="bg-[#E5E7EB] text-[#374151]">
        {formatKycStatusLabel(status)}
      </Badge>
    );
  };

  const openLink = async (type: "kyc" | "tos") => {
    try {
      const latest = await getKYCStatus();
      setKYCStatus(latest);
      const url = type === "kyc" ? latest.kycLink : latest.tosLink;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        setIsPolling(true);
      }
    } catch (error) {
      console.error("Failed to refresh verification link:", error);
      const fallback = type === "kyc" ? kycLink : tosLink;
      if (fallback) {
        window.open(fallback, "_blank", "noopener,noreferrer");
        setIsPolling(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {isComplete && (
        <div className="bg-[#DBEAFE] border border-[#0084FD] rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#0084FD] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#003DA5]">
              Verification Complete
            </p>
            <p className="text-sm text-[#0084FD] mt-1">
              All verifications have been completed. You can now access payroll
              and funding features.
            </p>
          </div>
        </div>
      )}

      {rejectionDetails.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4">
          <p className="text-sm font-medium text-[#991B1B] mb-2">
            Verification was rejected
          </p>
          <ul className="list-disc list-inside space-y-1">
            {rejectionDetails.map((reason) => (
              <li key={reason} className="text-sm text-[#B91C1C]">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terms of Service first */}
      <div className="border border-[#E5E7EB] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#101828]">
              Terms of Service
            </h3>
            <p className="text-sm text-[#667085] mt-1">
              Accept the terms and conditions
            </p>
          </div>
          {getStatusBadge(currentTosStatus)}
        </div>

        {currentTosStatus !== "approved" && tosLink && (
          <Button
            onClick={() => openLink("tos")}
            className="w-full bg-[#0084FD] text-white hover:bg-[#0084FD]/90 h-10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Accept Terms of Service
          </Button>
        )}

        {currentTosStatus === "approved" && (
          <p className="text-sm text-[#219D53] font-medium">Terms accepted</p>
        )}
      </div>

      {/* Identity verification */}
      <div className="border border-[#E5E7EB] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#101828]">
              Identity Verification
            </h3>
            <p className="text-sm text-[#667085] mt-1">
              Complete your identity verification
            </p>
          </div>
          {getStatusBadge(currentKycStatus)}
        </div>

        {currentKycStatus !== "approved" && kycLink && (
          <Button
            onClick={() => openLink("kyc")}
            className="w-full bg-[#0084FD] text-white hover:bg-[#0084FD]/90 h-10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {currentKycStatus === "rejected"
              ? "Retry Identity Verification"
              : "Open Identity Verification"}
          </Button>
        )}

        {currentKycStatus === "approved" && (
          <p className="text-sm text-[#219D53] font-medium">
            Identity verification completed
          </p>
        )}
      </div>

      {isPolling && !isComplete && (
        <div className="bg-[#F0F9FF] border border-[#0084FD] rounded-lg p-4 flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-[#0084FD] shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="text-sm font-medium text-[#003DA5]">
              Checking status
            </p>
            <p className="text-sm text-[#0084FD] mt-1">
              We&apos;re checking for updates. Please complete the steps above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
