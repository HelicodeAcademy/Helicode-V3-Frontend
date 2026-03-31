import { get } from "./api-client";

export interface CompanyDetailsResponse {
  id: string;
  name: string;
  country: string;
  teamSize: number;
  address: string;
  city: string;
  state: string;
  postCode: string;
  websiteUrl: string;
  invoiceCurrency: string;
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
}

export async function getCompanyDetails(): Promise<CompanyDetailsResponse> {
  const response = await get<CompanyDetailsResponse>(`/company/me`);
  return response.data;
}
