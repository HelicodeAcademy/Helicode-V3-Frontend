"use client";

import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, X } from "lucide-react";
import Image from "next/image";
import { formatUsdc } from "@/lib/offramp-fee";

export interface CryptoSendFundsFormProps {
  walletAddress: string;
  amount: string;
  availableBalance: number;
  addressError?: string;
  amountError?: string;
  quoteError?: string;
  isQuoteLoading?: boolean;
  /** Fee breakdown — pass quote values (team) or amount / 0 / amount (company). */
  youSendUsdc: number | null;
  feeUsdc: number | null;
  destinationUsdc: number | null;
  showSummary: boolean;
  isLoading?: boolean;
  canContinue: boolean;
  onWalletAddressChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onContinue: () => void;
}

function formatDisplayUsdc(value: number): string {
  return formatUsdc(value);
}

export function CryptoSendFundsForm({
  walletAddress,
  amount,
  availableBalance,
  addressError,
  amountError,
  quoteError,
  isQuoteLoading = false,
  youSendUsdc,
  feeUsdc,
  destinationUsdc,
  showSummary,
  isLoading = false,
  canContinue,
  onWalletAddressChange,
  onAmountChange,
  onContinue,
}: CryptoSendFundsFormProps) {
  const parsedAmount = Number(amount);
  const usdEstimate =
    amount !== "" && !Number.isNaN(parsedAmount) && parsedAmount >= 0
      ? parsedAmount
      : 0;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onWalletAddressChange(text.trim());
    } catch {
      // Clipboard access may be denied; user can still type.
    }
  };

  const handleMax = () => {
    const max = availableBalance > 0 ? availableBalance.toFixed(2) : "0";
    onAmountChange(max);
  };

  return (
    <div className="relative">
      <DialogClose
        className="absolute -top-1 right-0 flex size-8 items-center justify-center rounded-full bg-[#F2F4F7] text-[#667085] transition-colors hover:bg-[#E4E7EC] hover:text-[#101828] focus:outline-none"
        aria-label="Close"
      >
        <X className="size-4" />
      </DialogClose>

      <DialogHeader className="gap-1 pr-10 text-left">
        <DialogTitle className="text-[1.5rem] font-semibold leading-tight text-[#000000]">
          Send funds
        </DialogTitle>
        <DialogDescription className="text-sm text-[#6B7280]">
          Instant withdrawal to another crypto wallet
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-5">
        {/* Recipient wallet address */}
        <div>
          <Label
            htmlFor="recipient-wallet-address"
            className="text-sm font-medium text-[#344054]"
          >
            Recipient wallet address
          </Label>
          <div
            className={cn(
              "mt-1.5 flex h-11 items-center gap-2 rounded-xl border bg-white px-3",
              addressError ? "border-red-400" : "border-[#D0D5DD]",
            )}
          >
            <input
              id="recipient-wallet-address"
              type="text"
              placeholder="0x0000...0000"
              value={walletAddress}
              onChange={(event) => onWalletAddressChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#101828] outline-none placeholder:text-[#98A2B3]"
            />
            <button
              type="button"
              onClick={() => void handlePaste()}
              className="shrink-0 rounded-md bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold text-[#0052FF]"
              style={{
                backgroundColor: "#EEF3FF",
              }}
            >
              Paste
            </button>
          </div>
          {addressError ? (
            <p className="mt-1.5 text-xs text-red-500">{addressError}</p>
          ) : (
            <p className="mt-1.5 text-xs text-[#98A2B3]">
              Double check the address, crypto transfers can&apos;t be reversed.
            </p>
          )}
        </div>

        {/* Network */}
        <div>
          <Label className="text-sm font-medium text-[#344054]">Network</Label>
          <div className="mt-1.5 flex h-11 w-full items-center justify-between rounded-xl border border-[#D0D5DD] bg-white px-3">
            <div className="flex items-center gap-2">
              <Image
                src="/wallet/base.svg"
                alt="Base"
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-sm font-medium text-[#101828]">Base</span>
            </div>
            <ChevronDown className="size-4 text-[#98A2B3]" aria-hidden />
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <Label
              htmlFor="send-amount"
              className="text-sm font-medium text-[#344054]"
            >
              Amount
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#667085]">
                Balance {formatDisplayUsdc(availableBalance)} USDC
              </span>
              <button
                type="button"
                onClick={handleMax}
                className="rounded-md bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold text-[#0052FF]"
                style={{
                  backgroundColor: "#EEF3FF",
                }}
              >
                Max
              </button>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3",
              amountError ? "border-red-400" : "border-[#0052FF]",
            )}
            style={
              amountError ? undefined : { boxShadow: "0 0 0 3px #0052FF29" }
            }
          >
            <div className="min-w-0 flex-1">
              <input
                id="send-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                className="w-full bg-transparent text-2xl font-semibold leading-none text-[#0A0D14] outline-none [appearance:textfield] placeholder:text-[#D0D5DD] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <p className="mt-1 text-sm text-[#98A2B3]">
                ≈ ${usdEstimate.toFixed(2)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F4F5F7] px-2.5 py-1.5">
              <Image src="/wallet/usdc.svg" alt="USDC" width={18} height={18} />
              <span className="text-sm font-medium text-[#0A0D14]">USDC</span>
            </div>
          </div>

          {amountError ? (
            <p className="mt-1.5 text-xs text-red-500">{amountError}</p>
          ) : null}
          {isQuoteLoading ? (
            <p className="mt-1.5 text-xs text-[#667085]">Loading quote...</p>
          ) : null}
          {quoteError ? (
            <p className="mt-1.5 text-xs text-red-500">{quoteError}</p>
          ) : null}
        </div>

        {/* Fee summary */}
        {showSummary &&
        youSendUsdc !== null &&
        feeUsdc !== null &&
        destinationUsdc !== null ? (
          <div className="space-y-3 rounded-xl bg-[#F9FAFB] px-4 py-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6B7280]">You send</span>
              <span className="font-medium text-[#0A0D14]">
                {formatDisplayUsdc(youSendUsdc)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6B7280]">Helicode fee</span>
              <span className="font-medium text-[#0A0D14]">
                {formatDisplayUsdc(feeUsdc)} USDC
              </span>
            </div>
            <div className="border-t border-[#E4E7EC] pt-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0A0D14]">
                    Destination receives
                  </p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">
                    Arrives in about 5 seconds
                  </p>
                </div>
                <p className="text-xl font-semibold leading-none text-[#0A0D14]">
                  {formatDisplayUsdc(destinationUsdc)} USDC
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0052FF] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Sending code...
            </span>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}
