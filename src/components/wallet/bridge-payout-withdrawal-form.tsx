"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { OfframpFiatQuoteSummary } from "@/components/wallet/offramp-quote-summary";
import { BridgePayoutAccountModal } from "@/components/wallet/bridge-payout-account-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { useMoneyTwoFa } from "@/hooks/use-money-two-fa";
import {
  listBridgePayouts,
  pollBridgePayoutWithdrawal,
  quoteBridgePayout,
  railLabel,
  referenceLimit,
  withdrawBridgePayout,
  type BridgePayoutAccount,
  type BridgePayoutCurrency,
  type BridgePayoutQuote,
} from "@/lib/bridge-payout-service";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { requestTeamTransactionVerificationCode } from "@/lib/team/transaction-verification-service";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface BridgePayoutWithdrawalFormProps {
  forTeam?: boolean;
  walletBalance: number;
  onSuccess?: () => void;
}

type Step = "form" | "verification";

export function BridgePayoutWithdrawalForm({
  forTeam = false,
  walletBalance,
  onSuccess,
}: BridgePayoutWithdrawalFormProps) {
  const { requireAuthenticator, handleSubmitError } = useMoneyTwoFa(forTeam);
  const [accounts, setAccounts] = useState<BridgePayoutAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [currency, setCurrency] = useState<BridgePayoutCurrency>("USD");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [quote, setQuote] = useState<BridgePayoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [presetCurrency, setPresetCurrency] = useState<
    BridgePayoutCurrency | undefined
  >();

  const parsedAmount = Number(amount);
  const debouncedAmount = useDebounce(parsedAmount, 500);

  const selected = useMemo(
    () => accounts.find((account) => account.currency === currency),
    [accounts, currency],
  );
  const maxReference = selected ? referenceLimit(selected.rail) : 140;

  const loadAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const data = await listBridgePayouts(forTeam);
      const payouts = data.payouts ?? [];
      setAccounts(payouts);
      if (!payouts.some((account) => account.currency === currency)) {
        const next = payouts[0]?.currency;
        if (next) setCurrency(next);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load payout accounts",
      );
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forTeam]);

  useEffect(() => {
    if (!selected) {
      setQuote(null);
      setQuoteError("");
      return;
    }
    if (!debouncedAmount || Number.isNaN(debouncedAmount) || debouncedAmount <= 0) {
      setQuote(null);
      setQuoteError("");
      return;
    }
    if (debouncedAmount > walletBalance) {
      setQuote(null);
      setQuoteError("");
      return;
    }

    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      setQuoteError("");
      try {
        const next = await quoteBridgePayout(forTeam, currency, debouncedAmount);
        setQuote(next);
      } catch (error) {
        setQuote(null);
        setQuoteError(
          error instanceof Error ? error.message : "Unable to load quote",
        );
      } finally {
        setIsQuoteLoading(false);
      }
    };

    void fetchQuote();
  }, [debouncedAmount, currency, forTeam, selected, walletBalance]);

  const requestEmail = async () => {
    if (forTeam) {
      await requestTeamTransactionVerificationCode("TEAM_WITHDRAWAL_FIAT");
    } else {
      await requestTransactionVerificationCode("COMPANY_WITHDRAWAL_FIAT");
    }
    toast.success("Verification code sent to your email!");
  };

  const amountError = (() => {
    if (!amount) return "";
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return "Amount must be greater than 0";
    }
    if (Number(parsedAmount.toFixed(2)) !== parsedAmount) {
      return "Amount must have at most 2 decimal places";
    }
    if (parsedAmount > walletBalance) return "Insufficient balance";
    return "";
  })();

  const startVerification = async () => {
    if (amountError) {
      toast.error(amountError);
      return;
    }
    if (!selected) {
      toast.error(`Save a ${currency} payout account first.`);
      return;
    }
    if (!quote || quoteError) {
      toast.error(quoteError || "Please wait for a valid quote");
      return;
    }
    if (reference.length > maxReference) {
      toast.error(
        `Reference must be ${maxReference} characters or fewer.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await requestEmail();
      setStep("verification");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification code",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (verificationCode: string, code2fa?: string) => {
    setIsSubmitting(true);
    setVerificationError("");
    try {
      const result = await withdrawBridgePayout(forTeam, {
        currency,
        amount: parsedAmount,
        verificationCode,
        ...(code2fa ? { code2fa } : {}),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
      });

      if (result.pending && result.withdrawalId) {
        toast.success("Payout submitted. Confirming with the bank...");
        const settled = await pollBridgePayoutWithdrawal(
          forTeam,
          result.withdrawalId,
        );
        if (settled.pending) {
          toast.success(
            "This payout is still processing. It will not debit again.",
          );
        } else {
          toast.success("Withdrawal initiated successfully!");
        }
      } else {
        toast.success("Withdrawal initiated successfully!");
      }

      setAmount("");
      setReference("");
      setQuote(null);
      setStep("form");
      onSuccess?.();
    } catch (error) {
      const message = await handleSubmitError(error, requestEmail);
      setVerificationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "verification") {
    return (
      <EmailVerificationCodeStep
        onBack={() => {
          setStep("form");
          setVerificationError("");
        }}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
        error={verificationError}
        onResendCode={requestEmail}
        requireAuthenticator={requireAuthenticator}
      />
    );
  }

  if (isLoadingAccounts) {
    return <div className="h-32 animate-pulse rounded-xl bg-[#F2F4F7]" />;
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#667085]">
          Save a USD or EUR payout account before withdrawing.
        </p>
        <Button
          type="button"
          onClick={() => {
            setPresetCurrency(undefined);
            setAccountModalOpen(true);
          }}
        >
          Add payout account
        </Button>
        <BridgePayoutAccountModal
          open={accountModalOpen}
          onOpenChange={setAccountModalOpen}
          forTeam={forTeam}
          onSuccess={() => void loadAccounts()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#101828]">
          Currency
        </label>
        <Select
          value={currency}
          onValueChange={(value) => setCurrency(value as BridgePayoutCurrency)}
        >
          <SelectTrigger className="h-9 border-[#E4E7EC]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.currency} value={account.currency}>
                {account.currency} · {railLabel(account.rail)} · ending{" "}
                {account.last4}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selected ? (
          <button
            type="button"
            className="mt-2 text-sm text-[#0052FF]"
            onClick={() => {
              setPresetCurrency(currency);
              setAccountModalOpen(true);
            }}
          >
            Save a {currency} payout account
          </button>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#101828]">
          Amount to send
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="pl-8"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">
            $
          </span>
        </div>
        <p className="mt-2 text-xs text-[#667085]">
          Available balance: ${walletBalance.toFixed(2)} USDC. The wallet is
          debited this amount.
        </p>
        {isQuoteLoading ? (
          <p className="mt-2 text-xs text-[#667085]">Loading quote...</p>
        ) : null}
        {quote && !quoteError ? <OfframpFiatQuoteSummary quote={quote} /> : null}
        {quoteError ? (
          <p className="mt-2 text-xs text-[#dc2626]">{quoteError}</p>
        ) : null}
        {amountError ? (
          <p className="mt-1 text-xs text-[#dc2626]">{amountError}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#101828]">
          Reference (optional)
        </label>
        <Input
          value={reference}
          maxLength={maxReference}
          onChange={(event) => setReference(event.target.value)}
          placeholder={
            maxReference === 10
              ? "Up to 10 characters"
              : "Up to 140 characters"
          }
        />
      </div>

      <Button
        type="button"
        onClick={() => void startVerification()}
        disabled={
          isSubmitting ||
          isQuoteLoading ||
          !!quoteError ||
          !quote ||
          !!amountError ||
          !selected
        }
        className="mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Initiate Withdrawal"
        )}
      </Button>

      <BridgePayoutAccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
        forTeam={forTeam}
        presetCurrency={presetCurrency}
        onSuccess={() => void loadAccounts()}
      />
    </div>
  );
}
