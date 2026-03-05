import { useAuthStore } from "@/store/auth-store";
import { refreshAccessToken } from "./auth-service";

// API client configuration
const BASE_URL = "https://helicode-backend.onrender.com";

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Track in-flight refresh to prevent multiple simultaneous refresh calls
let refreshPromise: Promise<void> | null = null;

async function attemptTokenRefresh(): Promise<void> {
  // If a refresh is alreeady in progress, wait for it to complete
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { refreshToken, setLoginData, clearLoginData, user } =
      useAuthStore.getState();

    if (!refreshToken) throw new Error("No refresh token found");

    try {
      const response = await refreshAccessToken(refreshToken);
      setLoginData({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: user!,
        companyId: user?.id || "",
      });
    } catch {
      clearLoginData();
      throw new Error("Refresh failed");
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Fetch wrapper for API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Include authorization header if token is available
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  // Intercepts 401s and attempt a refresh, then retry the original request once
  if (response.status === 401 && retry) {
    try {
      await attemptTokenRefresh();
      return apiCall<T>(endpoint, options, false); // retry once with new token
    } catch {
      // refresh failed, redirect to login
      useAuthStore.getState().clearLoginData();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
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
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Get request helper
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: "GET",
  });
}
