import { get, post, teamGet, teamPost } from "./api-client";
import type { CompanyDetailsResponse } from "./company-details";
import type { OfframpFiatQuote } from "./offramp-fee";

export type BridgePayoutCurrency = "USD" | "EUR";
export type BridgePayoutRail =
  | "ach"
  | "ach_same_day"
  | "wire"
  | "fednow"
  | "sepa";
export type BridgeAccountOwnerType = "individual" | "business";
export type BridgeAccountKind = "checking" | "savings";

export interface BridgePayoutAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface BridgePayoutRecipient {
  id: string;
  currency: BridgePayoutCurrency;
  rail: BridgePayoutRail;
  supportedRails: BridgePayoutRail[];
  ready: boolean;
  needsWireDetails: boolean;
  accountOwnerType: BridgeAccountOwnerType;
  accountOwnerName: string;
  email: string | null;
  bankName: string | null;
  last4: string;
  routingNumber: string | null;
  accountKind: BridgeAccountKind | null;
  bic: string | null;
  countryCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  updatedAt: string;
}

/** @deprecated Prefer BridgePayoutRecipient — kept for older call sites. */
export type BridgePayoutAccount = BridgePayoutRecipient;

export interface BridgePayoutList {
  feePercent: number;
  recipients: BridgePayoutRecipient[];
  payouts: BridgePayoutRecipient[];
}

export interface BridgePayoutQuote extends OfframpFiatQuote {
  rail: BridgePayoutRail;
  indicative: boolean;
}

export interface CreateBridgePayoutRecipientPayload {
  currency: BridgePayoutCurrency;
  rail: BridgePayoutRail;
  accountOwnerType: BridgeAccountOwnerType;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
  bankName?: string;
  accountNumber?: string;
  accountNumberConfirmation?: string;
  routingNumber?: string;
  accountKind?: BridgeAccountKind;
  iban?: string;
  bic?: string;
  address: BridgePayoutAddress;
}

/** @deprecated Prefer CreateBridgePayoutRecipientPayload. */
export type SaveBridgePayoutPayload = CreateBridgePayoutRecipientPayload;

export interface AddWireDetailsPayload {
  routingNumber: string;
  bankName: string;
}

export interface BridgePayoutWithdrawPayload {
  currency: BridgePayoutCurrency;
  amount: number;
  verificationCode: string;
  recipientId?: string;
  rail?: BridgePayoutRail;
  code2fa?: string;
  reference?: string;
}

export interface BridgePayoutWithdrawResult {
  withdrawalId: string;
  bridgeTransferId: string | null;
  pending?: boolean;
  currency: BridgePayoutCurrency;
  rail: BridgePayoutRail;
  amountUsdc: number;
  feePercent: number;
  feeUsdc: number;
  netUsdc: number;
  status?: string;
  last4?: string;
}

function client(forTeam: boolean) {
  return forTeam ? { get: teamGet, post: teamPost } : { get, post };
}

function recipientsBase(forTeam: boolean) {
  return forTeam
    ? "/team/wallet/bridge-payout/recipients"
    : "/wallet/bridge-payout/recipients";
}

export function isBridgeFiatPayoutEnabled(
  companyDetails: CompanyDetailsResponse | null | undefined,
): boolean {
  if (!companyDetails) return false;
  return Boolean(
    companyDetails.bridgeFiatPayoutEnabled ??
      companyDetails.kyc?.bridgeFiatPayoutEnabled,
  );
}

export function railLabel(rail: BridgePayoutRail): string {
  if (rail === "ach") return "ACH";
  if (rail === "ach_same_day") return "Same-day ACH";
  if (rail === "wire") return "Wire";
  if (rail === "fednow") return "FedNow";
  return "SEPA";
}

export function referenceLimit(rail: BridgePayoutRail): number {
  return rail === "ach" || rail === "ach_same_day" ? 10 : 140;
}

