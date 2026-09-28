export type AccountCode = "USD" | "EUR" | "NGN" | "GHS" | "ZAR";

export type AccountLifecycle = "active" | "review";

export type AddAccountBadge = "active" | "review" | "instant";

export interface AccountTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  direction: "in" | "out";
  status: string;
}

export interface AccountField {
  label: string;
  value: string;
}

export interface LocalAccount {
  code: AccountCode;
  name: string;
  kind: string;
  bankName: string;
  detailLine: string;
  balanceLabel: string;
  approxUsdLabel?: string;
  balanceUsd: number;
  sidebarAmount: string;
  lifecycle: AccountLifecycle;
  mark: "flag-us" | "flag-eu" | "naira" | "cedi" | "rand";
  currencyLine: string;
  availableBalance: string;
  rateLine?: string;
  periodIn?: string;
  periodOut?: string;
  fields: AccountField[];
  transactions: AccountTransaction[];
  benefits: string[];
  reviewNote: string;
  badge: AddAccountBadge;
  useOptions: string[];
  volumeOptions: string[];
  defaultCountries: string[];
}

export const LOCAL_ACCOUNTS: LocalAccount[] = [
  {
    code: "USD",
    name: "US Dollar",
    kind: "Local account · ACH & wire",
    bankName: "Lead Bank",
    detailLine: "Acct •••• 4821 · Routing 101019644",
    balanceLabel: "$32,140.00",
    balanceUsd: 32140,
    sidebarAmount: "$32.1k",
    lifecycle: "active",
    mark: "flag-us",
    currencyLine: "USD · Local account",
    availableBalance: "$32,140.00",
    periodIn: "+$18,400.00",
    periodOut: "−$6,200.00",
    fields: [
      { label: "Account name", value: "" },
      { label: "Bank", value: "Lead Bank" },
      { label: "Account number", value: "•••• 4821" },
      { label: "Routing number", value: "101019644" },
      { label: "Currency", value: "USD · US Dollar" },
    ],
    transactions: [],
    benefits: [
      "Account and routing number in your company name",
      "Receive ACH and domestic wires from US clients",
      "Pay US contractors in USD, or convert to USDC",
    ],
    reviewNote: "Our US banking partner reviews each new account request.",
    badge: "review",
    useOptions: [
      "Receiving payments from US clients",
      "Paying US contractors",
      "Holding a USD balance",
    ],
    volumeOptions: ["$0 – $10,000", "$10,000 – $50,000", "$50,000 – $250,000"],
    defaultCountries: ["United States"],
  },
  {
    code: "EUR",
    name: "Euro",
    kind: "Local account · SEPA & SWIFT",
    bankName: "Banking Circle S.A.",
    detailLine: "IBAN LU28 0019 •••• 0000 · BIC BCIRLULL",
    balanceLabel: "€8,420.00",
    approxUsdLabel: "≈ $9,850.00",
    balanceUsd: 9850,
    sidebarAmount: "€8.4k",
    lifecycle: "review",
    mark: "flag-eu",
    currencyLine: "EUR · Local account",
    availableBalance: "€8,420.00",
    rateLine: "≈ $9,850.00 · 1 USD = €0.85",
    periodIn: "+€6,200.00",
    periodOut: "−€1,180.00",
    fields: [
      { label: "Account name", value: "" },
      { label: "Bank", value: "Banking Circle S.A." },
      { label: "IBAN", value: "LU28 0019 •••• 0000" },
      { label: "BIC", value: "BCIRLULL" },
      { label: "Currency", value: "EUR · Euro" },
    ],
    transactions: [],
    benefits: [
      "IBAN + BIC in your company name",
      "Receive SEPA & SWIFT transfers from EU clients",
      "Pay EU contractors in EUR, or convert to USD / USDC",
    ],
    reviewNote: "Our EU banking partner reviews each new IBAN request.",
    badge: "review",
    useOptions: [
      "Receiving payments from EU clients",
      "Paying EU contractors",
      "Holding a EUR balance",
    ],
    volumeOptions: ["€0 – €10,000", "€10,000 – €50,000", "€50,000 – €250,000"],
    defaultCountries: ["Germany", "Netherlands", "France"],
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    kind: "Local account · NUBAN",
    bankName: "Providus Bank",
    detailLine: "Acct •••• 7730",
    balanceLabel: "₦18,420,000.00",
    approxUsdLabel: "≈ $12,010.00",
    balanceUsd: 12010,
    sidebarAmount: "₦18.4M",
    lifecycle: "active",
    mark: "naira",
    currencyLine: "NGN · Local account",
    availableBalance: "₦18,420,000.00",
    rateLine: "≈ $12,010.00 · 1 USD = ₦1,533.80",
    periodIn: "+₦12,500,000",
    periodOut: "−₦9,907,600",
    fields: [
      { label: "Account name", value: "" },
      { label: "Bank", value: "Providus Bank" },
      { label: "Account number", value: "9014 237 730" },
      { label: "Currency", value: "NGN · Nigerian Naira" },
    ],
    transactions: [
      {
        id: "ngn-1",
        title: "Adaeze Nwosu · Kuda",
        subtitle: "Incoming transfer · Sep 21, 14:02",
        amount: "+₦2,500,000.00",
        direction: "in",
        status: "Completed",
      },
      {
        id: "ngn-2",
        title: "September payroll · 9 people",
        subtitle: "Payroll · Sep 20",
        amount: "−₦6,840,000.00",
        direction: "out",
        status: "Completed",
      },
      {
        id: "ngn-3",
        title: "Bluedot Labs · GTBank",
        subtitle: "Top-up from your local bank · Sep 15",
        amount: "+₦10,000,000.00",
        direction: "in",
        status: "Completed",
      },
      {
        id: "ngn-4",
        title: "Tunde Bakare · OPay",
        subtitle: "Contractor payout · Sep 12",
        amount: "−₦450,000.00",
        direction: "out",
        status: "Completed",
      },
    ],
    benefits: [
      "NUBAN account in your company name",
      "Receive transfers from any Nigerian bank",
      "Pay Nigerian contractors in NGN",
    ],
    reviewNote: "Naira accounts are issued after a short review.",
    badge: "active",
    useOptions: [
      "Receiving payments from Nigerian clients",
      "Paying Nigerian contractors",
      "Holding an NGN balance",
    ],
    volumeOptions: [
      "₦0 – ₦5,000,000",
      "₦5,000,000 – ₦50,000,000",
      "₦50,000,000+",
    ],
    defaultCountries: ["Nigeria"],
  },
  {
    code: "GHS",
    name: "Ghana Cedi",
    kind: "Local account · bank & mobile money",
    bankName: "Access Bank Ghana",
    detailLine: "Acct 1024 8830 4471 · Branch 280100",
    balanceLabel: "GH₵0.00",
    approxUsdLabel: "≈ $0.00",
    balanceUsd: 0,
    sidebarAmount: "GH₵0",
    lifecycle: "active",
    mark: "cedi",
    currencyLine: "GHS · Local account",
    availableBalance: "GH₵0.00",
    rateLine: "≈ $0.00",
    periodIn: "+GH₵0.00",
    periodOut: "−GH₵0.00",
    fields: [
      { label: "Account name", value: "" },
      { label: "Bank", value: "Access Bank Ghana" },
      { label: "Account number", value: "1024 8830 4471" },
      { label: "Branch code", value: "280100" },
      { label: "Currency", value: "GHS · Ghana Cedi" },
    ],
    transactions: [],
    benefits: [
      "Local bank account in your company name",
      "Receive local transfers and mobile money",
      "Pay out to Ghanaian banks and MoMo",
    ],
    reviewNote: "GHS accounts go live right away.",
    badge: "instant",
    useOptions: [
      "Paying Ghana-based contractors",
      "Receiving local GHS payments",
      "Holding a GHS balance",
    ],
    volumeOptions: ["GH₵0 – GH₵50,000", "GH₵50,000 – GH₵250,000", "GH₵250,000+"],
    defaultCountries: ["Ghana"],
  },
];

export const COMING_SOON_ACCOUNTS: Array<{
  code: AccountCode;
  name: string;
  description: string;
  perks: string[];
}> = [
  {
    code: "ZAR",
    name: "South African Rand",
    description: "Collect and pay out in ZAR to South African banks.",
    perks: ["Local account number", "EFT payouts"],
  },
];

export function getAccount(code: string) {
  return LOCAL_ACCOUNTS.find(
    (account) => account.code.toLowerCase() === code.toLowerCase(),
  );
}

export function formatUsd(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
