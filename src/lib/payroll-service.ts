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

interface RawPayrollMetrics {
  range: string;
  from: string;
  to: string;
  activeTeamMembers: number;
  totalPayrollProcessed: number;
  payrollCount: number;
  byCurrency: string[];
}

export type PayrollMetricsRange = "30d" | "6months" | "1year";

export interface PayrollMetrics {
  range: string;
  from: string;
  to: string;
  activeTeamMembers: number;
  totalPayrollProcessed: number;
  payrollCount: number;
  byCurrency: string[];
  formattedTotalPayrollProcessed: string;
}

export interface PayAllPayrollResponse {
  payrollGroupId: string;
  runId: string;
  paidCount: number;
  date: string;
}

function normalizePayrollMetrics(data: RawPayrollMetrics): PayrollMetrics {
  const totalPayrollProcessed =
    typeof data.totalPayrollProcessed === "number"
      ? data.totalPayrollProcessed
      : 0;

  return {
    range: data.range || "30d",
    from: data.from || "",
    to: data.to || "",
    activeTeamMembers:
      typeof data.activeTeamMembers === "number" ? data.activeTeamMembers : 0,
    totalPayrollProcessed,
    payrollCount: typeof data.payrollCount === "number" ? data.payrollCount : 0,
    byCurrency: Array.isArray(data.byCurrency) ? data.byCurrency : [],
    formattedTotalPayrollProcessed: `$${totalPayrollProcessed.toFixed(2)}`,
  };
}

export async function getPayrollMetrics(
  range: PayrollMetricsRange = "30d",
): Promise<PayrollMetrics> {
  const response = await get<RawPayrollMetrics>(
    `/payroll-groups/stats?range=${range}`,
  );
  return normalizePayrollMetrics(response.data);
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

export async function payAllPayrollGroups(
  verificationCode: string,
): Promise<PayAllPayrollResponse> {
  const response = await post<PayAllPayrollResponse>(
    "/payroll-groups/pay-now/all",
    { verificationCode },
  );

  return response.data;
}
