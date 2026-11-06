"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl border-[#E4E7EC] p-0 sm:max-w-[600px]">
        <div className="border-b border-[#F2F4F7] px-6 pt-5 pb-4 pr-12">
          <DialogTitle className="text-xl font-semibold text-[#101828]">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#667085]">
            We&apos;ll save these details so you can pay out again in one click.
            Money is sent from your USDC wallet.
          </DialogDescription>
        </div>
        {open ? (
          <div className="px-6 py-5">
            <BridgePayoutAccountForm
              key={`${existing?.currency ?? presetCurrency ?? "new"}-${existing?.updatedAt ?? "new"}`}
              forTeam={forTeam}
              existing={existing}
              presetCurrency={presetCurrency}
              onCancel={() => onOpenChange(false)}
              onSuccess={(account) => {
                onSuccess?.(account);
                onOpenChange(false);
              }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
