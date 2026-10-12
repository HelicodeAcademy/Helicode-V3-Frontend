"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  notifyAccountsChanged,
  requestCurrencyAccount,
  type CatalogCurrency,
} from "@/lib/accounts-service";
import { railsLabel } from "@/lib/account-format";
import { cn } from "@/lib/utils";
import { CurrencyMark } from "./currency-mark";

interface AddCurrencyAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: CatalogCurrency[];
  preset: string | null;
  canRequest: boolean;
  onSubmitted: () => void;
}

export function canActivateAccount(item: CatalogCurrency) {
  return (
    item.activation === "REVIEW" &&
    (item.accountStatus === null || item.accountStatus === "REJECTED")
  );
}

function badgeFor(item: CatalogCurrency) {
  if (item.accountStatus === "ACTIVE") return "Active";
  if (item.accountStatus === "PENDING_REVIEW") return "Review";
  if (item.availability === "COMING_SOON") return "Coming soon";
  return null;
}

export function AddCurrencyAccountDialog({
  open,
  onOpenChange,
  currencies,
  preset,
  canRequest,
  onSubmitted,
}: AddCurrencyAccountDialogProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  const choices = currencies.filter(
    (item) => item.availability === "AVAILABLE" || item.accountStatus,
  );

  useEffect(() => {
    if (!open) return;
    const available = currencies.filter(
      (item) => item.availability === "AVAILABLE" || item.accountStatus,
    );
    const next =
      preset ??
      available.find((item) => canActivateAccount(item))?.code ??
      available[0]?.code ??
      null;
    setSelected(next);
  }, [open, preset, currencies]);

  const activate = async (item: CatalogCurrency) => {
    if (!canRequest) {
      toast.error("Only the employer can activate an account.");
      return;
    }
    try {
      setActivating(item.code);
      const result = await requestCurrencyAccount(item.code);
      notifyAccountsChanged();
      onSubmitted();
      onOpenChange(false);
      if (result.status === "ACTIVE") {
        toast.success("Account opened");
        router.push(`/dashboard/accounts/${item.code.toLowerCase()}`);
        return;
      }
      if (result.hostedLink) {
        window.open(result.hostedLink, "_blank", "noopener,noreferrer");
      }
      toast.success("Account request received");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to request account",
      );
    } finally {
      setActivating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Add account</DialogTitle>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#101828]">Add account</h2>
          <p className="mt-1 text-sm text-[#667085]">
            Choose the currency you want to activate
          </p>
          <div className="mt-5 space-y-2">
            {choices.map((item) => {
              const activateEnabled = canActivateAccount(item);
              const badge = badgeFor(item);
              const locked = !activateEnabled;
              return (
                <div
                  key={item.code}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left",
                    selected === item.code
                      ? "border-[#0052FF] bg-[#F5F8FF]"
                      : "border-[#E4E7EC]",
                  )}
                >
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setSelected(item.code)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 text-left",
                      locked && "cursor-default",
                    )}
                  >
                    <CurrencyMark currency={item.code} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#101828]">
                        {item.name}
                      </span>
                      <span className="block text-xs text-[#667085]">
                        {railsLabel(item.code) || item.rails.join(" · ")}
                      </span>
                    </span>
                  </button>
                  {activateEnabled ? (
                    <Button
                      type="button"
                      className="h-8 rounded-lg bg-[#0052FF] px-3 text-white hover:bg-[#0041CC]"
                      disabled={!canRequest || activating === item.code}
                      onClick={() => void activate(item)}
                    >
                      {activating === item.code ? "Activating..." : "Activate"}
                    </Button>
                  ) : (
                    badge && (
                      <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-xs font-medium text-[#667085]">
                        {badge}
                      </span>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
