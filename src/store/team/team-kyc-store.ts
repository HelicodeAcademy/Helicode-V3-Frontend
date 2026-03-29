import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TeamMeResponse } from "./team-auth-store";

interface TeamKYCStore {
  // Team member data wuith KYC Status
  teamMember: TeamMeResponse | null;
  setTeamMember: (member: TeamMeResponse) => void;
  clearTeamMember: () => void;

  // KYC Status
  kycStatus: boolean;
  setKYCStatus: (status: boolean) => void;

  // Cache Management
  lastFetchTime: number | null;
  setLastFetchTime: (time: number) => void;

  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;
}

// Cache duration in milliseconds
const CACHE_DURATION = 4 * 60 * 1000;

export const useTeamKYCStore = create<TeamKYCStore>()(
  persist(
    (set) => ({
      teamMember: null,
      setTeamMember: (member) => {
        set({
          teamMember: member,
          kycStatus: member.kycStatus,
          lastFetchTime: Date.now(),
        });
      },
      clearTeamMember: () =>
        set({
          teamMember: null,
          kycStatus: false,
          lastFetchTime: null,
        }),

      kycStatus: false,
      setKYCStatus: (status) => set({ kycStatus: status }),

      lastFetchTime: null,
      setLastFetchTime: (time) => set({ lastFetchTime: time }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),
    }),

    {
      name: "team-kyc-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        teamMember: state.teamMember,
        kycStatus: state.kycStatus,
        lastFetchTime: state.lastFetchTime,
      }),
    },
  ),
);

// Check if cached team member data is still valid
export function isTeamMemberDataCached(): boolean {
  const { teamMember, lastFetchTime } = useTeamKYCStore.getInitialState();
  if (!teamMember || !lastFetchTime) return false;
  return Date.now() - lastFetchTime < CACHE_DURATION;
}
