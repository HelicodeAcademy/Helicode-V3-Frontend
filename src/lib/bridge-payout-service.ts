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

export interface BridgePayoutAccount {
  currency: BridgePayoutCurrency;
  rail: BridgePayoutRail;
  supportedRails: BridgePayoutRail[];
  accountOwnerType: BridgeAccountOwnerType;
  accountOwnerName: string;
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

export interface BridgePayoutList {
  feePercent: number;
  payouts: BridgePayoutAccount[];
}

export interface BridgePayoutQuote extends OfframpFiatQuote {
  rail: BridgePayoutRail;
  indicative: boolean;
}

export interface SaveBridgePayoutPayload {
  currency: BridgePayoutCurrency;
  rail: BridgePayoutRail;
  accountOwnerType: BridgeAccountOwnerType;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountKind?: BridgeAccountKind;
  iban?: string;
  bic?: string;
  address: BridgePayoutAddress;
}

export interface BridgePayoutWithdrawPayload {
  currency: BridgePayoutCurrency;
  amount: number;
  verificationCode: string;
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

export async function listBridgePayouts(
  forTeam = false,
): Promise<BridgePayoutList> {
  const api = client(forTeam);
  const response = await api.get<BridgePayoutList>(
    forTeam ? "/team/wallet/bridge-payout" : "/wallet/bridge-payout",
  );
  return response.data;
}

export async function saveBridgePayoutAccount(
  forTeam: boolean,
  payload: SaveBridgePayoutPayload,
): Promise<BridgePayoutAccount> {
  const api = client(forTeam);
  const response = await api.post<BridgePayoutAccount>(
    forTeam ? "/team/wallet/bridge-payout" : "/wallet/bridge-payout",
    payload,
  );
  return response.data;
}

export async function quoteBridgePayout(
  forTeam: boolean,
  currency: BridgePayoutCurrency,
  amount: number,
): Promise<BridgePayoutQuote> {
  const api = client(forTeam);
  const response = await api.post<BridgePayoutQuote>(
    forTeam
      ? "/team/wallet/bridge-payout/quote"
      : "/wallet/bridge-payout/quote",
    { currency, amount },
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
