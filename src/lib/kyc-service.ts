import { get, postFormData } from "./api-client";
import { KYCStatus } from "@/store/kyc-store";

// Get the kyc status of the current user
// Returns they kyc submission status amd optional tos status
// Returns links to complete the kyc and tos if they have not started

export async function getKYCStatus(): Promise<KYCStatus> {
  const response = await get<KYCStatus>("/kyc/status");
  return response.data;
}

// Submit KYC details and sends user's KYC informatation and documents to compelete verification
// Returns links and updated status for KYC and TOS

export async function submitKYC(formData: FormData): Promise<KYCStatus> {
  const response = await postFormData<KYCStatus>("/kyc/submit", formData);
  return response.data;
}
