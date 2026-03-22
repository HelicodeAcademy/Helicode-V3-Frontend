import { post, patch, get } from "./api-client";

export interface CreatePayrollGroupRequest {
  name: string;
  teamIds: string[];
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  startDate: string;
}

export interface PayrollTeamMember {
  id: string;
  fullName: string;
}

export interface PayrollGroup {
  id: string;
  name: string;
  frequency: string;
  startDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  memberCount?: number;
  teamMembers?: PayrollTeamMember[];
}

export interface UpdatePayrollGroupRequest {
  name: string;
  teamIds: string[];
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  startDate: string;
}

// Get all payroll groups for the company
export async function getPayrollGroups(): Promise<PayrollGroup[]> {
  const response = await get<PayrollGroup[]>("/payroll-groups");
  return response.data;
}

// Create a payroll group
export async function createPayrollGroup(
  data: CreatePayrollGroupRequest,
): Promise<PayrollGroup> {
  const response = await post<PayrollGroup>("/payroll-groups", {
    name: data.name,
    teamIds: data.teamIds,
    frequency: data.frequency,
    startDate: data.startDate,
  });

  return response.data;
}

// Update an existing payroll group

export async function updatePayrollGroup(
  id: string,
  data: UpdatePayrollGroupRequest,
): Promise<PayrollGroup> {
  const response = await patch<PayrollGroup>(`/payroll-groups/${id}`, {
    name: data.name,
    teamIds: data.teamIds,
    frequency: data.frequency,
    startDate: data.startDate,
  });
  return response.data;
}

export async function updatePayrollGroupStatus(
  id: string,
  isActive: boolean,
): Promise<PayrollGroup> {
  const response = await patch<PayrollGroup>(`/payroll-groups/${id}/status`, {
    isActive,
  });
  return response.data;
}
