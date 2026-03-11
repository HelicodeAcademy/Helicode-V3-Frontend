import { create } from "zustand";
import { WorkerType, PaymentFrequency, Currency } from "./team-store";

export interface HireDetailsForm {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  role: string;
  startDate: string; // ISO format YYYY-MM-DD
}

export interface HireContractForm {
  amount: string;
  currency: Currency;
  frequency: PaymentFrequency;
  department: string;
  contract: File | null;
}

interface AddHireStore {
  workerType: WorkerType | null;
  details: HireDetailsForm;
  contract: HireContractForm;
  setWorkerType: (type: WorkerType) => void;
  setDetails: (details: Partial<HireDetailsForm>) => void;
  setContract: (contract: Partial<HireContractForm>) => void;
  reset: () => void;
}

const defaultDetails: HireDetailsForm = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  role: "",
  startDate: "",
};

const defaultContract: HireContractForm = {
  amount: "",
  currency: "USDC",
  frequency: "MONTHLY",
  department: "",
  contract: null,
};

export const useAddHireStore = create<AddHireStore>((set) => ({
  workerType: null,
  details: defaultDetails,
  contract: defaultContract,

  setWorkerType: (workerType) => set({ workerType }),
  setDetails: (details) =>
    set((state) => ({ details: { ...state.details, ...details } })),
  setContract: (contract) =>
    set((state) => ({ contract: { ...state.contract, ...contract } })),
  reset: () =>
    set({
      workerType: null,
      details: defaultDetails,
      contract: defaultContract,
    }),
}));
