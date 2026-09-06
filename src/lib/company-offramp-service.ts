import { get, post } from "./api-client";
import type { CompanyDetailsResponse } from "./company-details";
import type {
  BankDetailsResponse,
  BankDetailsSubmissionData,
  KYCResponse,
  KYCSubmissionData,
  OffRampEnums,
  QuidaxBanksResponse,
  SupportBanksResponse,
  SupportCountriesResponse,
} from "./team/team-kyc-service";

export interface CompanyOfframpKyc {
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
  tier?: string;
  customerUID?: string;
  updatedAt?: string;
}

export interface CompanyOfframpBank {
  id: string;
  country: string;
  currencyCode: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  updatedAt?: string;
}

export interface CompanyOfframpProfile {
  companyId: string;
  kyc: CompanyOfframpKyc | null;
  bank: CompanyOfframpBank | null;
  offrampKycStatus: boolean;
  bankPayoutStatus: boolean;
}

export interface CompanyOffRampQuoteResponse {
  currency: string;
  rate: number;
  amountReceived: number;
}

export interface CompanyFiatWithdrawalData {
  amount: number;
  verificationCode: string;
  reason: string;
}

export function isCompanyFiatOfframpEnabled(
  companyDetails: CompanyDetailsResponse | null | undefined,
): boolean {
  if (!companyDetails) return false;

  const flag =
    companyDetails.companyFiatOfframpEnabled ??
    companyDetails.kyc?.companyFiatOfframpEnabled;

  return Boolean(flag);
}

export function getCompanyOfframpKycStatus(
  companyDetails: CompanyDetailsResponse | null | undefined,
): boolean {
  if (!companyDetails) return false;

  return Boolean(
    companyDetails.offrampKycStatus ?? companyDetails.kyc?.offrampKycStatus,
  );
}

export function getCompanyBankPayoutStatus(
  companyDetails: CompanyDetailsResponse | null | undefined,
): boolean {
  if (!companyDetails) return false;

  return Boolean(
    companyDetails.bankPayoutStatus ?? companyDetails.kyc?.bankPayoutStatus,
  );
}

export async function getCompanyOffRampEnums(): Promise<OffRampEnums> {
  const response = await get<OffRampEnums>("/wallet/offramp/enums");
  return response.data;
}

export async function submitCompanyOfframpKyc(
  data: KYCSubmissionData,
): Promise<KYCResponse> {
  const response = await post<KYCResponse>("/wallet/offramp/kyc", data);
  return response.data;
}

export async function getCompanySupportedCountries(): Promise<SupportCountriesResponse> {
  const response = await get<SupportCountriesResponse>("/support/countries");
  return response.data;
}

export async function getCompanySupportedBanks(
  country: string,
  currency: string,
): Promise<SupportBanksResponse> {
  const params = new URLSearchParams({ country, currency });
  const response = await get<SupportBanksResponse>(
    `/support/banks?${params.toString()}`,
  );
  return response.data;
}

export async function getCompanyQuidaxBanks(
  country: string,
  payoutType: "bank" | "momo" = "bank",
  search?: string,
): Promise<QuidaxBanksResponse> {
  const params = new URLSearchParams({
    country,
    payoutType,
    ...(search && { search }),
  });
  const response = await get<QuidaxBanksResponse>(
    `/wallet/offramp/quidax/banks?${params.toString()}`,
  );
  return response.data;
}

export async function submitCompanyOfframpBank(
  data: BankDetailsSubmissionData,
): Promise<BankDetailsResponse> {
  const response = await post<BankDetailsResponse>("/wallet/offramp/bank", data);
  return response.data;
}

export async function getCompanyOfframpProfile(): Promise<CompanyOfframpProfile> {
  const response = await get<CompanyOfframpProfile>("/wallet/offramp/profile");
  return response.data;
}

export async function getCompanyBankPayout(): Promise<CompanyOfframpBank> {
  const response = await get<CompanyOfframpBank>("/wallet/offramp/bank-payout");
  return response.data;
}

export async function getCompanyOffRampQuote(
  amount: number,
): Promise<CompanyOffRampQuoteResponse> {
  const response = await post<CompanyOffRampQuoteResponse>(
    "/wallet/offramp/fiat/quote",
    { amount },
  );
  return response.data;
}

export async function initiateCompanyFiatWithdrawal(
  data: CompanyFiatWithdrawalData,
): Promise<unknown> {
  const response = await post<unknown>("/wallet/offramp/fiat", data);
  return response.data;
}
