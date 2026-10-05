/**
 * Local-currency payroll helpers.
 * Settlement is always USD/USDC on the server. Local codes are input/display only.
 * Never convert on the client — call POST /teams/payroll/quote.
 */

export type DollarCurrency = "USD" | "USDC" | "USDT";
export type LocalPayrollCurrency =
  | "NGN"
  | "GHS"
  | "KES"
  | "UGX"
  | "RWF"
  | "ZAR"
  | "TZS"
  | "ZMW"
  | "XOF"
  | "XAF"
  | "CDF"
  | "BWP"
  | "MWK";

export type PayrollCurrency = DollarCurrency | LocalPayrollCurrency | string;

export interface PayrollQuoteRequest {
  country: string;
  currency: string;
  amount: number;
}

export interface PayrollQuoteResponse {
  country: string;
  currency: string;
  amount: number;
  settlementCurrency: string;
  settlementAmount: number;
  rate: number | null;
  quotedAt: string | null;
}

/** Country name or ISO code → local payroll currency. */
const COUNTRY_LOCAL_CURRENCY: Record<string, LocalPayrollCurrency> = {
  nigeria: "NGN",
  ng: "NGN",
  ghana: "GHS",
  gh: "GHS",
  kenya: "KES",
  ke: "KES",
  uganda: "UGX",
  ug: "UGX",
  rwanda: "RWF",
  rw: "RWF",
  "south africa": "ZAR",
  za: "ZAR",
  tanzania: "TZS",
  tz: "TZS",
  zambia: "ZMW",
  zm: "ZMW",
  benin: "XOF",
  bj: "XOF",
  "burkina faso": "XOF",
  bf: "XOF",
  "ivory coast": "XOF",
  "cote d'ivoire": "XOF",
  "côte d'ivoire": "XOF",
  ci: "XOF",
  mali: "XOF",
  ml: "XOF",
  senegal: "XOF",
  sn: "XOF",
  togo: "XOF",
  tg: "XOF",
  cameroon: "XAF",
  cm: "XAF",
  congo: "XAF",
  cg: "XAF",
  gabon: "XAF",
  ga: "XAF",
  "dr congo": "CDF",
  "democratic republic of the congo": "CDF",
  cd: "CDF",
  botswana: "BWP",
  bw: "BWP",
  malawi: "MWK",
  mw: "MWK",
};

export function normalizeCountryKey(country: string): string {
  return country.trim().toLowerCase();
}

export function getLocalCurrencyForCountry(
  country: string | null | undefined,
): LocalPayrollCurrency | null {
  if (!country) return null;
  return COUNTRY_LOCAL_CURRENCY[normalizeCountryKey(country)] ?? null;
}

export function isDollarCurrency(currency: string | null | undefined): boolean {
  if (!currency) return true;
  const code = currency.toUpperCase();
  return code === "USD" || code === "USDC" || code === "USDT";
}

export function isLocalPayrollCurrency(
  currency: string | null | undefined,
): boolean {
  if (!currency) return false;
  return !isDollarCurrency(currency);
}

export function payrollCurrencyOptionsForCountry(country: string): {
  value: string;
  label: string;
}[] {
  const local = getLocalCurrencyForCountry(country);
  const options = [{ value: "USD", label: "USD" }];
  if (local) {
    options.push({ value: local, label: local });
  }
  return options;
}

export function formatPayrollMoney(
  amount: number,
  currency?: string | null,
): string {
  const code = (currency || "USD").toUpperCase();
  if (isDollarCurrency(code)) {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${code}`;
}

export function currencySymbol(currency?: string | null): string {
  const code = (currency || "USD").toUpperCase();
  switch (code) {
    case "USD":
    case "USDC":
    case "USDT":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "NGN":
      return "₦";
    case "GHS":
      return "GH₵";
    case "KES":
      return "KSh";
    case "ZAR":
      return "R";
    default:
      return "";
  }
}
