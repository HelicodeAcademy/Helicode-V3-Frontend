"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  saveBridgePayoutAccount,
  type BridgeAccountKind,
  type BridgeAccountOwnerType,
  type BridgePayoutAccount,
  type BridgePayoutCurrency,
  type BridgePayoutRail,
} from "@/lib/bridge-payout-service";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const SEPA_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "IS", "LI", "NO", "CH",
];

const USD_RAILS: { value: BridgePayoutRail; label: string }[] = [
  { value: "ach", label: "ACH" },
  { value: "ach_same_day", label: "Same-day ACH" },
  { value: "wire", label: "Wire" },
  { value: "fednow", label: "FedNow" },
];

interface BridgePayoutAccountFormProps {
  forTeam?: boolean;
  existing?: BridgePayoutAccount | null;
  presetCurrency?: BridgePayoutCurrency;
  onSuccess?: (account: BridgePayoutAccount) => void;
}

export function BridgePayoutAccountForm({
  forTeam = false,
  existing,
  presetCurrency,
  onSuccess,
}: BridgePayoutAccountFormProps) {
  const initialCurrency = existing?.currency ?? presetCurrency ?? "USD";
  const [currency, setCurrency] = useState<BridgePayoutCurrency>(initialCurrency);
  const [rail, setRail] = useState<BridgePayoutRail>(
    existing?.rail ?? (initialCurrency === "EUR" ? "sepa" : "ach"),
  );
  const [accountOwnerType, setAccountOwnerType] =
    useState<BridgeAccountOwnerType>(existing?.accountOwnerType ?? "individual");
  const [firstName, setFirstName] = useState(() => {
    if (existing?.accountOwnerType !== "individual") return "";
    return existing.accountOwnerName.split(" ")[0] ?? "";
  });
  const [lastName, setLastName] = useState(() => {
    if (existing?.accountOwnerType !== "individual") return "";
    return existing.accountOwnerName.split(" ").slice(1).join(" ");
  });
  const [businessName, setBusinessName] = useState(
    existing?.accountOwnerType === "business"
      ? existing.accountOwnerName
      : "",
  );
  const [bankName, setBankName] = useState(existing?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState(
    existing?.routingNumber ?? "",
  );
  const [accountKind, setAccountKind] = useState<BridgeAccountKind>(
    existing?.accountKind ?? "checking",
  );
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState(existing?.bic ?? "");
  const [line1, setLine1] = useState(existing?.addressLine1 ?? "");
  const [line2, setLine2] = useState(existing?.addressLine2 ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [state, setState] = useState(existing?.state ?? "");
  const [postalCode, setPostalCode] = useState(existing?.postalCode ?? "");
  const [country, setCountry] = useState(
    existing?.countryCode?.slice(0, 2).toUpperCase() ??
      (initialCurrency === "EUR" ? "DE" : "US"),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usdRails = useMemo(() => {
    return USD_RAILS.filter((option) => {
      if (option.value !== "fednow" || !existing) return true;
      return existing.supportedRails?.includes("fednow");
    });
  }, [existing]);

  const onCurrencyChange = (next: BridgePayoutCurrency) => {
    setCurrency(next);
    setRail(next === "EUR" ? "sepa" : "ach");
    setCountry(next === "EUR" ? "DE" : "US");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const ownerName =
      accountOwnerType === "business"
        ? businessName.trim()
        : `${firstName.trim()} ${lastName.trim()}`.trim();
    if (ownerName.length < 3 || ownerName.length > 35) {
      toast.error("The name sent to the bank must be 3 to 35 characters.");
      return;
    }

    if (currency === "USD") {
      if (!/^\d{9}$/.test(routingNumber.trim())) {
        toast.error("Routing number must be 9 digits.");
        return;
      }
      if (!accountNumber.trim()) {
        toast.error("Account number is required.");
        return;
      }
    } else if (!iban.trim()) {
      toast.error("IBAN is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await saveBridgePayoutAccount(forTeam, {
        currency,
        rail: currency === "EUR" ? "sepa" : rail,
        accountOwnerType,
        ...(accountOwnerType === "business"
          ? { businessName: businessName.trim() }
          : { firstName: firstName.trim(), lastName: lastName.trim() }),
        address: {
          line1: line1.trim(),
          ...(line2.trim() ? { line2: line2.trim() } : {}),
          city: city.trim(),
          ...(currency === "USD" ? { state: state.trim() } : {}),
          postalCode: postalCode.trim(),
          country: currency === "USD" ? "US" : country,
        },
        ...(currency === "USD"
          ? {
              bankName: bankName.trim(),
              accountNumber: accountNumber.trim(),
              routingNumber: routingNumber.trim(),
              accountKind,
            }
          : {
              iban: iban.trim(),
              ...(bic.trim() ? { bic: bic.trim() } : {}),
            }),
      });
      toast.success(
        currency === "USD"
          ? "USD payout account saved"
          : "EUR payout account saved",
      );
      onSuccess?.(saved);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save payout account",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {existing?.last4 ? (
        <p className="text-sm text-[#667085]">
          Current account ending in {existing.last4}. Enter the account number
          or IBAN again to save.
        </p>
      ) : null}

      {!presetCurrency && !existing ? (
        <Field label="Currency">
          <Select
            value={currency}
            onValueChange={(value) =>
              onCurrencyChange(value as BridgePayoutCurrency)
            }
          >
            <SelectTrigger className="h-9 border-[#E4E7EC]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      {currency === "USD" ? (
        <Field label="Transfer type">
          <Select
            value={rail}
            onValueChange={(value) => setRail(value as BridgePayoutRail)}
          >
            <SelectTrigger className="h-9 border-[#E4E7EC]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {usdRails.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : (
        <p className="text-sm text-[#667085]">EUR payouts use SEPA.</p>
      )}

      <Field label="Account owner">
        <Select
          value={accountOwnerType}
          onValueChange={(value) =>
            setAccountOwnerType(value as BridgeAccountOwnerType)
          }
        >
          <SelectTrigger className="h-9 border-[#E4E7EC]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {accountOwnerType === "business" ? (
        <Field label="Business name">
          <Input
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            required
            maxLength={35}
          />
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </Field>
          <Field label="Last name">
            <Input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </Field>
        </div>
      )}

      {currency === "USD" ? (
        <>
          <Field label="Bank name">
            <Input
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
              required
            />
          </Field>
          <Field label="Account number">
            <Input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              required
              autoComplete="off"
            />
          </Field>
          <Field label="Routing number">
            <Input
              value={routingNumber}
              onChange={(event) => setRoutingNumber(event.target.value)}
              required
              inputMode="numeric"
              maxLength={9}
            />
          </Field>
          <Field label="Account type">
            <Select
              value={accountKind}
              onValueChange={(value) =>
                setAccountKind(value as BridgeAccountKind)
              }
            >
              <SelectTrigger className="h-9 border-[#E4E7EC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      ) : (
        <>
          <Field label="IBAN">
            <Input
              value={iban}
              onChange={(event) => setIban(event.target.value)}
              required
              autoComplete="off"
            />
          </Field>
          <Field label="BIC (optional)">
            <Input
              value={bic}
              onChange={(event) => setBic(event.target.value)}
            />
          </Field>
        </>
      )}

      <Field label="Address line 1">
        <Input
          value={line1}
          onChange={(event) => setLine1(event.target.value)}
          required
        />
      </Field>
      <Field label="Address line 2 (optional)">
        <Input
          value={line2}
          onChange={(event) => setLine2(event.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <Input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </Field>
        {currency === "USD" ? (
          <Field label="State">
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="h-9 border-[#E4E7EC]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <Field label="Country">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-9 border-[#E4E7EC]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEPA_COUNTRIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </div>
      <Field label="Postal code">
        <Input
          value={postalCode}
          onChange={(event) => setPostalCode(event.target.value)}
          required
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save account"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#101828]">
        {label}
      </label>
      {children}
    </div>
  );
}
