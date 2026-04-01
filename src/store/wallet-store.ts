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

export interface WalletData {
  balance: number;
  actualBalance: number;
  activeTeamsCount: number;
  nextPayrollDate?: string;
  nextPayrollAmount?: number;
  totalPayoutAmount?: number;
  virtualAccount: virtualAccount;
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
  walletData: WalletData | null;
  isLoading: boolean;
  error: string | null;
  hasPin: boolean;

  setWalletData: (data: WalletData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasPin: (hasPin: boolean) => void;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      walletData: null,
      isLoading: false,
      error: null,
      hasPin: false,

      setWalletData: (data: WalletData) => set({ walletData: data }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error: error }),
      setHasPin: (hasPin: boolean) => set({ hasPin }),
      clearWallet: () => set({ walletData: null }),
    }),
    {
      name: "wallet-store",
    },
  ),
);
