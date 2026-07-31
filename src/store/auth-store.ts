import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types for auth flow
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  country?: string;
  product?: string;
}

export interface SignupResponse {
  userId: string;
  companyId: string;
  message: string;
}

export type BridgeKycStatus =
  | "pending"
  | "not_started"
  | "incomplete"
  | "awaiting_questionnaire"
  | "awaiting_ubo"
  | "under_review"
  | "approved"
  | "rejected"
  | "paused"
  | "offboarded"
  | "in_progress"
  | "submitted";

export type BridgeTosStatus =
  | "pending"
  | "approved"
  | "not_started"
  | "accepted"
  | "rejected";

export interface VerifyEmailResponse {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string | null;
  country?: string | null;
  dob?: string | null;
  proofOfAddress?: string | null;
  status: string;
  phone?: string | null;
  idDocument?: string | null;
  message?: string;
  kycLink?: string | null;
  tosLink?: string | null;
  kycStatus?: BridgeKycStatus;
  tosStatus?: BridgeTosStatus;
}

export interface PendingVerificationLinks {
  kycLink?: string | null;
  tosLink?: string | null;
  kycStatus?: BridgeKycStatus | null;
  tosStatus?: BridgeTosStatus | null;
}

// Login response types
export interface LoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: LoginUser;
  companyId: string;
}

export interface PasswordRecoveryData {
  userId: string;
  token: string;
  email: string;
  newPassword: string;
}

interface AuthStore {
  // Signup form data
  signupData: Partial<SignupData>;
  setSignupData: (data: Partial<SignupData>) => void;
  resetSignupData: () => void;

  // Current step in signup flow
  currentStep: "company" | "details" | "verify";
  setCurrentStep: (step: AuthStore["currentStep"]) => void;

  // Api response data
  userId: string | null;
  setUserId: (id: string) => void;

  companyId: string | null;
  setCompanyId: (id: string) => void;

  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Verified user data
  verifiedUser: VerifyEmailResponse | null;
  setVerifiedUser: (response: VerifyEmailResponse) => void;

  // KYC/TOS links returned from verify-email (used before sign-in)
  pendingVerification: PendingVerificationLinks | null;
  setPendingVerification: (data: PendingVerificationLinks | null) => void;

  // Login state
  accessToken: string | null;
  refreshToken: string | null;
  user: LoginUser | null;
  setLoginData: (data: LoginResponse) => void;
  clearLoginData: () => void;
  isAuthenticated: boolean;

  // Password recovery state
  recoveryData: Partial<PasswordRecoveryData>;
  setRecoveryData: (data: Partial<PasswordRecoveryData>) => void;
  resetRecoveryData: () => void;

  // Reset the entire auth flow
  resetAuth: () => void;

  // Hydration state
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      signupData: {},
      setSignupData: (data) =>
        set((state) => ({ signupData: { ...state.signupData, ...data } })),
      resetSignupData: () => set({ signupData: {} }),

      currentStep: "company",
      setCurrentStep: (step) => set({ currentStep: step }),

      userId: null,
      setUserId: (id) => set({ userId: id }),

      companyId: null,
      setCompanyId: (id) => set({ companyId: id }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),

      verifiedUser: null,
      setVerifiedUser: (response) => set({ verifiedUser: response }),

      pendingVerification: null,
      setPendingVerification: (data) => set({ pendingVerification: data }),

      // Login state
      accessToken: null,
      refreshToken: null,
      user: null,
      setLoginData: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          companyId: data.companyId,
          isAuthenticated: true,
        }),
      clearLoginData: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          companyId: null,
          isAuthenticated: false,
        }),
      isAuthenticated: false,

      // Password recovery state
      recoveryData: {},
      setRecoveryData: (data) =>
        set((state) => ({ recoveryData: { ...state.recoveryData, ...data } })),
      resetRecoveryData: () => set({ recoveryData: {} }),

      resetAuth: () =>
        set({
          signupData: {},
          currentStep: "company",
          userId: null,
          companyId: null,
          isLoading: false,
          error: null,
          verifiedUser: null,
          pendingVerification: null,
          accessToken: null,
          refreshToken: null,
          user: null,
          recoveryData: {},
        }),

      // Hydration state
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),

    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        companyId: state.companyId,
        isAuthenticated: state.isAuthenticated,
        pendingVerification: state.pendingVerification,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
