import { get, post, apiCall } from "./api-client";
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
  contract: File;
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
  //   formData.append("contract", payload.contract);
  formData.append("contract", payload.contract, payload.contract.name);

  await post<void>("/teams/add", formData);
}

export async function revokeTeamMember(teamId: string): Promise<void> {
  await apiCall<void>(`/teams/${teamId}/revoke`, { method: "DELETE" });
}
