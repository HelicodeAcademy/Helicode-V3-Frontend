"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { useKYCStore } from "@/store/kyc-store";
import { getKYCStatus } from "@/lib/kyc-service";

interface KYCBridgeVerificationProps {
  onVerificationComplete: () => void;
}

type VerificationStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected"
  | "submitted"
  | "in_progress"
  | "accepted";

export function KYCBridgeVerification({
  onVerificationComplete,
}: KYCBridgeVerificationProps) {
  const { kycStatus, setKYCStatus } = useKYCStore();
  const [isPolling, setIsPolling] = useState(false);

  const currentKycStatus = (kycStatus?.kycStatus ||
    "not_started") as VerificationStatus;
  const currentTosStatus = (kycStatus?.tosStatus ||
    "not_started") as VerificationStatus;

  const kycLink = kycStatus?.kycLink;
  const tosLink = kycStatus?.tosLink;

  const isVerified =
    currentKycStatus === "approved" && currentTosStatus === "approved";

  const shouldPoll =
    !isVerified &&
    (currentKycStatus === "pending" || currentTosStatus === "pending");

  // FCheck if both are approved and trigger completion
  useEffect(() => {
    if (isVerified) {
      onVerificationComplete?.();
    }
  }, [isVerified, onVerificationComplete]);

  // Poll the store for status updates
  useEffect(() => {
    if (!shouldPoll) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const updatedStatus = await getKYCStatus();

        setKYCStatus(updatedStatus);
      } catch (error) {
        console.error("Error polling KYC status:", error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [setKYCStatus, shouldPoll]);

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "approved":
      case "accepted":
        return <Badge className="bg-[#DBEAFE] text-[#0369A1]">Completed</Badge>;
      case "pending":
      case "submitted":
      case "in_progress":
        return <Badge className="bg-[#FEF3C7] text-[#92400E]">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-[#FEE2E2] text-[#991B1B]">Rejected</Badge>;
      default:
        return (
          <Badge className="bg-[#E5E7EB] text-[#374151]">Not Started</Badge>
        );
    }
  };

  const openLink = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      setIsPolling(true);
    }
  };

  const isComplete =
    currentKycStatus === "approved" && currentTosStatus === "approved";

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
              All verifications have been completed. You can now access all
              platform features.
            </p>
          </div>
        </div>
      )}

      {/* KYC Verification */}
      <div className="border border-[#E5E7EB] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#101828]">
              KYC Verification
            </h3>
            <p className="text-sm text-[#667085] mt-1">
              Complete your identity verification
            </p>
          </div>
          {getStatusBadge(currentKycStatus)}
        </div>

        {currentKycStatus !== "approved" && kycLink && (
          <Button
            onClick={() => openLink(kycLink)}
            className="w-full bg-[#0084FD] text-white hover:bg-[#0084FD]/90 h-10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open KYC Verification
          </Button>
        )}

        {currentKycStatus === "approved" && (
          <p className="text-sm text-[#219D53] font-medium">
            KYC verification completed
          </p>
        )}
      </div>

      {/* Terms of Service */}
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
            onClick={() => openLink(tosLink)}
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

      {isPolling && !isComplete && (
        <div className="bg-[#F0F9FF] border border-[#0084FD] rounded-lg p-4 flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-[#0084FD] shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="text-sm font-medium text-[#003DA5]">
              Verifying Status
            </p>
            <p className="text-sm text-[#0084FD] mt-1">
              We&apos;re checking for updates. Please complete the verification
              steps above.
            </p>
          </div>
        </div>
      )}

      {!isPolling && !isComplete && (
        <p className="text-xs text-[#667085] text-center">
          After completing the verification steps, we&apos;ll automatically
          detect the changes.
        </p>
      )}
    </div>
  );
}
