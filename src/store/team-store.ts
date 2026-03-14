import { create } from "zustand";

export type WorkerType = "CONTRACTOR" | "EMPLOYEE";
export type TeamStatus = "Active" | "Inactive" | "Pending";
export type PaymentFrequency = "MONTHLY" | "WEEKLY" | "DAILY" | "HOURLY";
export type Currency = "USD" | "EUR" | "USDC" | "USDT";

export interface TeamMember {
  id: string;
  fullName: string;
  country: string;
  type: WorkerType;
  amount: number;
  status: TeamStatus;
  dateJoined: string;
}

export interface TeamFilters {
  search: string;
  type: WorkerType | "";
  status: TeamStatus | "";
  page: number;
  limit: number;
}

interface TeamStore {
  members: TeamMember[];
  totalCount: number;
  filters: TeamFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  setMembers: (members: TeamMember[], total: number) => void;
  setFilters: (filters: Partial<TeamFilters>) => void;
  setIsLoading: (v: boolean) => void;
  setIsSubmitting: (v: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TeamFilters = {
  search: "",
  type: "",
  status: "",
  page: 1,
  limit: 10,
};

export const useTeamStore = create<TeamStore>((set) => ({
  members: [],
  totalCount: 0,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isSubmitting: false,
  error: null,

  setMembers: (members, totalCount) => set({ members, totalCount }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
