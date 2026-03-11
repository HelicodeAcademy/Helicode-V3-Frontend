import { get } from "./api-client";
import { WalletData } from "@/store/wallet-store";

// Get the wallet address and bank details
// Returns balance, virtual account details and bank information
// Returns empty object if KYC is not completed

export async function getWalletAddress(): Promise<WalletData> {
  const response = await get<WalletData>("/wallet/details");
  return response.data;
}
