"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, X } from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  LOCAL_ACCOUNTS,
  type AccountCode,
  type LocalAccount,
} from "@/lib/local-accounts";
import { useLocalAccountsStore } from "@/store/local-accounts-store";
import { cn } from "@/lib/utils";
import { CurrencyMark } from "./currency-mark";
import Image from "next/image";

const CHOICES: AccountCode[] = ["USD", "NGN", "EUR", "GHS"];

function choiceCopy(account: LocalAccount) {
  if (account.code === "USD") {
    return "Account + routing number · ACH & domestic wire";
  }
  if (account.code === "NGN") {
    return "NUBAN account · transfers from any Nigerian bank";
  }
  if (account.code === "EUR") {
    return "IBAN in your company name · SEPA & SWIFT";
  }
  return "Local bank account · pay out to banks & mobile money";
}

function badgeLabel(account: LocalAccount, opened: boolean) {
  if (opened && account.code !== "EUR" && account.code !== "GHS")
    return "Active";
  if (account.code === "USD" || account.code === "NGN") return "Active";
  if (account.badge === "instant") return "Instant";
  return "Review · 1–2 days";
}

interface AddCurrencyAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  preset: AccountCode | null;
  onLive: (account: LocalAccount) => void;
}

export function AddCurrencyAccountDialog({
  open,
  onOpenChange,
  companyName,
  preset,
  onLive,
}: AddCurrencyAccountDialogProps) {
  const opened = useLocalAccountsStore((state) => state.opened);
  const openAccount = useLocalAccountsStore((state) => state.openAccount);
  const choices = useMemo(
    () =>
      CHOICES.map(
        (code) => LOCAL_ACCOUNTS.find((account) => account.code === code)!,
      ).filter(Boolean),
    [],
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<AccountCode>("EUR");
  const [useOfAccount, setUseOfAccount] = useState("");
  const [volume, setVolume] = useState("");
  const [countries, setCountries] = useState<string[]>([]);
  const [countryDraft, setCountryDraft] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [proofName, setProofName] = useState("proof-of-address-aug-2026.pdf");

  const account = choices.find((item) => item.code === selected) ?? choices[2];

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setConfirmed(false);
    const next = preset ?? "EUR";
    setSelected(next);
    const match = LOCAL_ACCOUNTS.find((item) => item.code === next);
    setUseOfAccount(match?.useOptions[0] ?? "");
    setVolume(match?.volumeOptions[1] ?? match?.volumeOptions[0] ?? "");
    setCountries(match?.defaultCountries ?? []);
  }, [open, preset]);

  const selectAccount = (code: AccountCode) => {
    if (code === "USD" || code === "NGN") return;
    setSelected(code);
    const match = LOCAL_ACCOUNTS.find((item) => item.code === code);
    setUseOfAccount(match?.useOptions[0] ?? "");
    setVolume(match?.volumeOptions[1] ?? match?.volumeOptions[0] ?? "");
    setCountries(match?.defaultCountries ?? []);
  };

  const addCountry = () => {
    const value = countryDraft.trim();
    if (!value || countries.includes(value)) {
      setCountryDraft("");
      return;
    }
    setCountries((current) => [...current, value]);
    setCountryDraft("");
  };

  const submit = () => {
    if (!confirmed || !account) return;
    if (account.badge === "instant" || account.code === "GHS") {
      openAccount(account.code);
      onOpenChange(false);
      onLive(account);
      return;
    }
    openAccount(account.code);
    onOpenChange(false);
    toast.success(`${account.name} account submitted for review.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-150!">
        <DialogTitle className="sr-only">Add a currency account</DialogTitle>
        {step === 1 ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#101828]">
              Add a currency account
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              Step 1 of 2 · Choose the currency you want to activate
            </p>
            <div className="mt-5 space-y-3">
              {choices.map((item) => {
                const locked = item.code === "USD" || item.code === "NGN";
                const isSelected = selected === item.code;
                const label = badgeLabel(item, opened.includes(item.code));
                return (
                  <button
                    key={item.code}
                    type="button"
                    disabled={locked}
                    onClick={() => selectAccount(item.code)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left",
                      locked && "cursor-default bg-white",
                      isSelected && !locked
                        ? "border-[#0052FF] border-2 bg-[#F5F8FF]"
                        : "border-[#EAECF0]",
                    )}
                  >
                    <CurrencyMark mark={item.mark} className="h-9 w-9" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0C1424]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#667085]">
                        {choiceCopy(item)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        label === "Active" && "bg-[#ECFDF3] text-[#027A48]",
                        label.startsWith("Review") &&
                          "bg-[#FFFAEB] text-[#B54708]",
                        label === "Instant" &&
                          "border border-[#D0D5DD] bg-white text-[#344054]",
                      )}
                    >
                      {label}
                    </span>
                    {!locked && (
                      <span
                        className={cn(
                          "ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-[#0052FF] bg-[#0052FF]"
                            : "border-[#D0D5DD] bg-white",
                        )}
                      >
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2 rounded-xl bg-[#E4F4EC] px-4 py-3 text-xs text-[#0C1424]">
              <Image
                src="/account/check.svg"
                alt="Check"
                width={13}
                height={20}
              />

              <p>
                Company verification complete. Instant accounts go live right
                away; USD and EUR need a short review by our banking partner.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-[#D0D5DD]"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-10 font-semibold rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
                onClick={() => setStep(2)}
              >
                Continue with{" "}
                {account.code === "EUR"
                  ? "Euro"
                  : account.code === "GHS"
                    ? "Ghana Cedi"
                    : account.name}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#344054]"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <span className="text-sm text-[#667085]">Step 2 of 2</span>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <CurrencyMark mark={account.mark} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#101828]">
                    Activate {account.name} account
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      account.badge === "instant"
                        ? "border border-[#D0D5DD] text-[#344054]"
                        : "bg-[#FFFAEB] text-[#B54708]",
                    )}
                  >
                    {account.badge === "instant"
                      ? "Instant"
                      : "Review 1–2 days"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#667085]">
                  {account.reviewNote}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4">
              <p className="text-[11px] font-medium tracking-wide text-[#98A2B3] uppercase">
                What you&apos;ll get
              </p>
              <ul className="mt-3 space-y-2">
                {account.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-sm text-[#0C1424]"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E9F0FF]">
                      <Check className="mt-0.5 h-3 w-3 text-[#0052FF]" />
                    </div>
                    {benefit.replace("your company", `${companyName}'s`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-[#344054]">
                  Main use of this account
                </span>
                <Select value={useOfAccount} onValueChange={setUseOfAccount}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {account.useOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-[#344054]">
                  Expected monthly volume
                </span>
                <Select value={volume} onValueChange={setVolume}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {account.volumeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-[#344054]">
                Countries you&apos;ll transact with
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-[#D0D5DD] px-3 py-2">
                {countries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-sm text-[#344054]"
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
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <Input
                  value={countryDraft}
                  onChange={(event) => setCountryDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCountry();
                    }
                  }}
                  onBlur={addCountry}
                  placeholder="Add country..."
                  className="h-8 w-36 border-0 px-1 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-[#344054]">Documents</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-[#EAECF0] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[#66748C] text-xs font-bold bg-[#EDF1F7] py-2 px-1.5 rounded-lg">
                      <span>PDF</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">
                        Certificate of incorporation
                      </p>
                      <p className="text-xs text-[#667085]">
                        Already on file from company verification
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#027A48] bg-[#E4F4EC] px-2 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B7A55]" />
                    On file
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#EAECF0] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[#66748C] text-xs font-bold bg-[#EDF1F7] py-2 px-1.5 rounded-lg">
                      <span>PDF</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">
                        {proofName}
                      </p>
                      <p className="text-xs text-[#667085]">
                        Proof of business address · 1.2 MB
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer text-sm font-semibold text-[#0052FF]">
                    Replace
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setProofName(file.name);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm text-[#344054]">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#0052FF] rounded-sm"
              />
              I confirm this information is accurate and {companyName} is the
              account owner.
            </label>

            <hr className="my-6 border-[#EAECF0]" />

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-[#D0D5DD]"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!confirmed}
                className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
                onClick={submit}
              >
                {account.badge === "instant"
                  ? "Activate account"
                  : "Submit for review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
