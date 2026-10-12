import { format, parseISO } from "date-fns";

export function formatAccountMoney(
  amount: string | number | null | undefined,
  currency = "USD",
) {
  if (amount == null || amount === "") return "—";
  const value = typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (Number.isNaN(value)) return String(amount);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === "USD" || currency === "USDC") return `$${formatted}`;
  if (currency === "EUR") return `€${formatted}`;
  if (currency === "NGN") return `₦${formatted}`;
  return `${formatted} ${currency}`;
}

export function formatSignedMoney(
  amount: string | number | null | undefined,
  direction: "in" | "out",
  currency = "USD",
) {
  if (amount == null || amount === "") return "—";
  const prefix = direction === "in" ? "+" : "−";
  return `${prefix}${formatAccountMoney(amount, currency)}`;
}

export function compactAccountAmount(amount: string, currency = "USD") {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) return formatAccountMoney(amount, currency);
  const symbol =
    currency === "EUR" ? "€" : currency === "NGN" ? "₦" : "$";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${symbol}${(value / 1_000).toFixed(1)}k`;
  return formatAccountMoney(amount, currency);
}

export function displayCurrency(currency: string) {
  if (currency === "USDC") return "USD";
  return currency;
}

export function railsLabel(currency: string) {
  if (currency === "USD") return "ACH & wire";
  if (currency === "EUR") return "SEPA";
  return "";
}

export function maskLast4(last4: string | null | undefined) {
  if (!last4) return null;
  return `•••• ${last4}`;
}

export function maskFullNumber(value: string) {
  const compact = value.replace(/\s/g, "");
  return `•••• ${compact.slice(-4)}`;
}

export function formatAccountNumber(value: string) {
  return value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

export function formatOpened(value: string | null | undefined) {
  if (!value) return null;
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "MMM d, yyyy");
}

export function formatShortDate(value: string) {
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d");
}

export function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-");
  const date = new Date(Number(year), Number(monthIndex) - 1, 1);
  return format(date, "MMMM yyyy");
}

export function formatPeriodRange(from: string, to: string) {
  const start = parseISO(from);
  const end = parseISO(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "MMM d")} – ${format(end, "d")}`;
  }
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
}

export function statusLabel(status: string) {
  if (status === "Success" || status === "SUCCESSFUL" || status === "Paid") {
    return "Completed";
  }
  if (status === "PROCESSING" || status === "INITIATED" || status === "Pending") {
    return "Pending";
  }
  if (status === "FAILED" || status === "Failed") return "Failed";
  if (status === "ACTIVE") return "Active";
  if (status === "PENDING_REVIEW") return "Review";
  if (status === "REJECTED") return "Rejected";
  if (status === "INACTIVE") return "Inactive";
  return status;
}

export function hasAmount(amount: string | null | undefined) {
  const value = Number.parseFloat(amount ?? "");
  return !Number.isNaN(value) && value !== 0;
}
