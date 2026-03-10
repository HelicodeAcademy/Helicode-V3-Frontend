import { create } from "zustand";

export interface KYCStatus {
  kycStatus:
    | "pending"
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";
  tosStatus?: "pending" | "not_started" | "accepted" | "rejected";
  kycLink?: string;
  tosLink?: string;
  message?: string;
}

interface KYCStore {
  // KYC State
  kycStatus: KYCStatus | null;
  setKYCStatus: (status: KYCStatus) => void;
  clearKYCStatus: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Reset state
  resetKYC: () => void;
}

export const useKYCStore = create<KYCStore>((set) => ({
  // KYC state
  kycStatus: null,
  setKYCStatus: (status) => set({ kycStatus: status }),
  clearKYCStatus: () => set({ kycStatus: null }),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),

  // Reset state
  resetKYC: () => set({ kycStatus: null, isLoading: false, error: null }),
}));
