import { get } from "./api-client";

export interface TransactionData {
  id: string;
  name: string;
  role: string;
  workerType: "Contractor" | "Employee";
  amount: number;
  date: string;
  status: "Paid" | "Failed" | "Pending";
  paymentType?: string | null;
  note?: string | null;
  currency?: string;
}

interface RawTransactionData {
  id: string;
  name?: string;
  teamName?: string;
  role?: string;
  workerType?: string;
  amount?: number;
  date?: string;
  time?: string;
  status?: string;
  paymentType?: string | null;
  note?: string | null;
  currency?: string;
}

type CompanyTransactionsPayload =
  | RawTransactionData[]
  | {
      transactions?: RawTransactionData[];
      payrollTransactions?: RawTransactionData[];
      items?: RawTransactionData[];
      total?: number;
    };

export type PaymentHistoryType = "PAYROLL_RUN" | "ONE_TIME";

export interface PaymentHistoryRecipient {
  teamId: string;
  name: string;
  role: string;
}

export interface PaymentHistoryGroup {
  id: string;
  name: string;
  frequency: string;
}

export interface PaymentHistoryRow {
  id: string;
  reference: string;
  type: PaymentHistoryType;
  status: string;
  date: string;
  peopleCount: number;
  amount: string;
  fee: string | null;
  currency: string;
  group: PaymentHistoryGroup | null;
  scheduledFor: string | null;
  recipient: PaymentHistoryRecipient | null;
  paymentType: string | null;
  note: string | null;
  localAmount?: string;
  localCurrency?: string;
}

export interface PaymentHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaymentHistoryResponse {
  transactions: PaymentHistoryRow[];
  pagination: PaymentHistoryPagination;
}

export interface GetPaymentHistoryParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  type?: PaymentHistoryType;
}

export interface GetCompanyTransactionsParams {
  from?: string;
  to?: string;
  limit?: number;
  skip?: number;
  search?: string;
}

export interface CompanyTransactionsResult {
  transactions: TransactionData[];
  total: number;
}

function formatTransactionDate(value?: string): string {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeWorkerType(
  workerType?: string,
): TransactionData["workerType"] {
  return workerType?.toLowerCase() === "employee" ? "Employee" : "Contractor";
}

function normalizeStatus(status?: string): TransactionData["status"] {
  switch (status?.toLowerCase()) {
    case "failed":
      return "Failed";
    case "pending":
      return "Pending";
    default:
      return "Paid";
  }
}

function normalizeTransaction(
  transaction: RawTransactionData,
): TransactionData {
  return {
    id: transaction.id,
    name: transaction.name ?? transaction.teamName ?? "Unknown",
    role: transaction.role ?? "N/A",
    workerType: normalizeWorkerType(transaction.workerType),
    amount: typeof transaction.amount === "number" ? transaction.amount : 0,
    date: formatTransactionDate(transaction.date ?? transaction.time),
    status: normalizeStatus(transaction.status),
    paymentType: transaction.paymentType ?? null,
    note: transaction.note ?? null,
    currency: transaction.currency,
  };
}

function normalizeTransactions(
  payload: CompanyTransactionsPayload,
): TransactionData[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeTransaction);
  }

  if (Array.isArray(payload?.transactions)) {
    return payload.transactions.map(normalizeTransaction);
  }

  if (Array.isArray(payload?.payrollTransactions)) {
    return payload.payrollTransactions.map(normalizeTransaction);
  }

  if (Array.isArray(payload?.items)) {
    return payload.items.map(normalizeTransaction);
  }

  return [];
}

/** Preview fee charged to the company: amount × p / (100 − p). */
export function previewPayrollFee(
  amount: number,
  payrollFeePercent: number,
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (!Number.isFinite(payrollFeePercent) || payrollFeePercent <= 0) return 0;
  const denominator = 100 - payrollFeePercent;
  if (denominator <= 0) return 0;
  return Math.round(((amount * payrollFeePercent) / denominator) * 100) / 100;
}

export async function getPaymentHistory(
  params: GetPaymentHistoryParams = {},
): Promise<PaymentHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.type) searchParams.set("type", params.type);

  const query = searchParams.toString();
  const response = await get<PaymentHistoryResponse>(
    `/payroll-groups/history${query ? `?${query}` : ""}`,
  );

  return {
    transactions: response.data?.transactions ?? [],
    pagination: response.data?.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: 0,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    },
  };
}

export async function getCompanyTransactions(
  params: GetCompanyTransactionsParams = {},
): Promise<TransactionData[]> {
  const result = await getCompanyTransactionsPage(params);
  return result.transactions;
}

export async function getCompanyTransactionsPage(
  params: GetCompanyTransactionsParams = {},
): Promise<CompanyTransactionsResult> {
  const searchParams = new URLSearchParams();
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.skip != null) searchParams.set("skip", String(params.skip));
  if (params.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  const response = await get<CompanyTransactionsPayload>(
    `/payroll-groups/transactions${query ? `?${query}` : ""}`,
  );

  const transactions = normalizeTransactions(response.data);
  const total =
    !Array.isArray(response.data) && typeof response.data?.total === "number"
      ? response.data.total
      : transactions.length;

  return { transactions, total };
}
