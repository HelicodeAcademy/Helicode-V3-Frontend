import { get } from "./api-client";
import { BridgeKycStatus, BridgeTosStatus } from "@/store/auth-store";

export interface CompanyKycSummary {
  companyStageStatus?: string;
  employerStageStatus?: string;
  bridgeKycStatus?: BridgeKycStatus;
  bridgeTosStatus?: BridgeTosStatus | null;
  bridgeKycRejectionReasons?: string[];
  bridgeKycRejectedAt?: string | null;
  hasWallet?: boolean;
  hasBridgeWallet?: boolean;
  hasVirtualAccount?: boolean;
  canCreateActivePayrollGroup?: boolean;
  companyFiatOfframpEnabled?: boolean;
  offrampKycStatus?: boolean;
  bankPayoutStatus?: boolean;
}

export interface CompanyDetailsResponse {
  id: string;
  name: string;
  country: string;
  teamSize?: number;
  address: string;
  city: string;
  state: string;
  postCode: string;
  websiteUrl: string;
  invoiceCurrency: string;
  createdAt?: string;
  companyFiatOfframpEnabled?: boolean;
  offrampKycStatus?: boolean;
  bankPayoutStatus?: boolean;
  employer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  wallet: {
    id: string;
    balance: number;
  };
  hasTransactionPin: boolean;
  kyc?: CompanyKycSummary;
}

export async function getCompanyDetails(): Promise<CompanyDetailsResponse> {
  const response = await get<CompanyDetailsResponse>(`/company/me`);
  return response.data;
}