export async function listBridgePayoutRecipients(
  forTeam = false,
  options?: { q?: string; rail?: BridgePayoutRail },
): Promise<BridgePayoutList> {
  const api = client(forTeam);
  const params = new URLSearchParams();
  if (options?.q?.trim()) params.set("q", options.q.trim());
  if (options?.rail) params.set("rail", options.rail);
  const query = params.toString();
  const path = `${recipientsBase(forTeam)}${query ? `?${query}` : ""}`;
  const response = await api.get<BridgePayoutList>(path);
  const data = response.data;
  const list = data.recipients?.length ? data.recipients : (data.payouts ?? []);
  return {
    feePercent: data.feePercent,
    recipients: list,
    payouts: list,
  };
}

/** @deprecated Prefer listBridgePayoutRecipients. */
export async function listBridgePayouts(
  forTeam = false,
): Promise<BridgePayoutList> {
  return listBridgePayoutRecipients(forTeam);
}

export async function getBridgePayoutRecipient(
  forTeam: boolean,
  recipientId: string,
): Promise<BridgePayoutRecipient> {
  const api = client(forTeam);
  const response = await api.get<BridgePayoutRecipient>(
    `${recipientsBase(forTeam)}/${recipientId}`,
  );
  return response.data;
}

export async function createBridgePayoutRecipient(
  forTeam: boolean,
  payload: CreateBridgePayoutRecipientPayload,
): Promise<BridgePayoutRecipient> {
  const api = client(forTeam);
  const response = await api.post<BridgePayoutRecipient>(
    recipientsBase(forTeam),
    payload,
  );
  return response.data;
}

/** @deprecated Prefer createBridgePayoutRecipient. */
export async function saveBridgePayoutAccount(
  forTeam: boolean,
  payload: CreateBridgePayoutRecipientPayload,
): Promise<BridgePayoutRecipient> {
  return createBridgePayoutRecipient(forTeam, payload);
}

export async function addBridgePayoutWireDetails(
  forTeam: boolean,
  recipientId: string,
  payload: AddWireDetailsPayload,
): Promise<BridgePayoutRecipient> {
  const api = client(forTeam);
  const response = await api.post<BridgePayoutRecipient>(
    `${recipientsBase(forTeam)}/${recipientId}/wire`,
    payload,
  );
  return response.data;
}

export async function quoteBridgePayout(
  forTeam: boolean,
  currency: BridgePayoutCurrency,
  amount: number,
  options?: { recipientId?: string; rail?: BridgePayoutRail },
): Promise<BridgePayoutQuote> {
  const api = client(forTeam);
  const response = await api.post<BridgePayoutQuote>(
    forTeam
      ? "/team/wallet/bridge-payout/quote"
      : "/wallet/bridge-payout/quote",
    {
      currency,
      amount,
      ...(options?.recipientId ? { recipientId: options.recipientId } : {}),
      ...(options?.rail ? { rail: options.rail } : {}),
    },
  );
  return response.data;
}

export async function withdrawBridgePayout(
  forTeam: boolean,
  payload: BridgePayoutWithdrawPayload,
): Promise<BridgePayoutWithdrawResult> {
  const api = client(forTeam);
  const response = await api.post<BridgePayoutWithdrawResult>(
    forTeam
      ? "/team/wallet/bridge-payout/withdraw"
      : "/wallet/bridge-payout/withdraw",
    payload,
  );
  return response.data;
}

export async function getBridgePayoutWithdrawal(
  forTeam: boolean,
  withdrawalId: string,
): Promise<BridgePayoutWithdrawResult> {
  const api = client(forTeam);
  const path = forTeam
    ? `/team/wallet/bridge-payout/withdrawals/${withdrawalId}`
    : `/wallet/bridge-payout/withdrawals/${withdrawalId}`;
  const response = await api.get<BridgePayoutWithdrawResult>(path);
  return response.data;
}

export async function pollBridgePayoutWithdrawal(
  forTeam: boolean,
  withdrawalId: string,
): Promise<BridgePayoutWithdrawResult> {
  let latest = await getBridgePayoutWithdrawal(forTeam, withdrawalId);
  for (let attempt = 0; attempt < 10 && latest.pending; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    latest = await getBridgePayoutWithdrawal(forTeam, withdrawalId);
  }
  return latest;
}
