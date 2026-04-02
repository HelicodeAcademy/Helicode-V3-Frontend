/* eslint-disable @typescript-eslint/no-explicit-any */
import { teamGet, teamPatch, teamPost } from "../api-client";
import {
  CryptoWithdrawalData,
  CryptoWithdrawalResponse,
} from "../wallet-service";

// export interface TeamTransaction {
//   status: boolean;
//   statusCode: number;
//   message: string;
//   data: TeamTransactionData[];
// }

export interface TeamTransactionData {
  payrollDate: string;
  amount: number;
  currency: string;
  status: string;
  frequency: string;
}

export interface BankDetailsSubmissionData {
  country: string;
  currencyCode: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
}

export interface BankDetailsResponse {
  id: string;
  country: string;
  currencyCode: string;
  channelId: string;
  networkId: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  updatedAt: string;
}

export interface WithdrawalData {
  amount: number;
  verificationCode: string;
  reason: string;
}

export interface WithdrawalResponse {
  environment: string;
  scenario: string;
  withdrawalId: string;
  yellowcardPaymentId: string;
  ycPayload: Record<string, any>;
  ycResponse: Record<string, any>;
  simulatedWebhookPayload: Record<string, any>;
}

export async function getTeamTransactions(): Promise<TeamTransactionData[]> {
  const response = await teamGet<TeamTransactionData[]>(`/team/transactions`);
  return response.data;
}

/**
 * Sign team member contract
 * Marks contract as signed via PATCH request
 */
export async function signTeamContract(): Promise<{
  id: string;
  isSigned: boolean;
}> {
  const response = await teamPatch<{ id: string; isSigned: boolean }>(
    "/team/contract/sign",
    {},
  );
  return response.data;
}

/**
 * Initiate wallet withdrawal/off-ramp
 * Sends withdrawal request to YellowCard integration
 */
export async function initiateWalletWithdrawal(
  data: WithdrawalData,
): Promise<WithdrawalResponse> {
  const response = await teamPost<WithdrawalResponse>(
    "/team/wallet/offramp/fiat",
    data,
  );
  return response.data;
}

export async function initiateTeamCryptoWithdrawal(
  data: CryptoWithdrawalData,
): Promise<CryptoWithdrawalResponse> {
  const response = await teamPost<CryptoWithdrawalResponse>(
    `/team/wallet/offramp/crypto`,
    data,
  );
  return response.data;
}

export async function setWalletPin(
  pin: string,
  oldPin?: string,
): Promise<void> {
  const body = oldPin ? { oldPin, newPin: pin } : { pin };
  const method = oldPin ? teamPatch : teamPost;
  await method<void>(`/team/wallet/pin`, body);
}
