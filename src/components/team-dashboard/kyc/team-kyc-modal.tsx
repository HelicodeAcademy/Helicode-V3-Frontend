"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { TeamKYCForm } from "./team-kyc-form";
import {
  initiateBridgeKyc,
  BridgeKycInitResponse,
} from "@/lib/team/team-kyc-service";

interface TeamKYCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type KYCStep = "choose" | "form" | "bridge";

const STEP_COPY: Record<KYCStep, { title: string; description: string }> = {
  choose: {
    title: "Choose Your Payout Method",
    description:
      "Select how you would like to receive your payouts before completing verification.",
  },
  form: {
    title: "Complete KYC Verification",
    description:
      "To access full features and process withdrawals, please complete your Know Your Customer (KYC) verification.",
  },
  bridge: {
    title: "Complete Bridge Verification",
    description:
      "Complete the two steps below to enable stablecoin payouts to your crypto wallet.",
  },
};

export function TeamKYCModal({
  open,
  onOpenChange,
  onSuccess,
}: TeamKYCModalProps) {
  const [step, setStep] = useState<KYCStep>("choose");
  const [isInitiating, setIsInitiating] = useState(false);
  const [bridgeData, setBridgeData] = useState<BridgeKycInitResponse | null>(
    null,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStep("choose");
      setBridgeData(null);
    }
  };

  const handleSelectStablecoinOnly = async () => {
    try {
      setIsInitiating(true);
      const data = await initiateBridgeKyc();
      setBridgeData(data);
      setStep("bridge");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start stablecoin verification";
      toast.error(errorMessage);
      console.error("Bridge KYC initiation error:", error);
    } finally {
      setIsInitiating(false);
    }
  };

  const handleOpenLink = (link: string | undefined, linkType: string) => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      toast.error(`${linkType} link is not available`);
    }
  };

  const handleBridgeDone = () => {
    onSuccess?.();
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            {STEP_COPY[step].title}
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            {STEP_COPY[step].description}
          </DialogDescription>
        </DialogHeader>

        {step === "choose" && (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSelectStablecoinOnly}
              disabled={isInitiating}
              className="w-full cursor-pointer flex items-start gap-3 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isInitiating ? (
                <Loader2 className="h-5 w-5 mt-0.5 shrink-0 animate-spin text-[#0052FF]" />
              ) : (
                <Image
                  src="/wallet/Coin.svg"
                  alt="coin"
                  width={25.57}
                  height={19.49}
                  className="mt-0.5 shrink-0"
                />
              )}
              <span>
                <span className="block text-[#000000] font-medium">
                  Stablecoin only
                </span>
                <span className="block text-sm text-[#667085] mt-1">
                  Receive payouts in stablecoin to your crypto wallet. Choose
                  this if local currency payouts are not supported in your
                  country.
                </span>
              </span>
            </button>

            <button
              onClick={() => setStep("form")}
              disabled={isInitiating}
              className="w-full cursor-pointer flex items-start gap-3 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Image
                src="/wallet/bank.svg"
                alt="bank"
                width={24}
                height={24}
                className="mt-0.5 shrink-0"
              />
              <span>
                <span className="block text-[#000000] font-medium">
                  Stablecoin + local currency
                </span>
                <span className="block text-sm text-[#667085] mt-1">
                  Receive payouts in stablecoin or directly to your local bank
                  account.
                </span>
              </span>
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="mt-2">
            <button
              onClick={() => setStep("choose")}
              className="flex items-center gap-1 text-sm text-[#667085] hover:text-[#101828] transition-colors mb-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to payout options
            </button>
            <TeamKYCForm
              onSuccess={() => {
                onSuccess?.();
                handleOpenChange(false);
              }}
            />
          </div>
        )}

        {step === "bridge" && (
          <div className="mt-6 space-y-3">
            {/* KYC Verification */}
            <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#92400E]">
                  Complete KYC Verification
                </p>
                <p className="text-sm text-[#B45309] mt-1">
                  Verify your identity to enable stablecoin payouts.
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

            {/* Terms of Service */}
            <div className="bg-[#DBEAFE] border border-[#0084FD] rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#0084FD] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#003DA5]">
                  Accept Terms of Service
                </p>
                <p className="text-sm text-[#0084FD] mt-1">
                  Accept our terms of service to complete setup.
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

            <Button onClick={handleBridgeDone} className="w-full mt-2">
              I&apos;ve completed both steps
            </Button>
          </div>
        )}

        <p className="text-xs text-[#667085] mt-4 text-center">
          Your information is secure and will be used only for verification
          purposes.
        </p>
      </DialogContent>
    </Dialog>
  );
}
