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
  accountType: "bank" | "momo";
  country: string;
  currencyCode: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
}

export interface BankDetailsResponse {
  bankPayout: {
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
  };
  bridgeKyc: {
    kycLink?: string;
    tosLink?: string;
    kycStatus: "not_started" | "pending" | "approved" | "rejected";
    tosStatus: "not_started" | "pending" | "approved" | "rejected";
  };
}

export interface BridgeKycStatusResponse {
  message: string;
  fullName: string;
  email: string;
  toStatus: "not_started" | "pending" | "approved" | "rejected";
  kycStatus: "not_started" | "pending" | "approved" | "rejected";
  kycLink: string;
  tosLink: string;
}

export interface SupportCountry {
  code: string;
  name: string;
  currency?: string;
}

export interface SupportCountriesResponse {
  countries: SupportCountry[];
}

export interface SupportBank {
  code: string;
  name: string;
}

export interface SupportBanksResponse {
  banks: SupportBank[];
}

export interface QuidaxBank {
  public_id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QuidaxBanksResponse {
  banks: QuidaxBank[];
}

export interface BankDetailsSubmissionDataWithQuidax extends BankDetailsSubmissionData {
  bankCode: string; // Make bankCode required for Quidax
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

// Get supported countries for bank details submission (returns codes, names and currencies)
export async function getSupportedCountries(): Promise<SupportCountriesResponse> {
  const response =
    await teamGet<SupportCountriesResponse>("/support/countries");
  return response.data;
}

// Get supported banks for bank details submission (returns bank codes and names based on country and currency)
export async function getSupportedBanks(
  country: string,
  currency: string,
): Promise<SupportBanksResponse> {
  const params = new URLSearchParams({ country, currency });
  const response = await teamGet<SupportBanksResponse>(
    `/support/banks?${params.toString()}`,
  );
  return response.data;
}

// Get Quidax banks for Nigeria and Ghana off-ramp
export async function getQuidaxBanks(
  country: string,
  payoutType: "bank" | "momo" = "bank",
  search?: string,
): Promise<QuidaxBanksResponse> {
  const params = new URLSearchParams({
    country,
    payoutType,
    ...(search && { search }),
  });
  const response = await teamGet<QuidaxBanksResponse>(
    `/team/offramp/quidax/banks?${params.toString()}`,
  );
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

export interface BridgeKycInitResponse {
  message?: string;
  kycLink: string;
  tosLink: string;
}

// Initiate Bridge KYC for stablecoin-only payouts
// (team members in countries not supported by local-currency offramp partners)
export async function initiateBridgeKyc(): Promise<BridgeKycInitResponse> {
  const response = await teamPost<BridgeKycInitResponse>(
    "/team/bridge-kyc",
    {},
  );
  return response.data;
}

export async function getBridgeKycStatus(): Promise<BridgeKycStatusResponse> {
  const response = await teamGet<BridgeKycStatusResponse>(
    "/team/bridge-kyc/status",
  );
  return response.data;
}
