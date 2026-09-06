"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCompanyOffRampQuote,
  initiateCompanyFiatWithdrawal,
  type CompanyOffRampQuoteResponse,
} from "@/lib/company-offramp-service";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useWalletStore } from "@/store/wallet-store";
import { Loader2 } from "lucide-react";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";

interface CompanyFiatWithdrawalFormProps {
  onSuccess?: () => void;
}

type WithdrawalStep = "form" | "verification";

interface WithdrawalFormData {
  amount: number;
  reason: string;
}

export function CompanyFiatWithdrawalForm({
  onSuccess,
}: CompanyFiatWithdrawalFormProps) {
  const [step, setStep] = useState<WithdrawalStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [withdrawalData, setWithdrawalData] =
    useState<WithdrawalFormData | null>(null);
  const [quote, setQuote] = useState<CompanyOffRampQuoteResponse | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const { walletData } = useWalletStore();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<WithdrawalFormData>({
    defaultValues: {
      reason: "",
      amount: undefined,
    },
  });

  const walletBalance = walletData?.balance ?? 0;
  const requestedAmount = watch("amount");
  const debouncedAmount = useDebounce(requestedAmount, 500);

  useEffect(() => {
    const amount = Number(debouncedAmount);

    if (!debouncedAmount || Number.isNaN(amount) || amount <= 0) {
      setQuote(null);
      setQuoteError("");
      return;
    }

    if (amount > walletBalance) {
      setQuote(null);
      setQuoteError("");
      return;
    }

    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      setQuoteError("");

      try {
        const quoteResponse = await getCompanyOffRampQuote(amount);
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
  }, [debouncedAmount, walletBalance]);

  const handleRequestCode = async () => {
    try {
      await requestTransactionVerificationCode("COMPANY_WITHDRAWAL_FIAT");
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

  const onSubmit = async (data: WithdrawalFormData) => {
    try {
      if (!data.amount || data.amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (data.amount > walletBalance) {
        toast.error("Insufficient balance");
        return;
      }

      setWithdrawalData(data);

      // Request verification code before showing verification step
      setIsSubmitting(true);
      try {
        await requestTransactionVerificationCode("COMPANY_WITHDRAWAL_FIAT");
        toast.success("Verification code sent to your email!");
        setStep("verification");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to send verification code";
        toast.error(errorMessage);
        setWithdrawalData(null);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to prepare withdrawal";
      toast.error(errorMessage);
      console.error("Withdrawal error:", error);
    }
  };

  const handleConfirmCode = async (code: string) => {
    if (!withdrawalData) return;
    setIsSubmitting(true);
    setVerificationError("");

    try {
      await initiateCompanyFiatWithdrawal({
        amount: withdrawalData.amount,
        verificationCode: code,
        reason: withdrawalData.reason,
      });

      toast.success("Withdrawal initiated successfully!");
      reset();
      setStep("form");
      setWithdrawalData(null);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate withdrawal";
      setVerificationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "verification") {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#101828] mb-2">
            Verify Withdrawal
          </h3>
          <p className="text-sm text-[#667085]">
            Amount: ${withdrawalData?.amount.toFixed(2)}
          </p>
        </div>

        <EmailVerificationCodeStep
          onBack={() => {
            setStep("form");
            setWithdrawalData(null);
            setVerificationError("");
          }}
          onConfirm={handleConfirmCode}
          isSubmitting={isSubmitting}
          error={verificationError}
          onResendCode={handleRequestCode}
          isResending={isResending}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-[#101828] mb-1.5">
          Amount to Withdraw
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            {...register("amount", {
              required: "Amount is required",
              valueAsNumber: true,
              validate: (value) => {
                if (!value || value <= 0)
                  return "Amount must be greater than 0";
                if (value > walletBalance) return "Insufficient balance";
                return true;
              },
            })}
            className="pl-8"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#667085]">
            $
          </span>
        </div>
        <p className="text-xs text-[#667085] mt-2">
          Available balance: ${walletBalance.toFixed(2)}
        </p>
        {isQuoteLoading && (
          <p className="text-xs text-[#667085] mt-2">Loading quote...</p>
        )}
        {quote && !quoteError && (
          <div className="mt-3 rounded-lg border border-[#e0e0e0] bg-[#f9fafb] p-4 space-y-3">
            <p className="text-sm font-medium text-[#101828]">Quote Summary</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Exchange Rate</span>
                <span className="font-medium text-[#101828]">
                  1 USD = {quote.rate.toFixed(4)} {quote.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#eaeaea] pt-2">
                <span className="text-[#667085]">You&apos;ll Receive</span>
                <span className="text-base font-bold text-[#0166f4]">
                  {quote.amountReceived.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  {quote.currency}
                </span>
              </div>
            </div>
          </div>
        )}
        {quoteError && (
          <p className="text-xs text-[#dc2626] mt-2">{quoteError}</p>
        )}
        {errors.amount && (
          <p className="text-xs text-[#dc2626] mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-[#101828] mb-1.5">
          Withdrawal Reason
        </label>
        <Input
          placeholder="Enter withdrawal reason"
          {...register("reason", {
            required: "Withdrawal reason is required",
          })}
        />
        {errors.reason && (
          <p className="text-xs text-[#dc2626] mt-1">{errors.reason.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="mt-6">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Initiate Withdrawal"
        )}
      </Button>
    </form>
  );
}
