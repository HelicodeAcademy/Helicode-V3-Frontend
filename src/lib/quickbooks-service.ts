import { get, post, put } from "./api-client";

export type QuickBooksConnectionStatus =
  | "CONNECTED"
  | "EXPIRED"
  | "DISCONNECTED";

export interface QuickBooksMapping {
  bankAccountId: string | null;
  bankAccountName: string | null;
  payrollExpenseAccountId: string | null;
  payrollExpenseAccountName: string | null;
  feeExpenseAccountId: string | null;
  feeExpenseAccountName: string | null;
  incomeAccountId: string | null;
  incomeAccountName: string | null;
  withdrawalAccountId: string | null;
  withdrawalAccountName: string | null;
}

export interface QuickBooksSyncStats {
  pending: number;
  failed: number;
  synced: number;
}

export interface QuickBooksStatus {
  connected: boolean;
  status: QuickBooksConnectionStatus;
  realmId: string | null;
  environment: string | null;
  companyName: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  mappingComplete: boolean;
  mapping: QuickBooksMapping;
  sync: QuickBooksSyncStats;
}

export interface QuickBooksAccount {
  id: string;
  name: string;
  fullyQualifiedName: string;
  accountType: string;
  accountSubType: string;
  currency: string;
  currentBalance: number;
}

export interface QuickBooksMappingPayload {
  bankAccountId: string;
  bankAccountName: string;
  payrollExpenseAccountId: string;
  payrollExpenseAccountName: string;
  feeExpenseAccountId?: string;
  feeExpenseAccountName?: string;
  incomeAccountId?: string;
  incomeAccountName?: string;
  withdrawalAccountId?: string;
  withdrawalAccountName?: string;
}

export interface QuickBooksSyncPayload {
  from?: string;
  to?: string;
}

export async function getQuickBooksConnectUrl(): Promise<{ authorizeUrl: string }> {
  const response = await get<{ authorizeUrl: string }>(
    "/integrations/quickbooks/connect",
  );
  return response.data;
}

export async function getQuickBooksStatus(): Promise<QuickBooksStatus> {
  const response = await get<QuickBooksStatus>(
    "/integrations/quickbooks/status",
  );
  return response.data;
}

export async function getQuickBooksAccounts(): Promise<QuickBooksAccount[]> {
  const response = await get<{ accounts: QuickBooksAccount[] }>(
    "/integrations/quickbooks/accounts",
  );
  return response.data.accounts;
}

export async function updateQuickBooksMapping(
  payload: QuickBooksMappingPayload,
): Promise<void> {
  await put<void>("/integrations/quickbooks/mapping", payload);
}

export async function syncQuickBooks(
  payload: QuickBooksSyncPayload = {},
): Promise<{ queued: number }> {
  const response = await post<{ queued: number }>(
    "/integrations/quickbooks/sync",
    payload,
  );
  return response.data;
}

export async function disconnectQuickBooks(): Promise<void> {
  await post<void>("/integrations/quickbooks/disconnect", {});
}
