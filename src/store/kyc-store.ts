import { create } from "zustand";
import {
  BridgeKycStatus,
  BridgeTosStatus,
} from "@/store/auth-store";

export type KycStageStatus = "pending" | "submitted";

export interface KycRejectionReason {
  details: string[];
  createdAt?: string;
}

/**
 * Full KYC Status response from GET /kyc/status
 */
export interface FullKYCStatus {
  companyKycStatus?: KycStageStatus | string;
  employerKycStatus?: KycStageStatus | string;
  fullName?: string;
  email?: string;
  tosStatus: BridgeTosStatus | null;
  kycStatus: BridgeKycStatus;
  kycLink?: string | null;
  tosLink?: string | null;
  message?: string;
  rejectionReason?: KycRejectionReason | string | null;
}

interface KYCStore {
  kycStatus: FullKYCStatus | null;
  setKYCStatus: (status: Partial<FullKYCStatus> | FullKYCStatus) => void;
  clearKYCStatus: () => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  resetKYC: () => void;
}

export function isKycFullyApproved(
  status: Pick<FullKYCStatus, "kycStatus" | "tosStatus"> | null | undefined,
): boolean {
  return status?.kycStatus === "approved" && status?.tosStatus === "approved";
}

export function getRejectionDetails(
  rejectionReason: FullKYCStatus["rejectionReason"],
): string[] {
  if (!rejectionReason) return [];
  if (typeof rejectionReason === "string") return [rejectionReason];
  return rejectionReason.details ?? [];
}

/** User-facing label for identity verification status (no provider names). */
export function formatKycStatusLabel(status: BridgeKycStatus | string | null | undefined): string {
  switch (status) {
    case "approved":
      return "Verified";
    case "rejected":
      return "Rejected";
    case "under_review":
      return "Under review";
    case "incomplete":
    case "awaiting_questionnaire":
    case "awaiting_ubo":
    case "not_started":
      return "Action required";
    case "paused":
      return "On hold";
    case "offboarded":
      return "Unavailable";
    case "pending":
    default:
      return "Pending";
  }
}

export function needsUserKycAction(
  status: BridgeKycStatus | string | null | undefined,
): boolean {
  return (
    status === "not_started" ||
    status === "incomplete" ||
    status === "awaiting_questionnaire" ||
    status === "awaiting_ubo" ||
    status === "rejected"
  );
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
