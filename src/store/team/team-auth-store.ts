import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types for Team auth flow
export interface AcceptInviteData {
  otp: string;
  email: string;
  password: string;
}

export interface AcceptInviteResponse {
  message: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface TeamLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  companyId: string;
  companies: Company[];
}

export interface TeamMeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  status: "VERIFIED" | "UNVERIFIED" | "PENDING";
  kycStatus?: boolean;
  bankPayoutStatus?: boolean;
  hasTransactionPin: boolean;
  wallet: {
    id: string;
    balance: number;
  };
  company: {
    id: string;
    name: string;
    country: string;
  };

  membership: {
    status: string;
    department: string;
    role: string;
    type: string;
    startDate: string;
  };

  payroll: {
    amount: number;
    frequency: string;
    currency: string;
  };

  contract: {
    id: string;
    document: string;
    isSigned: boolean;
  };
  incomingPayrollAmount: number;
  incomingPayrollDate: string;
}

interface TeamAuthStore {
  // Accept invite form data
  acceptInviteData: Partial<AcceptInviteData>;
  setAcceptInviteData: (data: Partial<AcceptInviteData>) => void;
  resetAcceptInviteData: () => void;

  // Team login state
  accessToken: string | null;
  refreshToken: string | null;
  user: TeamLoginResponse["user"] | null;
  companyId: string | null;
  companies: Company[];
  selectedCompanyId: string | null;
  setTeamLoginData: (data: TeamLoginResponse) => void;
  setSelectedCompany: (companyId: string) => void;
  clearTeamLoginData: () => void;
  isAuthenticated: boolean;

  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Reset the entire Team auth flow
  resetTeamAuth: () => void;

  // Pin data
  hasPin: boolean;
  setHasPin: (hasPin: boolean) => void;

  // Hydration
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useTeamAuthStore = create<TeamAuthStore>()(
  persist(
    (set) => ({
      // Accept invite form data
      acceptInviteData: {},
      setAcceptInviteData: (data: Partial<AcceptInviteData>) =>
        set({ acceptInviteData: data }),
      resetAcceptInviteData: () => set({ acceptInviteData: {} }),

      // Team login state
      accessToken: null,
      refreshToken: null,
      user: null,
      companyId: null,
      companies: [],
      selectedCompanyId: null,
      setTeamLoginData: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          companyId: data.companyId,
          companies: data.companies,
          selectedCompanyId: data.companyId,
          isAuthenticated: true,
        }),
      setSelectedCompany: (companyId) =>
        set(() => ({
          selectedCompanyId: companyId,
          companyId: companyId,
        })),
      clearTeamLoginData: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          companyId: null,
          companies: [],
          selectedCompanyId: null,
          isAuthenticated: false,
        });
      },

      isAuthenticated: false,

      // Loading and error states
      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      error: null,
      setError: (error: string | null) => set({ error: error }),

      // Reset the entire Team auth flow
      resetTeamAuth: () =>
        set({
          acceptInviteData: {},
          accessToken: null,
          refreshToken: null,
          user: null,
          companyId: null,
          companies: [],
          selectedCompanyId: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      // Pin data
      hasPin: false,
      setHasPin: (hasPin: boolean) => set({ hasPin }),

      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
    }),
    {
      name: "team-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        companyId: state.companyId,
        companies: state.companies,
        selectedCompanyId: state.selectedCompanyId,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
