import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types for talent auth flow
export interface AcceptInviteData {
  otp: string;
  email: string;
  password: string;
}

export interface AcceptInviteResponse {
  message: string;
}

export interface TalentLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface TalentAuthStore {
  // Accept invite form data
  acceptInviteData: Partial<AcceptInviteData>;
  setAcceptInviteData: (data: Partial<AcceptInviteData>) => void;
  resetAcceptInviteData: () => void;

  // Talent login state
  accessToken: string | null;
  refreshToken: string | null;
  user: TalentLoginResponse["user"] | null;
  setTalentLoginData: (data: TalentLoginResponse) => void;
  clearTalentLoginData: () => void;
  isAuthenticated: boolean;

  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Reset the entire talent auth flow
  resetTalentAuth: () => void;
}

export const useTalentAuthStore = create<TalentAuthStore>()(
  persist(
    (set) => ({
      // Accept invite form data
      acceptInviteData: {},
      setAcceptInviteData: (data: Partial<AcceptInviteData>) =>
        set({ acceptInviteData: data }),
      resetAcceptInviteData: () => set({ acceptInviteData: {} }),

      // Talent login state
      accessToken: null,
      refreshToken: null,
      user: null,
      setTalentLoginData: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          isAuthenticated: true,
        }),
      clearTalentLoginData: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      isAuthenticated: false,

      // Loading and error states
      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      error: null,
      setError: (error: string | null) => set({ error: error }),

      // Reset the entire talent auth flow
      resetTalentAuth: () =>
        set({
          acceptInviteData: {},
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "talent-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
