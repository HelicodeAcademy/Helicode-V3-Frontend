"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/store/wallet-store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { initiateCryptoWithdrawal } from "@/lib/wallet-service";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { CryptoSendFundsForm } from "@/components/wallet/crypto-send-funds-form";

interface WithdrawFundsModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WithdrawStep = "details" | "verification" | "success";

interface CryptoWithdrawalFormData {
  walletAddress: string;
  amount: string;
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
  const amount = watch("amount") || "";
  const availableBalance = walletData?.balance ?? 0;
  const parsedAmount = Number(amount);

  useEffect(() => {
    if (!open) return;

    setStep("details");
    reset({
      walletAddress: "",
      amount: "",
    });
    setAmountError("");
    setAddressError("");
    setIsSubmitting(false);
    setVerificationError("");
  }, [open, reset]);

  const validateAmountValue = (value: string): string => {
    if (!value) return "";
    const nextAmount = Number(value);
    if (Number.isNaN(nextAmount) || nextAmount <= 0) {
      return "Amount must be greater than 0";
    }
    if (nextAmount > availableBalance) {
      return "Amount cannot exceed available balance";
    }
    return "";
  };

  const handleAmountChange = (value: string) => {
    setValue("amount", value);
    setAmountError(validateAmountValue(value));
  };

  const validateInputs = () => {
    let isValid = true;

    if (!walletAddress || walletAddress.trim() === "") {
      setAddressError("Wallet address is required");
      isValid = false;
    } else {
      setAddressError("");
    }

    const nextAmountError = validateAmountValue(amount);
    if (nextAmountError || !amount) {
      setAmountError(nextAmountError || "Amount must be greater than 0");
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

  const canContinue = Boolean(
    walletAddress && amount && !addressError && !amountError,
  );

  const showSummary =
    Boolean(amount) &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    !amountError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-visible rounded-2xl border-0 p-6 sm:max-w-108!"
      >
        {step === "details" ? (
          <CryptoSendFundsForm
            walletAddress={walletAddress}
            amount={amount}
            availableBalance={availableBalance}
            addressError={addressError}
            amountError={amountError}
            youSendUsdc={showSummary ? parsedAmount : null}
            feeUsdc={showSummary ? 0 : null}
            destinationUsdc={showSummary ? parsedAmount : null}
            showSummary={showSummary}
            isLoading={isSubmitting}
            canContinue={canContinue}
            onWalletAddressChange={(value) => {
              setValue("walletAddress", value);
              if (value) setAddressError("");
            }}
            onAmountChange={handleAmountChange}
            onContinue={() => void handleContinue()}
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
          <div className="space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
            <Image
              src="/payroll/modal-illustration.png"
              alt="Success"
              width={394}
              height={220}
              className="w-full"
            />

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
                className="h-11 w-full rounded-xl bg-[#0084FD] font-semibold text-white hover:bg-[#0070DB]"
                onClick={() => onOpenChange(false)}
              >
                Go to home
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
