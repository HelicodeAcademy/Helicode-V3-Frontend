"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBridgeKycStatus } from "@/lib/team/team-kyc-service";
import toast from "react-hot-toast";
// import { Loader2 } from "lucide-react";

interface TeamBridgeVerificationStatusProps {
  bankPayoutStatus?: boolean;
  bridgeKycStatus?: "not_started" | "pending" | "approved" | "rejected";
  bridgeTosStatus?: "not_started" | "pending" | "approved" | "rejected";
}

export function TeamBridgeVerificationStatus({
  bankPayoutStatus,
  bridgeKycStatus,
  bridgeTosStatus,
}: TeamBridgeVerificationStatusProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bridgeData, setBridgeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Stablecoin-only members start Bridge KYC without ever adding bank details
  const bridgeStarted =
    (bridgeKycStatus && bridgeKycStatus !== "not_started") ||
    (bridgeTosStatus && bridgeTosStatus !== "not_started");

    const fetchBridgeStatus = async () => {
    try {
      setLoading(true);
      const data = await getBridgeKycStatus();
      setBridgeData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch Bridge status";
      console.error("Bridge status error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded && (bankPayoutStatus || bridgeStarted)) {
      fetchBridgeStatus();
      setHasLoaded(true);
    }
  }, [bankPayoutStatus, bridgeStarted, hasLoaded]);

  // Only show if bank details have been added or Bridge KYC has been initiated
  if (!bankPayoutStatus && !bridgeStarted) {
    return null;
  }

  // Only show if KYC or ToS are not both approved
  const allApproved =
    bridgeKycStatus === "approved" && bridgeTosStatus === "approved";
  if (allApproved) {
    return null;
  }



  const handleOpenLink = (link: string | undefined, linkType: string) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      toast.error(`${linkType} link is not available`);
    }
  };

  if (loading && !bridgeData) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* KYC Verification */}
      {bridgeKycStatus !== "approved" && (
        <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 flex items-start gap-3 mt-10">
          <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#92400E]">
              Complete KYC Verification
            </p>
            <p className="text-sm text-[#B45309] mt-1">
              {bridgeKycStatus === "pending"
                ? "Your KYC is being reviewed. Click below to continue."
                : "Verify your identity to enable payouts."}
            </p>
          </div>
          <Button
            onClick={() => handleOpenLink(bridgeData?.kycLink, "KYC")}
            className="bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 h-9 text-sm shrink-0 whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open KYC
          </Button>
        </div>
      )}

      {/* Terms of Service */}
      {bridgeTosStatus !== "approved" && (
        <div className="bg-[#DBEAFE] border border-[#0084FD] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#0084FD] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#003DA5]">
              Accept Terms of Service
            </p>
            <p className="text-sm text-[#0084FD] mt-1">
              {bridgeTosStatus === "pending"
                ? "Your ToS acceptance is pending. Click below to continue."
                : "Accept our terms of service to complete setup."}
            </p>
          </div>
          <Button
            onClick={() =>
              handleOpenLink(bridgeData?.tosLink, "Terms of Service")
            }
            className="bg-[#0084FD] text-white hover:bg-[#0084FD]/90 h-9 text-sm shrink-0 whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Accept ToS
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {bridgeKycStatus === "approved" && bridgeTosStatus === "approved" && (
        <div className="bg-[#D1FAE5] border border-[#10B981] rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#065F46]">
              Verification Complete
            </p>
            <p className="text-sm text-[#047857] mt-1">
              All verifications are complete. You can now process payouts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
