import { get, postFormData, teamPost } from "./api-client";
import { FullKYCStatus } from "@/store/kyc-store";

// Stage 1: Company KYC Data
export interface CompanyKYCData {
  fullName: string;
  address: string;
  taxNumber: string;
  websiteUrl: string;
  certOfIncorporation: File;
}

// Stage 2: Employer Documents Data
export interface EmployerDocumentsData {
  dob: string;
  proofOfAddress: File;
  id: File;
  idBack: File;
}

// Company KYC Response with Bridge links
export interface CompanyKYCResponse {
  message: string;
  kycLink: string;
  tosLink: string;
  kycStatus:
    | "pending"
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";
  tosStatus: "pending" | "not_started" | "accepted" | "rejected";
}

export interface EmployerDocumentsResponse {
  message: string;
  employerKycStatus:
    | "pending"
    | "not_started"
    | "in_progress"
    | "submitted"
    | "approved"
    | "rejected";
}

// Off-ramp Quote Response
export interface OffRampQuoteResponse {
  currency: string;
  rate: number;
  amountReceived: number;
}

// Get the kyc status of the current user
// Returns they kyc submission status amd optional tos status
// Returns links to complete the kyc and tos if they have not started

export async function getKYCStatus(): Promise<FullKYCStatus> {
  const response = await get<FullKYCStatus>("/kyc/status");
  return response.data;
}

// Submit Stage 1: Company KYC details
export async function SubmitCompanyKYC(
  formData: FormData,
): Promise<CompanyKYCResponse> {
  const response = await postFormData<CompanyKYCResponse>(
    "/kyc/company",
    formData,
  );
  return response.data;
}

// Submit Stage 2: Employer Documents
// Sends personal documents to employer verification
export async function submitEmployerDocuments(
  formData: FormData,
): Promise<EmployerDocumentsResponse> {
  const response = await postFormData<EmployerDocumentsResponse>(
    "/kyc/employer-documents",
    formData,
  );
  return response.data;
}

// Get off-ramp quote for withdrawal amount
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

// Submit KYC details and sends user's KYC informatation and documents to compelete verification
// Returns links and updated status for KYC and TOS
// No longer in use but kept for backwards compatibility

export async function submitKYC(formData: FormData): Promise<FullKYCStatus> {
  const response = await postFormData<FullKYCStatus>("/kyc/submit", formData);
  return response.data;
}
