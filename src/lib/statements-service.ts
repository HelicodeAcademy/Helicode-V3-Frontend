import { get, post } from "./api-client";

const BASE_URL = "https://helicode-backend.onrender.com";

export type StatementKind = "ACCOUNT" | "PAYROLL";
export type StatementJobStatus = "QUEUED" | "PROCESSING" | "READY" | "FAILED";
export type PayrollInclude = "ALL" | "SCHEDULES" | "ONE_TIME";

export interface StatementSummary {
  openingBalance?: string | null;
  moneyIn?: string | null;
  moneyOut?: string | null;
  closingBalance?: string | null;
  convertedUsd?: string | null;
  transactionCount?: number;
  totalPaid?: string | null;
  fees?: string | null;
  totalCost?: string | null;
  paymentsWithoutFee?: number;
  paymentCount?: number;
  peopleCount?: number;
}

export interface StatementRecord {
  id: string;
  type: StatementKind;
  currency: string | null;
  number: string;
  status: StatementJobStatus;
  period: { from: string; to: string };
  options?: Record<string, unknown>;
  fileName: string;
  pages: number | null;
  sizeBytes: number | null;
  summary: StatementSummary | null;
  emailRequested: boolean;
  emailedAt: string | null;
  error: string | null;
  createdAt: string;
  readyAt: string | null;
}

export interface StatementDownload {
  url: string;
  expiresAt: string;
  fileName: string;
}

export interface StatementVerification {
  valid: boolean;
  company: string;
  type: StatementKind;
  currency: string | null;
  number: string;
  period: { from: string; to: string };
  summary: StatementSummary;
  generatedAt: string;
  sha256: string;
}

export interface CreateStatementRequest {
  type: StatementKind;
  currency?: string;
  from: string;
  to: string;
  includePending?: boolean;
  include?: PayrollInclude;
  localAmounts?: boolean;
  sendEmail?: boolean;
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;

export async function requestStatement(
  body: CreateStatementRequest,
): Promise<StatementRecord> {
  const response = await post<StatementRecord>("/statements", body);
  return response.data;
}

export async function getStatement(id: string): Promise<StatementRecord> {
  const response = await get<StatementRecord>(`/statements/${id}`);
  return response.data;
}

export async function getStatementDownload(
  id: string,
): Promise<StatementDownload> {
  const response = await get<StatementDownload>(`/statements/${id}/download`);
  return response.data;
}

export async function prepareStatement(
  body: CreateStatementRequest,
  options?: { shouldStop?: () => boolean },
): Promise<StatementRecord> {
  const created = await requestStatement(body);
  if (created.status === "READY" || created.status === "FAILED") {
    return created;
  }

  const started = Date.now();
  let current = created;

  while (current.status === "QUEUED" || current.status === "PROCESSING") {
    if (options?.shouldStop?.()) {
      throw new Error("Cancelled");
    }
    if (Date.now() - started >= POLL_TIMEOUT_MS) {
      throw new Error(
        "This statement is still being prepared. It will appear in your statements list.",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    if (options?.shouldStop?.()) {
      throw new Error("Cancelled");
    }
    current = await getStatement(created.id);
  }

  return current;
}

export async function openStatementDownload(id: string) {
  const download = await getStatementDownload(id);
  window.open(download.url, "_blank", "noopener,noreferrer");
  return download;
}

export async function verifyStatement(
  code: string,
): Promise<StatementVerification | null> {
  const response = await fetch(
    `${BASE_URL}/statements/verify/${encodeURIComponent(code)}`,
  );

  if (!response.ok) return null;

  const body = (await response.json()) as {
    data?: StatementVerification;
  };

  if (!body.data?.valid) return null;
  return body.data;
}
