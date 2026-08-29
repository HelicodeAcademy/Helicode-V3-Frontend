import { useAuthStore } from "@/store/auth-store";
import { executeTokenRefresh } from "./token-refresh";
import { executeTeamTokenRefresh } from "./token-refresh-team";
import { useTeamAuthStore } from "@/store/team/team-auth-store";

const PUBLIC_ENDPOINTS = ["/auth/signin", "/auth/signup", "/auth/refresh"];
const TEAM_PUBLIC_ENDPOINTS = [
  "/team/auth/login",
  "/team/auth/signup",
  "/auth/refresh",
]; // Assuming team has similar public endpoints

// API client configuration
const BASE_URL = "https://helicode-backend.onrender.com";

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Track in-flight refresh to prevent multiple simultaneous refresh calls
// let refreshPromise: Promise<void> | null = null;

// Fetch wrapper for API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useAuthStore.getState();

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Include authorization header if token is available
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (companyId) headers["x-company-id"] = companyId;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  // Intercepts 401s and attempt a refresh, then retry the original request once
  if (response.status === 401) {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((e) =>
      endpoint.startsWith(e),
    );

    if (!isPublicEndpoint && retry) {
      try {
        await executeTokenRefresh();
        return apiCall<T>(endpoint, options, false); // retry once with new token
      } catch {
        // refresh failed, redirect to login
        useAuthStore.getState().clearLoginData();
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }
    // For public endpoints, throw the backend's actual error message
    throw new Error(data.message || "Unauthorized");
  }

  // Handles succesful and error responses uniformly
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data as ApiResponse<T>;
}

// Post request helper
export async function post<T>(
  endpoint: string,
  body: unknown,
  customHeaders?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: customHeaders,
  });
}

// Patch request helper
export async function patch<T>(
  endpoint: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Put request helper
export async function put<T>(
  endpoint: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// Get request helper
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "GET",
  });
}

// POST request helper for FormData (file uploads)

export async function postFormData<T>(
  endpoint: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useAuthStore.getState();

  const headers: Record<string, string> = {};

  // Include Authorization header if token is available
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (companyId) {
    headers["x-company-id"] = companyId;
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });

  const data = await response.json();

  // Handle both successful and error responses
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data as ApiResponse<T>;
}

// GET request helper for file downloads (returns Blob)
export async function getFile(endpoint: string): Promise<Blob> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useAuthStore.getState();

  const headers: Record<string, string> = {};

  // Include Authorization header if token is available
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (companyId) {
    headers["x-company-id"] = companyId;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  return response.blob();
}

// This will handle for all teams related api calls
export async function teamApiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
) {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useTeamAuthStore.getState();

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Include authorization header if token is available
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Include company Id header if available
  if (companyId) headers["x-company-id"] = companyId;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  // Intercepts 401s and attempt a refresh, then retry the original request once
  if (response.status === 401) {
    const isPublicEndpoint = TEAM_PUBLIC_ENDPOINTS.some((e) =>
      endpoint.startsWith(e),
    );

    if (!isPublicEndpoint && retry) {
      try {
        await executeTeamTokenRefresh();
        return teamApiCall<T>(endpoint, options, false); // retry once with new token
      } catch {
        // refresh failed, redirect to team login
        useTeamAuthStore.getState().clearTeamLoginData();
        // window.location.href = "/team/login";
        throw new Error(
          "Team session expired. Please log in again. TeamAPICall error",
        );
      }
    }
    // For public endpoints, throw the backend's actual error message
    throw new Error(data.message || "Unauthorized");
  }

  // Handles succesful and error responses uniformly
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }
  return data as ApiResponse<T>;
}

// Team-specific request helpers
export async function teamPost<T>(
  endpoint: string,
  body: unknown,
  customHeaders?: Record<string, string>,
): Promise<ApiResponse<T>> {
  return teamApiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: customHeaders,
  });
}

export async function teamPatch<T>(
  endpoint: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return teamApiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function teamGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return teamApiCall<T>(endpoint, {
    method: "GET",
  });
}

export async function teamPostFormData<T>(
  endpoint: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useTeamAuthStore.getState();

  const headers: Record<string, string> = {};

  // Include Authorization header if token is available
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (companyId) {
    headers["x-company-id"] = companyId;
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });

  const data = await response.json();

  // Handle both successful and error responses
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data as ApiResponse<T>;
}
