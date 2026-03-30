"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  initiateWalletWithdrawal,
  WithdrawalData,
} from "@/lib/team/team-transaction-service";
import { useTeamKYCStore } from "@/store/team/team-kyc-store";
import { Loader2 } from "lucide-react";

interface TeamWithdrawalFormProps {
  onSuccess?: () => void;
}

export function TeamWithdrawalForm({ onSuccess }: TeamWithdrawalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { teamMember } = useTeamKYCStore();
  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors },
    reset,
  } = useForm<WithdrawalData>({
    defaultValues: {
      reason: "",
      amount: undefined,
      pin: "",
    },
  });

  //   const amount = watch('amount')
  const walletBalance = teamMember?.wallet?.balance || 0;

  const onSubmit = async (data: WithdrawalData) => {
    try {
      setIsSubmitting(true);

      if (!data.amount || data.amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (data.amount > walletBalance) {
        toast.error("Insufficient balance");
        return;
      }

      if (!data.pin || data.pin.length < 4) {
        toast.error("Please enter a valid PIN");
        return;
      }

      await initiateWalletWithdrawal(data);
      toast.success("Withdrawal initiated successfully!");
      reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate withdrawal";
      toast.error(errorMessage);
      console.error("Withdrawal error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* PIN */}
      <div>
        <label className="block text-sm font-medium text-[#101828] mb-1.5">
          Transaction PIN
        </label>
        <Input
          type="password"
          placeholder="Enter your PIN"
          maxLength={4}
          {...register("pin", {
            required: "PIN is required",
            minLength: {
              value: 4,
              message: "PIN must be at least 4 digits",
            },
            pattern: {
              value: /^[0-9]*$/,
              message: "PIN must contain only numbers",
            },
          })}
        />
        {errors.pin && (
          <p className="text-xs text-[#dc2626] mt-1">{errors.pin.message}</p>
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
