"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTeamTransactionVerificationCode } from "@/lib/team/transaction-verification-service";
import {
  getTeamCryptoOffRampQuote,
  getTeamTransactions,
  initiateTeamCryptoWithdrawal,
  type TeamCryptoOffRampQuoteResponse,
} from "@/lib/team/team-transaction-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useTeamKYCStore } from "@/store/team/team-kyc-store";
import { CryptoSendFundsForm } from "@/components/wallet/crypto-send-funds-form";

interface SendFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SendFundsStep = "details" | "verification" | "success";

interface CryptoWithdrawalFormData {
  walletAddress: string;
  amount: string;
}

export function SendFundsModal({ open, onOpenChange }: SendFundsModalProps) {
  const [step, setStep] = useState<SendFundsStep>("details");
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [sendData, setSendData] = useState<{
    walletAddress: string;
    amount: number;
  } | null>(null);
  const [quote, setQuote] = useState<TeamCryptoOffRampQuoteResponse | null>(
    null,
  );
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const { teamMember } = useTeamKYCStore();
  const walletBalance = teamMember?.wallet?.balance || 0;

  const { watch, reset, setValue } = useForm<CryptoWithdrawalFormData>({
    defaultValues: {
      walletAddress: "",
      amount: "",
    },
  });

  const walletAddress = watch("walletAddress");
  const amount = watch("amount") || "";
  const parsedAmount = Number(amount);
  const debouncedAmount = useDebounce(parsedAmount, 500);

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
    setSendData(null);
    setQuote(null);
    setQuoteError("");
    setIsQuoteLoading(false);
  }, [open, reset]);

  useEffect(() => {
    if (!open || step !== "details") return;

    const nextAmount = Number(debouncedAmount);

    if (
      !amount ||
      Number.isNaN(nextAmount) ||
      nextAmount <= 0 ||
      nextAmount > walletBalance
    ) {
      setQuote(null);
      setQuoteError("");
      return;
    }

    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      setQuoteError("");

      try {
        const quoteResponse = await getTeamCryptoOffRampQuote(nextAmount);
        setQuote(quoteResponse);
      } catch (error) {
        setQuote(null);
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load quote";
        setQuoteError(errorMessage);
      } finally {
        setIsQuoteLoading(false);
      }
    };

    void fetchQuote();
  }, [amount, debouncedAmount, open, step, walletBalance]);

  const validateAmountValue = (value: string): string => {
    if (!value) return "";
    const nextAmount = Number(value);
    if (Number.isNaN(nextAmount) || nextAmount <= 0) {
      return "Amount must be greater than 0";
    }
    if (nextAmount > walletBalance) {
      return "Insufficient balance";
    }
    return "";
  };

  const handleAmountChange = (value: string) => {
    setValue("amount", value);
    const error = validateAmountValue(value);
    setAmountError(error);
    if (error) {
      setQuote(null);
      setQuoteError("");
    }
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

    if (!quote || quoteError) {
      toast.error(quoteError || "Please wait for a valid quote");
      return;
    }

    setSendData({ walletAddress, amount: parsedAmount });
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
      getTeamTransactions();
      setStep("success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send funds";
      setVerificationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = Boolean(
    walletAddress &&
    amount &&
    !amountError &&
    !addressError &&
    !isQuoteLoading &&
    !quoteError &&
    quote,
  );

  const showSummary =
    Boolean(amount) &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    !amountError &&
    Boolean(quote) &&
    !quoteError;

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
            availableBalance={walletBalance}
            addressError={addressError}
            amountError={amountError}
            quoteError={quoteError}
            isQuoteLoading={isQuoteLoading}
            youSendUsdc={quote?.amountUsdc ?? null}
            feeUsdc={quote?.feeUsdc ?? null}
            destinationUsdc={quote?.netUsdc ?? quote?.amountReceived ?? null}
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
                className="h-11 w-full rounded-xl bg-[#0084FD] font-semibold text-white hover:bg-[#0070DB]"
                onClick={() => onOpenChange(false)}
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
