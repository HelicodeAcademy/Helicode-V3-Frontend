import { get, post, patch, del } from "./api-client";
import {
  AuthType,
  CompanyAdminAccess,
  CompanyAdminPermission,
  CompanyAdminPermissionAction,
  LoginResponse,
  LoginUser,
} from "@/store/auth-store";

export type {
  CompanyAdminPermission,
  CompanyAdminPermissionAction,
  CompanyAdminAccess,
};

export type CompanyAdminStatus = "PENDING" | "ACTIVE" | "DISABLED" | string;

export interface CompanyAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  status: CompanyAdminStatus;
  hasCompletedSetup: boolean;
  invitedById?: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  permissions: CompanyAdminPermission[];
}

export interface CompanyAdminsListResponse {
  data: CompanyAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InviteCompanyAdminPayload {
  email: string;
  firstName: string;
  lastName: string;
  permissions?: CompanyAdminPermission[];
}

export interface InviteCompanyAdminResponse {
  id: string;
  email: string;
  status: CompanyAdminStatus;
  expiresInMinutes?: number;
  message?: string;
}

export async function listCompanyAdmins(params?: {
  page?: number;
  limit?: number;
}): Promise<CompanyAdminsListResponse> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  const response = await get<CompanyAdminsListResponse>(
    `/company-admins${query ? `?${query}` : ""}`,
  );
  return response.data;
}

export async function inviteCompanyAdmin(
  payload: InviteCompanyAdminPayload,
): Promise<InviteCompanyAdminResponse> {
  const response = await post<InviteCompanyAdminResponse>(
    "/company-admins/invite",
    payload,
  );
  return response.data;
}

export async function resendCompanyAdminInvite(id: string): Promise<void> {
  await post(`/company-admins/${id}/resend-invite`, {});
}

export async function updateCompanyAdminPermissions(
  id: string,
  permissions: CompanyAdminPermission[],
): Promise<CompanyAdmin> {
  const response = await patch<CompanyAdmin>(
    `/company-admins/${id}/permissions`,
    { permissions },
  );
  return response.data;
}

export async function removeCompanyAdmin(
  id: string,
): Promise<{ id: string; email: string; removed: boolean }> {
  const response = await del<{ id: string; email: string; removed: boolean }>(
    `/company-admins/${id}`,
  );
  return response.data;
}

export interface CompanyAdminSetupConfirmPayload {
  email: string;
  code: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CompanyAdminSetupConfirmResponse {
  id: string;
  email: string;
  status: CompanyAdminStatus;
}

export async function requestCompanyAdminSetupCode(
  email: string,
): Promise<void> {
  await post("/company-admins/auth/setup-code", { email });
}

export async function confirmCompanyAdminSetup(
  payload: CompanyAdminSetupConfirmPayload,
): Promise<CompanyAdminSetupConfirmResponse> {
  const response = await post<CompanyAdminSetupConfirmResponse>(
    "/company-admins/auth/setup-confirm",
    payload,
  );
  return response.data;
}

interface CompanyAdminLoginApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  status: string;
  permissions: CompanyAdminPermission[];
}

interface CompanyAdminLoginApiResponse {
  accessToken: string;
  refreshToken: string;
  user: CompanyAdminLoginApiUser;
}

export async function loginCompanyAdmin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await post<CompanyAdminLoginApiResponse>(
    "/company-admins/auth/login",
    { email, password },
  );
  const data = response.data;
  const user: LoginUser = {
    id: data.user.id,
    email: data.user.email,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    status: data.user.status,
    role: "company_admin",
    permissions: data.user.permissions,
  };

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user,
    companyId: data.user.companyId,
    authType: "company_admin" satisfies AuthType,
  };
}

export async function refreshCompanyAdminAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { useAuthStore } = await import("@/store/auth-store");
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error("No refresh token found");

  const BASE_URL = "https://helicode-backend.onrender.com";
  const response = await fetch(`${BASE_URL}/company-admins/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Token refresh failed");
  }

  return data.data;
}

export async function getCompanyAdminMe(): Promise<CompanyAdminLoginApiUser> {
  const response = await get<CompanyAdminLoginApiUser>(
    "/company-admins/auth/me",
  );
  return response.data;
}
