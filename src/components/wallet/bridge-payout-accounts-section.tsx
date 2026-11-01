"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  listBridgePayouts,
  railLabel,
  type BridgePayoutAccount,
  type BridgePayoutCurrency,
} from "@/lib/bridge-payout-service";
import { BridgePayoutAccountModal } from "./bridge-payout-account-modal";

interface BridgePayoutAccountsSectionProps {
  forTeam?: boolean;
  canWrite?: boolean;
  enabled?: boolean;
}

export function BridgePayoutAccountsSection({
  forTeam = false,
  canWrite = true,
  enabled = true,
}: BridgePayoutAccountsSectionProps) {
  const [accounts, setAccounts] = useState<BridgePayoutAccount[]>([]);
  const [feePercent, setFeePercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BridgePayoutAccount | null>(null);
  const [presetCurrency, setPresetCurrency] = useState<
    BridgePayoutCurrency | undefined
  >();

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listBridgePayouts(forTeam);
      setAccounts(data.payouts ?? []);
      setFeePercent(data.feePercent);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load payout accounts",
      );
    } finally {
      setIsLoading(false);
    }
  }, [forTeam]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  if (!enabled) return null;

  const usd = accounts.find((account) => account.currency === "USD");
  const eur = accounts.find((account) => account.currency === "EUR");

  const openAdd = (currency?: BridgePayoutCurrency) => {
    setEditing(null);
    setPresetCurrency(currency);
    setModalOpen(true);
  };

  const openEdit = (account: BridgePayoutAccount) => {
    setEditing(account);
    setPresetCurrency(account.currency);
    setModalOpen(true);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[#98A2B3]">
            US and EU bank payouts
          </h3>
          <p className="mt-1 text-sm text-[#667085]">
            Send USDC to a US bank (ACH, wire or FedNow) or a European IBAN.
            {feePercent != null
              ? ` Helicode fee ${feePercent}%.`
              : ""}
          </p>
        </div>
        {canWrite ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-full border-[#D0D5DD] px-4 text-[#344054]"
            onClick={() => openAdd()}
          >
            Add account
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 sm:p-5 space-y-4">
        {isLoading ? (
          <div className="h-16 animate-pulse rounded-xl bg-[#F2F4F7]" />
        ) : (
          <>
            <AccountRow
              label="USD"
              account={usd}
              canWrite={canWrite}
              onAdd={() => openAdd("USD")}
              onEdit={() => usd && openEdit(usd)}
            />
            <AccountRow
              label="EUR"
              account={eur}
              canWrite={canWrite}
              onAdd={() => openAdd("EUR")}
              onEdit={() => eur && openEdit(eur)}
            />
          </>
        )}
      </div>

      <BridgePayoutAccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        forTeam={forTeam}
        existing={editing}
        presetCurrency={presetCurrency}
        onSuccess={() => void load()}
      />
    </section>
  );
}

function AccountRow({
  label,
  account,
  canWrite,
  onAdd,
  onEdit,
}: {
  label: string;
  account?: BridgePayoutAccount;
  canWrite: boolean;
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-[#101828]">{label}</p>
        {account ? (
          <p className="text-sm text-[#667085]">
            {railLabel(account.rail)} · {account.accountOwnerName} · ending{" "}
            {account.last4}
          </p>
        ) : (
          <p className="text-sm text-[#98A2B3]">No account saved</p>
        )}
      </div>
      {canWrite ? (
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-full border-[#D0D5DD] px-4 text-[#344054]"
          onClick={account ? onEdit : onAdd}
        >
          {account ? "Update" : "Add"}
        </Button>
      ) : null}
    </div>
  );
}
