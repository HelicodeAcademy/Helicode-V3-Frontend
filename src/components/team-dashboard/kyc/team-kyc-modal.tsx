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
import {
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
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
type PayoutMethod = "digital-only" | "digital-local";

const STEP_COPY: Record<
  Exclude<KYCStep, "choose">,
  { title: string; description: string }
> = {
  form: {
    title: "Complete KYC Verification",
    description:
      "To access full features and process withdrawals, please complete your Know Your Customer (KYC) verification.",
  },
  bridge: {
    title: "Complete Verification",
    description:
      "Complete the two steps below to enable stablecoin payouts to your crypto wallet.",
  },
};

const PAYOUT_OPTIONS: Array<{
  value: PayoutMethod;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    value: "digital-only",
    title: "Digital Dollars only",
    description:
      "Get paid in digital dollars to your crypto wallet. Choose this if local currency payouts aren't supported in your country.",
    icon: "/team/dollar-circle.svg",
  },
  {
    value: "digital-local",
    title: "Digital Dollars + local currency",
    description:
      "Get paid in digital dollars, or straight into your local bank account.",
    icon: "/team/bank.svg",
  },
];

function PayoutMethodOption({
  title,
  description,
  icon,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-[#0052FF] bg-white"
          : "border-[#E4E7EC] bg-white hover:border-[#D0D5DD]",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F2F6FF]">
        <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#0B1524]">{title}</p>
        <p className="mt-1 text-sm leading-[145%] text-[#5A6779]">
          {description}
        </p>
      </div>

      <span
        className={cn(
          "mt-1 h-5 w-5 shrink-0 rounded-full bg-white",
          selected
            ? "border-[6.5px] border-[#0052FF]"
            : "border-2 border-[#D0D5DD]",
        )}
      />
    </button>
  );
}

export function TeamKYCModal({
  open,
  onOpenChange,
  onSuccess,
}: TeamKYCModalProps) {
  const [step, setStep] = useState<KYCStep>("choose");
  const [selectedPayoutMethod, setSelectedPayoutMethod] =
    useState<PayoutMethod>("digital-only");
  const [isInitiating, setIsInitiating] = useState(false);
  const [bridgeData, setBridgeData] = useState<BridgeKycInitResponse | null>(
    null,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setStep("choose");
      setSelectedPayoutMethod("digital-only");
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

  const handleContinue = async () => {
    if (selectedPayoutMethod === "digital-only") {
      await handleSelectStablecoinOnly();
      return;
    }

    setStep("form");
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-120 rounded-3xl p-8"
        showCloseButton={false}
      >
        {step === "choose" ? (
          <>
            <DialogHeader className="text-left">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-semibold text-[#0B1524]">
                  Choose your payout method
                </DialogTitle>
                <div
                  className="h-9 w-9 rounded-full cursor-pointer bg-[#F1F4F9] flex justify-center items-center"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="h-5 w-5 text-[#5A6779]" />
                </div>
              </div>
              <DialogDescription className="mt-2 text-base text-[#5A6779]">
                Receive your money in digital dollars or directly in your local
                bank account.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              {PAYOUT_OPTIONS.map((option) => (
                <PayoutMethodOption
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={selectedPayoutMethod === option.value}
                  onSelect={() => setSelectedPayoutMethod(option.value)}
                />
              ))}
            </div>

            <Button
              onClick={() => void handleContinue()}
              disabled={isInitiating}
              className="mt-6 w-full"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Continuing...
                </>
              ) : (
                "Continue"
              )}
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-[#8A94A6]">
              <Image src="/team/Lock.svg" alt="lock" width={16} height={16} />
              Your information is secure and used only for verification.
            </p>
          </>
        ) : (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl text-[#101828]">
                {STEP_COPY[step].title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-[#667085]">
                {STEP_COPY[step].description}
              </DialogDescription>
            </DialogHeader>

            {step === "form" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="mb-4 flex items-center gap-1 text-sm text-[#667085] transition-colors hover:text-[#101828]"
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
                <div className="flex items-start gap-3 rounded-lg border border-[#F59E0B] bg-[#FEF3C7] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#92400E]">
                      Complete KYC Verification
                    </p>
                    <p className="mt-1 text-sm text-[#B45309]">
                      Verify your identity to enable stablecoin payouts.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleOpenLink(bridgeData?.kycLink, "KYC")}
                    className="h-9 shrink-0 bg-[#F59E0B] text-sm whitespace-nowrap text-white hover:bg-[#F59E0B]/90"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open KYC
                  </Button>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-[#0084FD] bg-[#DBEAFE] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#0084FD]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#003DA5]">
                      Accept Terms of Service
                    </p>
                    <p className="mt-1 text-sm text-[#0084FD]">
                      Accept our terms of service to complete setup.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      handleOpenLink(bridgeData?.tosLink, "Terms of Service")
                    }
                    className="h-9 shrink-0 bg-[#0084FD] text-sm whitespace-nowrap text-white hover:bg-[#0084FD]/90"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Accept ToS
                  </Button>
                </div>

                <Button onClick={handleBridgeDone} className="mt-2 w-full">
                  I&apos;ve completed both steps
                </Button>
              </div>
            )}

            <p className="mt-4 text-center text-xs text-[#8A94A6]">
              Your information is secure and will be used only for verification
              purposes.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
