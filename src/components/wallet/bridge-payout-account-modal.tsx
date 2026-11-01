"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BridgePayoutAccountForm } from "./bridge-payout-account-form";
import type {
  BridgePayoutAccount,
  BridgePayoutCurrency,
} from "@/lib/bridge-payout-service";

interface BridgePayoutAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forTeam?: boolean;
  existing?: BridgePayoutAccount | null;
  presetCurrency?: BridgePayoutCurrency;
  onSuccess?: (account: BridgePayoutAccount) => void;
}

export function BridgePayoutAccountModal({
  open,
  onOpenChange,
  forTeam = false,
  existing,
  presetCurrency,
  onSuccess,
}: BridgePayoutAccountModalProps) {
  const currency = existing?.currency ?? presetCurrency;
  const title =
    currency === "EUR"
      ? "EUR payout account"
      : currency === "USD"
        ? "USD payout account"
        : "US or EU payout account";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-[#667085]">
            Money is sent from your USDC wallet. Save one USD account and one
            EUR account.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <BridgePayoutAccountForm
            key={`${existing?.currency ?? presetCurrency ?? "new"}-${existing?.updatedAt ?? "new"}`}
            forTeam={forTeam}
            existing={existing}
            presetCurrency={presetCurrency}
            onSuccess={(account) => {
              onSuccess?.(account);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
