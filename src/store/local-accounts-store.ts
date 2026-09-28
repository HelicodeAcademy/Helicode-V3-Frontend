import { create } from "zustand";
import type { AccountCode } from "@/lib/local-accounts";

const OPENED_BY_DEFAULT: AccountCode[] = ["USD", "EUR", "NGN"];

interface LocalAccountsState {
  opened: AccountCode[];
  openAccount: (code: AccountCode) => void;
}

export const useLocalAccountsStore = create<LocalAccountsState>((set) => ({
  opened: OPENED_BY_DEFAULT,
  openAccount: (code) =>
    set((state) =>
      state.opened.includes(code)
        ? state
        : { opened: [...state.opened, code] },
    ),
}));
