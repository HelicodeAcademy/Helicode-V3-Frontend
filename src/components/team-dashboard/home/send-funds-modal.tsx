"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTeamTransactionVerificationCode } from "@/lib/team/transaction-verification-service";
import { initiateTeamCryptoWithdrawal } from "@/lib/team/team-transaction-service";

interface SendFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SendFundsStep = "details" | "verification" | "success";

interface CryptoWithdrawalFormData {
  walletAddress: string;
  amount: number;
}

export function SendFundsModal({ open, onOpenChange }: SendFundsModalProps) {
  const [step, setStep] = useState<SendFundsStep>("details");
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [sendData, setSendData] = useState<CryptoWithdrawalFormData | null>(
    null,
  );

  const { watch, reset, setValue } = useForm<CryptoWithdrawalFormData>({
    defaultValues: {
      walletAddress: "",
      amount: undefined,
    },
  });

  const walletAddress = watch("walletAddress");
  const amount = watch("amount");

  useEffect(() => {
    if (!open) return;

    setStep("details");
    reset({
      walletAddress: "",
      amount: undefined,
    });
    setAmountError("");
    setAddressError("");
    setIsSubmitting(false);
    setVerificationError("");
    setSendData(null);
  }, [open, reset]);

  const validateInputs = () => {
    let isValid = true;

    if (!walletAddress || walletAddress.trim() === "") {
      setAddressError("Wallet address is required");
      isValid = false;
    } else {
      setAddressError("");
    }

    if (!amount || amount <= 0) {
      setAmountError("Amount must be greater than 0");
      isValid = false;
    } else {
      setAmountError("");
    }

    return isValid;
  };

  const handleContinue = async () => {
    if (!validateInputs()) {
      return;
    }

    setSendData({ walletAddress, amount });
    setIsSubmitting(true);

    try {
      await requestTeamTransactionVerificationCode("TEAM_WITHDRAWAL_CRYPTO");
      toast.success("Verification code sent to your email!");
      setStep("verification");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      toast.error(errorMessage);
      setSendData(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCode = async () => {
    try {
      await requestTeamTransactionVerificationCode("TEAM_WITHDRAWAL_CRYPTO");
      toast.success("Verification code sent to your email!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleConfirmCode = async (code: string) => {
    if (!sendData) return;
    setIsSubmitting(true);
    setVerificationError("");

    try {
      await initiateTeamCryptoWithdrawal({
        amount: sendData.amount.toString(),
        verificationCode: code,
        toAddress: sendData.walletAddress,
      });

      toast.success("Funds sent successfully!");
      setStep("success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send funds";
      setVerificationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#101928]">
                Send funds
              </DialogTitle>
              <DialogDescription className="text-sm text-[#475367]">
                Instant withdrawal to another crypto wallet
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label
                    htmlFor="to-address"
                    className="text-sm font-medium text-[#344054]"
                  >
                    To
                  </Label>
                  <Input
                    id="to-address"
                    placeholder="Enter wallet address"
                    className="mt-1"
                    value={walletAddress}
                    onChange={(event) => {
                      setValue("walletAddress", event.target.value);
                      if (event.target.value) setAddressError("");
                    }}
                  />
                  {addressError && (
                    <p className="mt-1 text-xs text-red-500">{addressError}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-[#344054]">
                    Network
                  </Label>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-2">
                    <Image
                      src="/wallet/base.svg"
                      alt="BASE"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm font-medium text-[#344054]">
                      BASE
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-32">
                  <Label className="text-sm font-medium text-[#344054]">
                    Asset
                  </Label>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-2">
                    <Image
                      src="/wallet/usdc.svg"
                      alt="USDC"
                      width={16}
                      height={16}
                    />
                    <span className="text-sm font-medium text-[#344054]">
                      USDC
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="amount"
                    className="text-sm font-medium text-[#344054]"
                  >
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount?.toString() || ""}
                    onChange={(event) => {
                      const nextAmount = Number(event.target.value);
                      setValue("amount", nextAmount);

                      if (!event.target.value) {
                        setAmountError("");
                        return;
                      }

                      if (nextAmount <= 0) {
                        setAmountError("Amount must be greater than 0");
                        return;
                      }

                      setAmountError("");
                    }}
                  />
                  {amountError && (
                    <p className="mt-1 text-xs text-red-500">{amountError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  className="bg-[#000000] px-6 font-medium text-white disabled:opacity-50"
                  onClick={handleContinue}
                  disabled={
                    !walletAddress ||
                    !amount ||
                    amountError !== "" ||
                    addressError !== "" ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? "Sending code..." : "Continue"}
                </Button>
              </div>
            </div>
          </>
        ) : step === "verification" ? (
          <EmailVerificationCodeStep
            onBack={() => {
              setStep("details");
              setSendData(null);
              setVerificationError("");
            }}
            onConfirm={handleConfirmCode}
            isSubmitting={isSubmitting}
            error={verificationError}
            onResendCode={handleRequestCode}
            isResending={isResending}
          />
        ) : (
          <div className="space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex justify-center">
              <Image
                src="/payroll/modal-illustration.png"
                alt="Success"
                width={384}
                height={220}
                className="mx-auto"
              />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-[#101928]">
                Funds sent successfully
              </DialogTitle>
              <DialogDescription className="text-sm text-[#475367]">
                Your crypto has been successfully sent to the wallet address
              </DialogDescription>
            </div>

            <div className="flex pt-4">
              <Button
                className="bg-[#000000] px-6 font-medium text-white"
                onClick={handleGoHome}
              >
                Go home
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
