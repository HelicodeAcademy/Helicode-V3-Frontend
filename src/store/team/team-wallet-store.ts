import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FiatDepositInstructions {
  rails: string[];
  bank_name: string;
  bank_address: string;
  beneficiary: string;
  beneficiary_address: string;
  account_number: string;
  routing_number: string;
}

export interface CryptoDepositInstructions {
  rail: string;
  currency: string;
  address: string;
}

export interface virtualAccount {
  status: string;
  fiatDepositInstructions?: FiatDepositInstructions;
  cryptoDepositInstructions?: CryptoDepositInstructions;
}

// For managing the table
export interface Transaction {
  transactionId: string;
  category: string;
  amount: string;
  type: string;
  currency: string;
  status: "SUCCESSFUL" | "PENDING" | "FAILED";
  date: string;
}

export interface TransactionsResponse {
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
  data: Transaction[];
}

export interface WalletStore {
  teamWalletBalance: number | null;
  isLoading: boolean;
  error: string | null;

  setTeamWalletBalance: (data: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearWallet: () => void;
}

export const useTeamWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      teamWalletBalance: null,
      isLoading: false,
      error: null,

      setTeamWalletBalance: (data: number) => set({ teamWalletBalance: data }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error: error }),
      clearWallet: () => set({ teamWalletBalance: null }),
    }),
    {
      name: "wallet-store",
    },
  ),
);
