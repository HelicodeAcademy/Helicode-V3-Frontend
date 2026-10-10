"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAccountRequest,
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

function badgeFor(item: CatalogCurrency) {
  if (item.accountStatus === "ACTIVE") return "Active";
  if (item.accountStatus === "PENDING_REVIEW") return "Review · 1–2 days";
  if (item.availability === "COMING_SOON") return "Coming soon";
  if (item.activation === "REVIEW") return "Review · 1–2 days";
  if (item.activation === "AUTOMATIC") return "Active";
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
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [mainUse, setMainUse] = useState("");
  const [volume, setVolume] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [countryDraft, setCountryDraft] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [existingProof, setExistingProof] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const choices = currencies.filter(
    (item) => item.availability === "AVAILABLE" || item.accountStatus,
  );
  const account = choices.find((item) => item.code === selected) ?? null;

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setConfirmed(false);
    setProof(null);
    setExistingProof(null);
    setCountryDraft("");
    const available = currencies.filter(
      (item) => item.availability === "AVAILABLE" || item.accountStatus,
    );
    const next =
      preset ??
      available.find(
        (item) =>
          item.availability === "AVAILABLE" &&
          item.accountStatus !== "ACTIVE" &&
          item.activation === "REVIEW",
      )?.code ??
      available[0]?.code ??
      null;
    setSelected(next);
  }, [open, preset, currencies]);

  useEffect(() => {
    if (!account) return;
    setMainUse(account.useOptions[0] ?? "");
    setVolume(account.volumeOptions[0] ?? "");
    setCountries([]);
    setProof(null);
    setExistingProof(null);
    setConfirmed(false);

    if (
      account.accountStatus !== "PENDING_REVIEW" &&
      account.accountStatus !== "REJECTED"
    ) {
      return;
    }

    let cancelled = false;
    void getAccountRequest(account.code)
      .then((request) => {
        if (cancelled) return;
        if (request.mainUse) setMainUse(request.mainUse);
        if (request.expectedMonthlyVolume) setVolume(request.expectedMonthlyVolume);
        setCountries(request.countries ?? []);
        setExistingProof(request.proofOfAddressUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [account]);

  const addCountry = () => {
    const value = countryDraft.trim();
    if (!value || countries.includes(value) || countries.length >= 30) {
      setCountryDraft("");
      return;
    }
    setCountries((current) => [...current, value]);
    setCountryDraft("");
  };

  const continueFromStep1 = () => {
    if (!account || !canRequest) return;
    if (account.accountStatus === "ACTIVE" || account.activation === "AUTOMATIC") {
      return;
    }
    if (account.availability === "COMING_SOON") return;
    setStep(2);
  };

  const submit = async () => {
    if (!account || !confirmed || !canRequest) return;
    if (!mainUse || !volume || countries.length === 0) {
      toast.error("Complete the account details before submitting.");
      return;
    }
    if (!proof && !existingProof) {
      toast.error("Proof of business address is required.");
      return;
    }
    if (proof && proof.size > 5 * 1024 * 1024) {
      toast.error("Proof of address must be 5 MB or smaller.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await requestCurrencyAccount({
        currency: account.code,
        mainUse,
        expectedMonthlyVolume: volume,
        countries,
        proofOfAddress: proof,
        confirmed: true,
      });
      notifyAccountsChanged();
      onSubmitted();
      onOpenChange(false);
      if (result.hostedLink) {
        window.open(result.hostedLink, "_blank", "noopener,noreferrer");
      }
      toast.success(
        result.status === "ACTIVE"
          ? "Account opened"
          : `${account.name} account submitted for review.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to request account",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Add account</DialogTitle>
        {step === 1 ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#101828]">Add account</h2>
            <p className="mt-1 text-sm text-[#667085]">
              Choose the currency you want to activate
            </p>
            <div className="mt-5 space-y-2">
              {choices.map((item) => {
                const locked =
                  item.accountStatus === "ACTIVE" ||
                  item.activation === "AUTOMATIC" ||
                  item.availability === "COMING_SOON";
                const badge = badgeFor(item);
                return (
                  <button
                    key={item.code}
                    type="button"
                    disabled={locked}
                    onClick={() => setSelected(item.code)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left",
                      selected === item.code
                        ? "border-[#0052FF] bg-[#F5F8FF]"
                        : "border-[#E4E7EC]",
                      locked && "cursor-default opacity-80",
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
                    {badge && (
                      <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-xs font-medium text-[#667085]">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
                disabled={
                  !account ||
                  !canRequest ||
                  account.accountStatus === "ACTIVE" ||
                  account.activation !== "REVIEW" ||
                  account.availability === "COMING_SOON"
                }
                onClick={continueFromStep1}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          account && (
            <div className="p-6">
              <button
                type="button"
                className="text-sm font-medium text-[#667085]"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <h2 className="mt-2 text-lg font-semibold text-[#101828]">
                Activate {account.name}
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Our banking partner reviews this before the account opens.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                    Main use
                  </label>
                  <Select value={mainUse} onValueChange={setMainUse}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Choose a use" />
                    </SelectTrigger>
                    <SelectContent>
                      {account.useOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                    Expected monthly volume
                  </label>
                  <Select value={volume} onValueChange={setVolume}>
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Choose a volume" />
                    </SelectTrigger>
                    <SelectContent>
                      {account.volumeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                    Countries you expect to receive from
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={countryDraft}
                      onChange={(event) => setCountryDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCountry();
                        }
                      }}
                      placeholder="Add a country"
                      className="h-11 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl"
                      onClick={addCountry}
                    >
                      Add
                    </Button>
                  </div>
                  {countries.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {countries.map((country) => (
                        <span
                          key={country}
                          className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#344054]"
                        >
                          {country}
                          <button
                            type="button"
                            aria-label={`Remove ${country}`}
                            onClick={() =>
                              setCountries((current) =>
                                current.filter((item) => item !== country),
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#344054]">
                    Proof of business address
                  </label>
                  <Input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="h-11 rounded-xl"
                    onChange={(event) =>
                      setProof(event.target.files?.[0] ?? null)
                    }
                  />
                  {existingProof && !proof && (
                    <p className="mt-1 text-xs text-[#667085]">
                      A file is already on record. Upload a new one to replace
                      it.
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#EAECF0] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#101828]">
                      Certificate of incorporation
                    </p>
                    <p className="text-xs text-[#667085]">On file</p>
                  </div>
                  <Check className="h-4 w-4 text-[#039855]" />
                </div>
                <label className="flex items-start gap-2 text-sm text-[#344054]">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#0052FF]"
                  />
                  I confirm this information is accurate.
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
                  disabled={isSubmitting || !confirmed || !canRequest}
                  onClick={() => void submit()}
                >
                  {isSubmitting ? "Submitting..." : "Submit for review"}
                </Button>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
