// import { create } from "zustand";

// /**
//  * Full KYC Status response from API
//  * Maps directly to getKYCStatus() response
//  */
// export interface FullKYCStatus {
//   companyKycStatus: 'pending' | 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected'
//   employerKycStatus: 'pending' | 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected'
//   tosStatus: 'pending' | 'not_started' | 'accepted' | 'rejected'
//   kycStatus: 'not_started' | 'approved' | 'rejected' // Bridge verification status
//   kycLink?: string
//   tosLink?: string
//   message?: string
//   rejectionReason?: string | null
// }

// export interface KYCStatus {
//   kycStatus:
//     | "pending"
//     | "not_started"
//     | "in_progress"
//     | "submitted"
//     | "approved"
//     | "rejected";
//   tosStatus?: "pending" | "not_started" | "accepted" | "rejected";
//   kycLink?: string;
//   tosLink?: string;
//   message?: string;
// }

// export interface CompanyKYCStatus {
//   kycLink?: string;
//   tosLink?: string;
//   companyKycStatus:
//     | "pending"
//     | "not_started"
//     | "in_progress"
//     | "submitted"
//     | "approved"
//     | "rejected";
//   tosStatus: "pending" | "not_started" | "accepted" | "rejected";
//   message?: string;
// }

// export interface EmployerKYCStatus {
//   employerKycStatus:
//     | "pending"
//     | "not_started"
//     | "in_progress"
//     | "submitted"
//     | "approved"
//     | "rejected";
//   message?: string;
// }

// interface KYCStore {
//   // KYC State
//   companyKYCStatus: CompanyKYCStatus | null;
//   setCompanyKYCStatus: (status: CompanyKYCStatus) => void;
//   clearCompanyKYCStatus: () => void;

//   // Employer KYC State
//   employerKYCStatus: EmployerKYCStatus | null;
//   setEmployerKYCStatus: (status: EmployerKYCStatus) => void;
//   clearEmployerKYCStatus: () => void;

//   // KYC Status State (for backward compatibility)
//   kycStatus: KYCStatus | null;
//   setKYCStatus: (status: KYCStatus) => void;
//   clearKYCStatus: () => void;

//   // Loading state
//   isLoading: boolean;
//   setIsLoading: (loading: boolean) => void;

//   error: string | null;
//   setError: (error: string | null) => void;

//   // Reset state
//   resetKYC: () => void;
// }

// export const useKYCStore = create<KYCStore>((set) => ({
//   // Company KYC state
//   companyKYCStatus: null,
//   setCompanyKYCStatus: (status) => set({ companyKYCStatus: status }),
//   clearCompanyKYCStatus: () => set({ companyKYCStatus: null }),

//   // Employer KYC state
//   employerKYCStatus: null,
//   setEmployerKYCStatus: (status) => set({ employerKYCStatus: status }),
//   clearEmployerKYCStatus: () => set({ employerKYCStatus: null }),

//   // KYC state (for backward compatibility)
//   kycStatus: null,
//   setKYCStatus: (status) => set({ kycStatus: status }),
//   clearKYCStatus: () => set({ kycStatus: null }),

//   // Loading state
//   isLoading: false,
//   setIsLoading: (loading) => set({ isLoading: loading }),

//   error: null,
//   setError: (error) => set({ error }),

//   // Reset state
//   resetKYC: () =>
//     set({
//       companyKYCStatus: null,
//       employerKYCStatus: null,
//       kycStatus: null,
//       isLoading: false,
//       error: null,
//     }),
// }));

import { create } from "zustand";

/**
 * Full KYC Status response from API
 * Maps directly to getKYCStatus() response
 */
export interface FullKYCStatus {
  companyKycStatus:
    | "pending"
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";
  employerKycStatus:
    | "pending"
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";
  tosStatus: "pending" | "not_started" | "accepted" | "rejected";
  kycStatus:
    | "pending"
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected"; // Bridge verification status
  kycLink?: string;
  tosLink?: string;
  message?: string;
  rejectionReason?: string | null;
}

interface KYCStore {
  // Full KYC status from API
  kycStatus: FullKYCStatus | null;
  setKYCStatus: (status: Partial<FullKYCStatus> | FullKYCStatus) => void;
  clearKYCStatus: () => void;

  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Reset entire KYC state
  resetKYC: () => void;
}

export const useKYCStore = create<KYCStore>((set, get) => ({
  kycStatus: null,
  setKYCStatus: (status) => {
    const current = get().kycStatus;
    set({
      kycStatus: current
        ? { ...current, ...status }
        : (status as FullKYCStatus),
    });
  },
  clearKYCStatus: () => set({ kycStatus: null }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),

  resetKYC: () =>
    set({
      kycStatus: null,
      isLoading: false,
      error: null,
    }),
}));
