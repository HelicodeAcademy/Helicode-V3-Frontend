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
import { useWalletStore } from "@/store/wallet-store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { initiateCryptoWithdrawal } from "@/lib/wallet-service";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { Loader2 } from "lucide-react";

interface WithdrawFundsModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WithdrawStep = "details" | "verification" | "success";

interface CryptoWithdrawalFormData {
  walletAddress: string;
  amount: string;
}

interface WithdrawDetailsStepProps {
  walletAddress: string;
  amount: string;
  availableBalance: number;
  addressError: string;
  amountError: string;
  onWalletAddressChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

interface WithdrawSuccessStepProps {
  onGoHome: () => void;
}

function WithdrawDetailsStep({
  walletAddress,
  amount,
  availableBalance,
  addressError,
  amountError,
  onWalletAddressChange,
  onAmountChange,
  onContinue,
  isLoading = false,
}: WithdrawDetailsStepProps) {
  const canContinue = walletAddress && amount && !addressError && !amountError;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Withdraw funds
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475367]">
          Instant withdrawal to your crypto wallet
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
              placeholder="Paste address"
              className="mt-1"
              value={walletAddress}
              onChange={(event) => onWalletAddressChange(event.target.value)}
            />
            {addressError ? (
              <p className="mt-1 text-xs text-red-500">{addressError}</p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <Label className="text-sm font-medium text-[#344054]">
              Network
            </Label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-2">
              <Image src="/wallet/base.svg" alt="BASE" width={16} height={16} />
              <span className="text-sm font-medium text-[#344054]">BASE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-32">
            <Label className="text-sm font-medium text-[#344054]">Asset</Label>
            <div className="mt-1 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/wallet/usdc.svg"
                  alt="USDC"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-[#344054]">USDC</span>
              </div>
            </div>
            <span className="mt-1 block text-xs text-[#667085]">
              Balance: ${availableBalance.toFixed(2)}
            </span>
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
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
            />
            {amountError ? (
              <p className="mt-1 text-xs text-red-500">{amountError}</p>
            ) : (
              <p className="mt-1 text-xs text-[#667085]">
                You can withdraw up to ${availableBalance.toFixed(2)}.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            className="bg-[#000000] px-6 font-medium text-white disabled:opacity-50"
            onClick={onContinue}
            disabled={!canContinue || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

function WithdrawSuccessStep({ onGoHome }: WithdrawSuccessStepProps) {
  return (
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
          Withdrawal successful
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475367]">
          Your crypto has been successfully sent to the wallet address you
          provided
        </DialogDescription>
      </div>

      <div className="flex pt-4">
        <Button
          className="bg-[#000000] px-6 font-medium text-white"
          onClick={onGoHome}
        >
          Go to home
        </Button>
      </div>
    </div>
  );
}

export function WithdrawFundsModal({ open, onOpenChange }: WithdrawFundsModal) {
  const { walletData, setWalletData } = useWalletStore();
  const [step, setStep] = useState<WithdrawStep>("details");
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const { watch, reset, setValue } = useForm<CryptoWithdrawalFormData>({
    defaultValues: {
      walletAddress: "",
      amount: "",
    },
  });

  const walletAddress = watch("walletAddress");
  const amount = watch("amount");
  const availableBalance = walletData?.balance ?? 0;
  const parsedAmount = Number(amount);

  useEffect(() => {
    if (!open) return;

    setStep("details");
    reset({
      walletAddress: "",
      amount: " ",
    });
    setAmountError("");
    setAddressError("");
    setIsSubmitting(false);
    setVerificationError("");
  }, [open, reset]);

  const validateInputs = () => {
    let isValid = true;

    if (!walletAddress || walletAddress.trim() === "") {
      setAddressError("Wallet address is required");
      isValid = false;
    } else {
      setAddressError("");
    }

    if (!amount || Number(amount) <= 0) {
      setAmountError("Amount must be greater than 0");
      isValid = false;
    } else if (Number(amount) > availableBalance) {
      setAmountError("Amount cannot exceed available balance");
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

    setIsSubmitting(true);

    try {
      await requestTransactionVerificationCode("COMPANY_WITHDRAWAL_CRYPTO");
      toast.success("Verification code sent to your email!");
      setStep("verification");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCode = async () => {
    try {
      await requestTransactionVerificationCode("COMPANY_WITHDRAWAL_CRYPTO");
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
    setIsSubmitting(true);
    setVerificationError("");

    try {
      if (!amount || Number(amount) <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      await initiateCryptoWithdrawal({
        amount: amount.toString(),
        verificationCode: code,
        toAddress: walletAddress,
      });

      if (walletData) {
        setWalletData({
          ...walletData,
          balance:
            amount && !Number.isNaN(parsedAmount)
              ? Math.max(0, walletData.balance - parsedAmount)
              : walletData.balance,
        });
      }

      toast.success("Withdrawal initiated successfully!");
      setStep("success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Withdrawal failed. Please try again.";
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
          <WithdrawDetailsStep
            walletAddress={walletAddress}
            amount={amount?.toString() || ""}
            availableBalance={availableBalance}
            addressError={addressError}
            amountError={amountError}
            onWalletAddressChange={(value) => {
              setValue("walletAddress", value);
              if (value) setAddressError("");
            }}
            onAmountChange={(value) => {
              const nextAmount = value;
              setValue("amount", nextAmount);

              if (!value) {
                setAmountError("");
                return;
              }

              if (Number(nextAmount) <= 0) {
                setAmountError("Amount must be greater than 0.");
                return;
              }

              if (Number(nextAmount) > availableBalance) {
                setAmountError(
                  "Amount cannot be more than your available balance.",
                );
                return;
              }

              setAmountError("");
            }}
            onContinue={handleContinue}
            isLoading={isSubmitting}
          />
        ) : step === "verification" ? (
          <EmailVerificationCodeStep
            onBack={() => setStep("details")}
            onConfirm={handleConfirmCode}
            isSubmitting={isSubmitting}
            error={verificationError}
            onResendCode={handleRequestCode}
            isResending={isResending}
          />
        ) : (
          <WithdrawSuccessStep onGoHome={handleGoHome} />
        )}
      </DialogContent>
    </Dialog>
  );
}
