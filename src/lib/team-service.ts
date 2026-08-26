import { get, postFormData, apiCall, patch, post, getFile } from "./api-client";
import { TeamMember, TeamFilters } from "@/store/team-store";

type TeamListRaw = TeamMember[] | { data: TeamMember[]; total: number };

export interface NormalizedTeamList {
  data: TeamMember[];
  total: number;
}

export interface TeamListResponse {
  data: TeamMember[];
  total: number;
  page: number;
  limit: number;
}

export interface AddTeamMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  country: string;
  type: "CONTRACTOR" | "EMPLOYEE";
  amount: string;
  startDate: string;
  frequency: "MONTHLY" | "WEEKLY" | "DAILY" | "HOURLY";
  currency: "USD" | "EUR" | "USDC" | "USDT";
  contract?: File;
}

export interface UpdateTeamMemberPayload {
  firstName: string;
  lastName: string;
  role: string;
  startDate: string;
  amount: string;
}

interface UpdateTeamMemberResponse {
  message: string;
}

export interface PaySingleMemberResponse {
  payrollGroupId: string;
  ledgerEntryId: string;
  runId: string;
  teamId: string;
  amount: number;
  date: string;
}

export interface BulkUploadSuccessfulMember {
  message: string;
  email: string;
  otp: string;
  membershipId: string;
  memberType: "EMPLOYEE" | "CONTRACTOR";
  memberRole: string;
  memberFirstName: string;
  memberLastName: string;
}

export interface BulkUploadResult {
  message: string;
  successful: BulkUploadSuccessfulMember[];
  failed: Array<{
    email: string;
    error: string;
  }>;
}

export interface BulkUploadResponse {
  headers: string[];
  parsedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  rejected: Array<{
    row: number;
    error: string;
  }>;
  result: BulkUploadResult;
}

export async function getTeamMembers(
  filters: Partial<TeamFilters>,
): Promise<NormalizedTeamList> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  //   if (filters.page) params.set("page", String(filters.page));
  //   if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  const response = await get<TeamListRaw>(`/teams${query ? `?${query}` : ""}`);

  if (Array.isArray(response.data)) {
    return { data: response.data, total: response.data.length };
  }

  const paginated = response.data as { data: TeamMember[]; total: number };
  return { data: paginated.data, total: paginated.total };
}

export async function addTeamMember(
  payload: AddTeamMemberPayload,
): Promise<void> {
  const formData = new FormData();
  formData.append("firstName", payload.firstName);
  formData.append("lastName", payload.lastName);
  formData.append("email", payload.email);
  formData.append("role", payload.role);
  formData.append("department", payload.department);
  formData.append("country", payload.country);
  formData.append("type", payload.type);
  formData.append("amount", payload.amount);
  //   formData.append("amount", String(payload.amount));
  formData.append("startDate", payload.startDate);
  formData.append("frequency", payload.frequency);
  formData.append("currency", payload.currency);
  if (payload.contract) {
    formData.append("contract", payload.contract, payload.contract.name);
  }

  await postFormData<void>("/teams/add", formData);
}

export async function revokeTeamMember(teamId: string): Promise<void> {
  await apiCall<void>(`/teams/${teamId}/revoke`, { method: "DELETE" });
}

export interface ResendTeamInviteResponse {
  message: string;
  data: {
    message: string;
  };
}

export async function resendTeamMemberInvite(
  memberId: string,
): Promise<string> {
  const response = await post<ResendTeamInviteResponse>(
    `/teams/${memberId}/resend-invite`,
    { id: memberId },
  );

  return response.message || response.data.message;
}

export async function updateTeamMember(
  memberId: string,
  payload: UpdateTeamMemberPayload,
): Promise<string> {
  const response = await patch<UpdateTeamMemberResponse>(
    `/teams/${memberId}`,
    payload,
  );

  return response.data.message;
}

export async function paySingleTeamMember(
  memberId: string,
  verificationCode: string,
  amount: number,
): Promise<PaySingleMemberResponse> {
  const response = await post<PaySingleMemberResponse>(
    `/payroll-groups/pay-now/${memberId}`,
    {
      verificationCode,
      amount,
    },
  );

  return response.data;
}

// Bulk upload team members from CSV
// Sends CSV file to backend for processing

export async function bulkUploadTeamMembersFromCSV(
  file: File,
): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await postFormData<BulkUploadResponse>(
    "/teams/bulk-upload-csv",
    formData,
  );

  if (!response.data) {
    throw new Error("Bulk upload failed");
  }
  return response.data;
}

export async function downloadSampleCSV(): Promise<void> {
  const blob = await getFile("/teams/bulk-upload-csv/sample");

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample-team-members.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
