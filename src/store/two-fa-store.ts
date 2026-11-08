import { create } from "zustand";
import { getTwoFaStatus, type TwoFaStatus } from "@/lib/two-fa-service";

interface TwoFaStore {
  status: TwoFaStatus | null;
  isLoading: boolean;
  setStatus: (status: TwoFaStatus | null) => void;
  fetchStatus: (forTeam?: boolean) => Promise<TwoFaStatus | null>;
  clearStatus: () => void;
}

export const useTwoFaStore = create<TwoFaStore>((set) => ({
  status: null,
  isLoading: false,
  setStatus: (status) => set({ status }),
  fetchStatus: async (forTeam = false) => {
    set({ isLoading: true });
    try {
      const status = await getTwoFaStatus(forTeam);
      set({ status, isLoading: false });
      return status;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },
  clearStatus: () => set({ status: null, isLoading: false }),
}));
