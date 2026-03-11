"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getKYCStatus } from "@/lib/kyc-service";
import { useKYCStore } from "@/store/kyc-store";
import toast from "react-hot-toast";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface KYCStatusCardProps {
  onStatusChange?: () => void;
}

export function KYCStatusCard({}: KYCStatusCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { kycStatus, setKYCStatus } = useKYCStore();

  useEffect(() => {
    fetchKYCStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await getKYCStatus();

      setKYCStatus(status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("KYC status error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (link: string, type: "kyc" | "tos") => {
    if (!link) {
      toast.error(`No ${type.toUpperCase()} link available`);
      return;
    }
    window.open(link, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-lg border border-[#eaeaea] bg-[#f9fafb] p-4">
        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[#eaeaea] bg-[#fef2f2] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#d97706] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-[#101828] text-sm">
              Error loading KYC status
            </p>
            <p className="text-xs text-[#667085] mt-1">{error}</p>
            <Button
              onClick={fetchKYCStatus}
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!kycStatus) {
    return null;
  }

  const statusIcon = kycStatus.kycStatus === "pending" ? Clock : CheckCircle2;
  const StatusIcon = statusIcon;

  return (
    <div className="space-y-3 rounded-lg border border-[#eaeaea] bg-[#f9fafb] p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-9 w-9 rounded-full bg-[#dde8ff] flex items-center justify-center">
          <StatusIcon className="h-5 w-5 text-[#0166f4]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#101828] text-sm">
            Finish setting up your account
          </p>
          <p className="text-xs text-[#696969] mt-1">
            To unlock all the benefits of Helicode&apos;s HR platform, complete
            your company details.
          </p>

          {/* Only shows for Pending KYC and when there is no kyc link and tosLink */}
          {kycStatus.kycStatus === "pending" &&
            !kycStatus.kycLink &&
            !kycStatus.tosLink && (
              <div className="mt-4 flex items-center gap-4">
                <span className="text-sm font-medium text-[#475367]">
                  KYC Status:
                </span>
                <p
                  // className={`text-xs leading-none font-medium px-2 py-1 rounded-full ${
                  //   kycStatus.kycStatus === "approved"
                  //     ? "bg-[#E0FFED] text-[#4D8F72] border border-[#CAEFDC]"
                  //     : kycStatus.kycStatus === "pending"
                  //       ? "bg-[#FDF4EC] text-[#DB8F3F] border border-[#FFD3A5]"
                  //       : kycStatus.kycStatus === "rejected"
                  //         ? "bg-[#FFEFEF] text-[#CC4646] border border-[#EEC5C5]"
                  //         : "bg-[#E9F0FF] text-[#0052FF] border border-[#BED3FF]"
                  // }`}
                  className="bg-[#FDF4EC] text-[#DB8F3F] border border-[#FFD3A5] text-xs leading-none font-medium px-2 py-1 rounded-full"
                >
                  {kycStatus.kycStatus}
                </p>
              </div>
            )}

          {/* KYC Status with Continue Button */}
          {/* only show when there is a kyc link */}
          {kycStatus.kycLink && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#667085]">
                KYC Status:{" "}
                <span
                  className={`text-xs leading-none font-medium px-2 py-1 rounded-full ${
                    kycStatus.kycStatus === "approved"
                      ? "bg-[#E0FFED] text-[#4D8F72] border border-[#CAEFDC]"
                      : kycStatus.kycStatus === "pending"
                        ? "bg-[#FDF4EC] text-[#DB8F3F] border border-[#FFD3A5]"
                        : kycStatus.kycStatus === "rejected"
                          ? "bg-[#FFEFEF] text-[#CC4646] border border-[#EEC5C5]"
                          : "bg-[#E9F0FF] text-[#0052FF] border border-[#BED3FF]"
                  }`}
                >
                  {kycStatus.kycStatus}
                </span>
              </span>
              {kycStatus.kycStatus === "not_started" && kycStatus.kycLink && (
                <Button
                  onClick={() => handleContinue(kycStatus.kycLink!, "kyc")}
                  size="sm"
                  className="h-6 px-2 text-xs bg-[#0166f4] text-white hover:bg-[#0166f4]/90"
                >
                  Continue
                </Button>
              )}
            </div>
          )}

          {/* TOS Status with Continue Button (if available) */}
          {kycStatus.tosStatus && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#667085]">
                TOS Status:{" "}
                <span
                  className={`text-xs leading-none font-medium px-2 py-1 rounded-full ${
                    kycStatus.kycStatus === "approved"
                      ? "bg-[#E0FFED] text-[#4D8F72] border border-[#CAEFDC]"
                      : kycStatus.kycStatus === "pending"
                        ? "bg-[#FDF4EC] text-[#DB8F3F] border border-[#FFD3A5]"
                        : kycStatus.kycStatus === "rejected"
                          ? "bg-[#FFEFEF] text-[#CC4646] border border-[#EEC5C5]"
                          : "bg-[#E9F0FF] text-[#0052FF] border border-[#BED3FF]"
                  }`}
                >
                  {" "}
                  {kycStatus.tosStatus}
                </span>
              </span>
              {kycStatus.tosStatus === "pending" && kycStatus.tosLink && (
                <Button
                  onClick={() => handleContinue(kycStatus.tosLink!, "tos")}
                  size="sm"
                  className="h-6 px-2 text-xs bg-[#0166f4] text-white hover:bg-[#0166f4]/90"
                >
                  Continue
                </Button>
              )}
            </div>
          )}

          {/* Start KYC Button for pending status */}
          {kycStatus.kycStatus === "pending" && !kycStatus.kycLink && (
            <Link href="/dashboard/setup-account">
              <Button className="mt-3 bg-[#0166f4] text-white text-xs h-7 hover:bg-[#0166f4]/90">
                Start KYC
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
