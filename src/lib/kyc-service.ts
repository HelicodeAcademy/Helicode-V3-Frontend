import { get, postFormData, teamPost } from "./api-client";
import { FullKYCStatus } from "@/store/kyc-store";
import { BridgeKycStatus, BridgeTosStatus } from "@/store/auth-store";

// Stage 1: Company KYC Data (legacy)
export interface CompanyKYCData {
  fullName: string;
  address: string;
  taxNumber: string;
  websiteUrl: string;
  certOfIncorporation: File;
}

// Stage 2: Employer Documents Data (legacy)
export interface EmployerDocumentsData {
  dob: string;
  proofOfAddress: File;
  id: File;
  idBack: File;
}

export interface CompanyKYCResponse {
  message: string;
  kycLink: string;
  tosLink: string;
  kycStatus: BridgeKycStatus;
  tosStatus: BridgeTosStatus;
}

export interface EmployerDocumentsResponse {
  message: string;
  employerKycStatus: string;
}

export interface OffRampQuoteResponse {
  currency: string;
  rate: number;
  amountReceived: number;
}

export async function getKYCStatus(): Promise<FullKYCStatus> {
  const response = await get<FullKYCStatus>("/kyc/status");
  return response.data;
}

/** Legacy Stage 1 — returns 410 when the new onboarding flow is enabled. */
export async function SubmitCompanyKYC(
  formData: FormData,
): Promise<CompanyKYCResponse> {
  const response = await postFormData<CompanyKYCResponse>(
    "/kyc/company",
    formData,
  );
  return response.data;
}

/** Legacy Stage 2 — returns 410 when the new onboarding flow is enabled. */
export async function submitEmployerDocuments(
  formData: FormData,
): Promise<EmployerDocumentsResponse> {
  const response = await postFormData<EmployerDocumentsResponse>(
    "/kyc/employer-documents",
    formData,
  );
  return response.data;
}

export async function getOffRampQuote(
  amount: number,
): Promise<OffRampQuoteResponse> {
  const response = await teamPost<OffRampQuoteResponse>(
    "/team/wallet/offramp/fiat/quote",
    {
      amount,
    },
  );
  return response.data;
}

/** Legacy combined submit — returns 410 when the new onboarding flow is enabled. */
export async function submitKYC(formData: FormData): Promise<FullKYCStatus> {
  const response = await postFormData<FullKYCStatus>("/kyc/submit", formData);
  return response.data;
}
