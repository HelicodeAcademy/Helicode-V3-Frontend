import { teamGet, teamPost } from "../api-client";

export interface KYCSubmissionData {
  country: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  idType: string;
  idNumber: string;
  additionalIdType?: string;
  additionalIdNumber?: string;
}

export interface KYCResponse {
  id: string;
  country: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  idType: string;
  idNumber: string;
  additionalIdType?: string;
  additionalIdNumber?: string;
  tier: string;
  customerUID: string;
  updatedAt: string;
}

export interface OffRampEnums {
  countries: string[];
  fiatCurrencies: string[];
  idTypes: string[];
}

export interface BankDetailsSubmissionData {
  country: string;
  currencyCode: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
}

export interface BankDetailsResponse {
  id: string;
  country: string;
  currencyCode: string;
  channelId: string;
  networkId: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  updatedAt: string;
}

// Get supported countries, and Id types for KYC
// Required for populating from dropdowns
export async function getOffRampEnums(): Promise<OffRampEnums> {
  const response = await teamGet<OffRampEnums>("/team/offramp/enums");
  return response.data;
}

// Submit KYC details
export async function submitTeamKYC(
  data: KYCSubmissionData,
): Promise<KYCResponse> {
  const response = await teamPost<KYCResponse>("/team/offramp/kyc", data);
  return response.data;
}

//Submit bank details for payout and send bank account information for YellowCard offramp

export async function submitTeamBankDetails(
  data: BankDetailsSubmissionData,
): Promise<BankDetailsResponse> {
  const response = await teamPost<BankDetailsResponse>(
    "/team/offramp/bank",
    data,
  );
  return response.data;
}
