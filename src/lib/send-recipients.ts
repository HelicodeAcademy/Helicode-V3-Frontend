import type {
  BridgePayoutRail,
  BridgePayoutRecipient,
} from "./bridge-payout-service";

export type SendRail = "ach" | "wire" | "swift";
export type SendRecipientType = "business" | "individual";
export type SendAccountKind = "checking" | "savings";

export interface SendRecipient {
  id: string;
  type: SendRecipientType;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  rails: SendRail[];
  bankName: string;
  last4: string;
  routingNumber?: string;
  accountKind?: SendAccountKind;
  ready: boolean;
  needsWireDetails: boolean;
  createdAt: string;
}

function toSendRails(supported: BridgePayoutRail[]): SendRail[] {
  const rails: SendRail[] = [];
  if (supported.some((rail) => rail === "ach" || rail === "ach_same_day")) {
    rails.push("ach");
  }
  if (supported.includes("wire")) {
    rails.push("wire");
  }
  return rails;
}

export function bridgeRecipientToSend(
  recipient: BridgePayoutRecipient,
): SendRecipient {
  const name = recipient.accountOwnerName?.trim() || "Recipient";
  const parts = name.split(/\s+/).filter(Boolean);
  const isBusiness = recipient.accountOwnerType === "business";

  return {
    id: recipient.id,
    type: recipient.accountOwnerType,
    businessName: isBusiness ? name : undefined,
    firstName: isBusiness ? undefined : parts[0],
    lastName: isBusiness ? undefined : parts.slice(1).join(" ") || undefined,
    email: recipient.email ?? undefined,
    addressLine1: recipient.addressLine1 ?? "",
    city: recipient.city ?? "",
    state: recipient.state ?? "",
    postalCode: recipient.postalCode ?? "",
    country: recipient.countryCode ?? "US",
    rails: toSendRails(recipient.supportedRails ?? [recipient.rail]),
    bankName: recipient.bankName?.trim() || "Bank",
    last4: recipient.last4,
    routingNumber: recipient.routingNumber ?? undefined,
    accountKind: recipient.accountKind ?? undefined,
    ready: Boolean(recipient.ready),
    needsWireDetails: Boolean(recipient.needsWireDetails),
    createdAt: recipient.updatedAt,
  };
}

export function sendRailToBridge(
  rail: SendRail,
): Extract<BridgePayoutRail, "ach" | "wire"> | null {
  if (rail === "ach") return "ach";
  if (rail === "wire") return "wire";
  return null;
}

export function recipientDisplayName(recipient: SendRecipient): string {
  if (recipient.type === "business") {
    return recipient.businessName?.trim() || "Business";
  }
  return (
    `${recipient.firstName ?? ""} ${recipient.lastName ?? ""}`.trim() ||
    "Recipient"
  );
}

export function recipientInitials(recipient: SendRecipient): string {
  const name = recipientDisplayName(recipient);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "R";
}

/** Known ABA routing numbers shown in the designs for live bank lookup UX. */
const ROUTING_LOOKUP: Record<
  string,
  { bankName: string; city: string; state: string; accepts: string }
> = {
  "071000013": {
    bankName: "JPMorgan Chase Bank, N.A.",
    city: "Chicago",
    state: "IL",
    accepts: "Accepts Fedwire",
  },
  "121000248": {
    bankName: "Wells Fargo Bank, N.A.",
    city: "San Francisco",
    state: "CA",
    accepts: "Accepts Fedwire",
  },
  "021000021": {
    bankName: "JPMorgan Chase Bank, N.A.",
    city: "New York",
    state: "NY",
    accepts: "Accepts Fedwire",
  },
  "026009593": {
    bankName: "Bank of America, N.A.",
    city: "Charlotte",
    state: "NC",
    accepts: "Accepts Fedwire",
  },
};

export function lookupRoutingNumber(routingNumber: string) {
  const digits = routingNumber.replace(/\D/g, "");
  return ROUTING_LOOKUP[digits] ?? null;
}

export const US_STATE_OPTIONS: { label: string; value: string }[] = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "District of Columbia", value: "DC" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

export const SEPA_COUNTRY_OPTIONS: { label: string; value: string }[] = [
  { label: "Austria", value: "AT" },
  { label: "Belgium", value: "BE" },
  { label: "Bulgaria", value: "BG" },
  { label: "Croatia", value: "HR" },
  { label: "Cyprus", value: "CY" },
  { label: "Czech Republic", value: "CZ" },
  { label: "Denmark", value: "DK" },
  { label: "Estonia", value: "EE" },
  { label: "Finland", value: "FI" },
  { label: "France", value: "FR" },
  { label: "Germany", value: "DE" },
  { label: "Greece", value: "GR" },
  { label: "Hungary", value: "HU" },
  { label: "Iceland", value: "IS" },
  { label: "Ireland", value: "IE" },
  { label: "Italy", value: "IT" },
  { label: "Latvia", value: "LV" },
  { label: "Liechtenstein", value: "LI" },
  { label: "Lithuania", value: "LT" },
  { label: "Luxembourg", value: "LU" },
  { label: "Malta", value: "MT" },
  { label: "Netherlands", value: "NL" },
  { label: "Norway", value: "NO" },
  { label: "Poland", value: "PL" },
  { label: "Portugal", value: "PT" },
  { label: "Romania", value: "RO" },
  { label: "Slovakia", value: "SK" },
  { label: "Slovenia", value: "SI" },
  { label: "Spain", value: "ES" },
  { label: "Sweden", value: "SE" },
  { label: "Switzerland", value: "CH" },
];

export const PAYMENT_PURPOSES = [
  "Goods & supplies",
  "Services",
  "Rent",
  "Payroll",
  "Taxes",
  "Other",
] as const;

export function railLabel(rail: SendRail): string {
  if (rail === "ach") return "ACH";
  if (rail === "wire") return "Domestic wire";
  return "International wire";
}

export function railShortLabel(rail: SendRail): string {
  if (rail === "ach") return "ACH";
  if (rail === "wire") return "Wire";
  return "SWIFT";
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function getWireCutoffInfo(now = new Date()) {
  const etParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) =>
    etParts.find((part) => part.type === type)?.value ?? "0";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));

  const minutesNow = hour * 60 + minute;
  const cutoffMinutes = 16 * 60;
  const beforeCutoff = minutesNow < cutoffMinutes;
  const remaining = Math.max(0, cutoffMinutes - minutesNow);
  const remainingHours = Math.floor(remaining / 60);
  const remainingMins = remaining % 60;

  return {
    beforeCutoff,
    remainingLabel: `${remainingHours}h ${remainingMins}m left`,
    etDateLabel: `${month}/${day}/${year}`,
  };
}
