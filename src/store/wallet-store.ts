import { create } from "zustand";
import { persist } from "zustand/middleware";

interface virtualAccount {
    status: string;
    bank_name: string;
    bank_address: string;
    beneficiary: string
}

interface walletStore {
    balance: string;
}