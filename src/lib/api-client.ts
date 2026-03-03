import { useAuthStore } from "@/store/auth-store";

// API client configuration
const BASE_URL = "https://helicode-backend.onrender.com";

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Get the current access token from zustand store
// Include this toke in the authorization header in API requests

function getAccessToken(): string | null {
  const store = useAuthStore.getState();
  return store.accessToken;
}

// Fetch wrapper for API calls
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

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
