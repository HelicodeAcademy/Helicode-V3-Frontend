import { get, getFile, post } from "./api-client";
import type {
  CompanyFeedTransaction,
  TransactionsFeedPagination,
} from "./transactions-feed-service";

export const ACCOUNTS_CHANGED_EVENT = "helicode:accounts-changed";

export function notifyAccountsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACCOUNTS_CHANGED_EVENT));
}

export type AccountStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "REJECTED"
  | "INACTIVE";

export interface AccountPeriod {
  from: string | null;
  to: string | null;
  moneyIn: string;
  moneyOut: string;
}

export interface OverviewAccount {
  currency: string;
  name: string;
  status: AccountStatus;
  openedAt: string | null;
  bankName: string | null;
  accountNumberLast4: string | null;
  period: { moneyIn: string; moneyOut: string };
}

export interface AccountsOverview {
  totalBalance: string;
  balanceSource: "bridge" | "stored" | string;
  currency: string;
  pendingOut: string;
  period: AccountPeriod;
  accounts: OverviewAccount[];
}

export interface CatalogCurrency {
  code: string;
  name: string;
  availability: "AVAILABLE" | "COMING_SOON" | string;
  activation: "REVIEW" | "AUTOMATIC" | null;
  rails: string[];
  endorsement?: string;
  benefits: string[];
  useOptions: string[];
  volumeOptions: string[];
  accountStatus: AccountStatus | null;
  waitlisted: boolean;
}

export interface AccountDetails {
  accountName?: string;
  bankName?: string;
  bankAddress?: string;
  beneficiaryAddress?: string;
  accountNumber?: string;
  routingNumber?: string;
  iban?: string;
  bic?: string;
  rails?: string[];
}

export interface CurrencyAccount {
  currency: string;
  name: string;
  status: AccountStatus;
  reason: string | null;
  openedAt: string | null;
  balance: string;
  available: string;
  pendingOut: string;
  balanceSource: "bridge" | "stored" | string;
  balanceCurrency: string;
  period: AccountPeriod;
  details: AccountDetails;
  receive?: { domestic?: AccountDetails };
}

export interface AccountTransactionsResult {
  transactions: CompanyFeedTransaction[];
  pagination: TransactionsFeedPagination;
}

export interface StatementPeriod {
  month: string;
  from: string;
  to: string;
  transactionCount: number;
}

export interface StatementRow {
  date: string;
  description: string;
  counterparty: string | null;
  reference: string | null;
  status: string;
  moneyIn: string | null;
  moneyOut: string | null;
  balance: string | null;
  sourceAmount: string | null;
  sourceCurrency: string | null;
}

export interface AccountStatement {
  account: { currency: string; name: string; details: AccountDetails };
  period: { from: string; to: string };
  currency: string;
  balanceSource: "bridge" | "stored" | string | null;
  openingBalance: string | null;
  moneyIn: string;
  moneyOut: string;
  closingBalance: string | null;
  rows: StatementRow[];
}

export interface AccountRequest {
  currency: string;
  status: AccountStatus;
  reason: string | null;
  mainUse: string | null;
  expectedMonthlyVolume: string | null;
  countries: string[];
  proofOfAddressUrl: string | null;
  hostedLink: string | null;
  requestedAt: string;
}

export interface AccountRequestResult {
  status: AccountStatus | string;
  hostedLink?: string | null;
}

function query(params: Record<string, string | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function getAccountsOverview(params?: {
  from?: string;
  to?: string;
}): Promise<AccountsOverview> {
  const response = await get<AccountsOverview>(
    `/accounts${query({ from: params?.from, to: params?.to })}`,
  );
  return response.data;
}

export async function getAccountCatalog(): Promise<CatalogCurrency[]> {
  const response = await get<CatalogCurrency[]>("/accounts/catalog");
  return response.data;
}

export async function joinAccountWaitlist(currency: string) {
  const response = await post<{ currency: string; joinedAt: string }>(
    "/accounts/waitlist",
    { currency },
  );
  return response.data;
}

export async function requestCurrencyAccount(
  currency: string,
): Promise<AccountRequestResult> {
  const response = await post<AccountRequestResult>("/accounts/requests", {
    currency,
  });
  return response.data;
}

export async function getAccountRequest(
  currency: string,
): Promise<AccountRequest> {
  const response = await get<AccountRequest>(
    `/accounts/requests/${currency}`,
  );
  return response.data;
}

export async function getCurrencyAccount(
  currency: string,
  params?: { from?: string; to?: string },
): Promise<CurrencyAccount> {
  const response = await get<CurrencyAccount>(
    `/accounts/${currency}${query({ from: params?.from, to: params?.to })}`,
  );
  return response.data;
}

export async function getAccountTransactions(
  currency: string,
  params: {
    page?: number;
    limit?: number;
    direction?: "in" | "out";
    status?: "success" | "pending" | "failed";
    from?: string;
    to?: string;
  } = {},
): Promise<AccountTransactionsResult> {
  const response = await get<AccountTransactionsResult>(
    `/accounts/${currency}/transactions${query({
      page: params.page ? String(params.page) : undefined,
      limit: params.limit ? String(params.limit) : undefined,
      direction: params.direction,
      status: params.status,
      from: params.from,
      to: params.to,
    })}`,
  );
  return response.data;
}

export async function getStatementPeriods(
  currency: string,
): Promise<StatementPeriod[]> {
  const response = await get<StatementPeriod[]>(
    `/accounts/statement/periods${query({ currency })}`,
  );
  return response.data;
}

export async function getAccountStatement(params: {
  currency: string;
  from: string;
  to: string;
  includePending?: boolean;
}): Promise<AccountStatement> {
  const response = await get<AccountStatement>(
    `/accounts/statement${query({
      currency: params.currency,
      from: params.from,
      to: params.to,
      includePending: params.includePending ? "true" : undefined,
      format: "json",
    })}`,
  );
  return response.data;
}

export async function downloadAccountStatementCsv(params: {
  currency: string;
  from: string;
  to: string;
  includePending?: boolean;
}): Promise<Blob> {
  return getFile(
    `/accounts/statement${query({
      currency: params.currency,
      from: params.from,
      to: params.to,
      includePending: params.includePending ? "true" : undefined,
      format: "csv",
    })}`,
  );
}
