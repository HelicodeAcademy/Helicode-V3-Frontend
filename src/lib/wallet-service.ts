import { get, post, patch } from "./api-client";
import { WalletData, TransactionsResponse } from "@/store/wallet-store";

// Cypto wallet related interfaces
export interface CryptoWithdrawalData {
  amount: string;
  pin: string;
  toAddress: string;
}

export interface CryptoWithdrawalResponse {
  environment: string;
  reference: string;
  bridgeTransferId: string;
  transaction: {
    id: string;
    amount: string;
    fee: string | null;
    category: string;
    type: string;
    status: string;
    currency: string;
    metadata: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Get the wallet address and bank details
// Returns balance, virtual account details and bank information
// Returns empty object if KYC is not completed

export async function getWalletAddress(): Promise<WalletData> {
  const response = await get<WalletData>("/wallet/details");
  return response.data;
}

// Get wallet transactions (with pagination)
// Page - page number
// Limit - Number of transactions per page
export async function getWalletTransactions(
  page: number = 1,
  limit: number = 10,
): Promise<TransactionsResponse> {
  const response = await get<TransactionsResponse>(
    `/wallet/transactions?page=${page}&limit=${limit}`,
  );
  return response.data;
}

export async function setWalletPin(
  pin: string,
  oldPin?: string,
): Promise<void> {
  const body = oldPin ? { oldPin, newPin: pin } : { pin };
  const method = oldPin ? patch : post;
  await method<void>(`/wallet/pin`, body);
}

export async function initiateCryptoWithdrawal(
  data: CryptoWithdrawalData,
): Promise<CryptoWithdrawalResponse> {
  const response = await post<CryptoWithdrawalResponse>(
    `/wallet/withdraw`,
    data,
  );
  return response.data;
}
