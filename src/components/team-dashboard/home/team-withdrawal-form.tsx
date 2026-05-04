"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getTeamTransactions,
  initiateWalletWithdrawal,
  // WithdrawalData,
} from "@/lib/team/team-transaction-service";
import { useTeamKYCStore } from "@/store/team/team-kyc-store";
import { Loader2 } from "lucide-react";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTeamTransactionVerificationCode } from "@/lib/team/transaction-verification-service";

interface TeamWithdrawalFormProps {
  onSuccess?: () => void;
}

type WithdrawalStep = "form" | "verification";

interface WithdrawalFormData {
  amount: number;
  reason: string;
}

export function TeamWithdrawalForm({ onSuccess }: TeamWithdrawalFormProps) {
  const [step, setStep] = useState<WithdrawalStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [withdrawalData, setWithdrawalData] =
    useState<WithdrawalFormData | null>(null);
  const { teamMember } = useTeamKYCStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WithdrawalFormData>({
    defaultValues: {
      reason: "",
      amount: undefined,
    },
  });

  const walletBalance = teamMember?.wallet?.balance || 0;

  const handleRequestCode = async () => {
    try {
      await requestTeamTransactionVerificationCode("TEAM_WITHDRAWAL_FIAT");
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
        await requestTeamTransactionVerificationCode("TEAM_WITHDRAWAL_FIAT");
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
      await initiateWalletWithdrawal({
        amount: withdrawalData.amount,
        verificationCode: code,
        reason: withdrawalData.reason,
      });

      toast.success("Withdrawal initiated successfully!");
      getTeamTransactions();
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
