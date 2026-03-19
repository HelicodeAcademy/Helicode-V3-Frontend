"use client";

import { useContext, useState, useEffect } from "react";
import { getTeamMe } from "@/lib/team/team-auth-service";
import { TeamMeResponse } from "@/store/team/team-auth-store";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { TeamPageTitleContext } from "../layout";

export default function ContractPage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const [contractData, setContractData] = useState<
    TeamMeResponse["contract"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTitle("Contract");
    fetchContractData();
  }, [setTitle]);

  const fetchContractData = async () => {
    try {
      setIsLoading(true);

      const data = await getTeamMe();
      setContractData(data.contract);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch contract";
      toast.error(errorMessage);
      console.error("Contract fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contractData?.document) return;
    try {
      const link = document.createElement("a");
      link.href = contractData.document;
      link.download = "contract.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Contract downloaded");
    } catch (error) {
      toast.error("Failed to download contract");
      console.error(error);
    }
  };

  const handleOpenExternal = () => {
    if (contractData?.document) {
      window.open(contractData.document, "_blank");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#101828]">Your Contract</h1>
        <p>Review and manage your employment contract</p>
      </div>

      {/* Contract status card */}
      <div className="bg-white border border-[#EAEAEA] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#101828] mb-2">
              Contract status
            </h2>
            {isLoading ? (
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  contractData?.isSigned
                    ? "bg-[#c8e8d5] text-[#219d53]"
                    : "bg-[#fef3c7] text-[#d97706]"
                }`}
              >
                {contractData?.isSigned ? "Signed" : "Pending Signature"}
              </div>
            )}
          </div>
        </div>

        {/* Document Preview Section */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96 bg-[#f9fafb] rounded-lg border border-[#d0d5dd]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        ) : contractData?.document ? (
          <div className="space-y-4">
            {/* Embed PDF Preview */}
            <div className="bg-[#f9fafb] rounded-lg border border-[#d0d5dd] overflow-hidden">
              <iframe
                src={`${contractData.document}#toolbar=1`}
                className="w-full h-screen rounded-lg"
                title="Contract PDF"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleOpenExternal}
                className="flex-1 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 border-[#d0d5dd]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-[#f9fafb] rounded-lg border border-[#d0d5dd]">
            <p className="text-[#667085]">No contract document available</p>
          </div>
        )}
      </div>
    </div>
  );
}
