import { useAuthStore } from '@/store/auth-store';
import { executeTokenRefresh } from './token-refresh';

const PUBLIC_ENDPOINTS = ['/auth/signin', '/auth/signup', '/auth/refresh'];

// API client configuration
const BASE_URL = 'https://helicode-backend.onrender.com';

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
  retry = true
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Include authorization header if token is available
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (companyId) headers['x-company-id'] = companyId;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  // Intercepts 401s and attempt a refresh, then retry the original request once
  if (response.status === 401) {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((e) =>
      endpoint.startsWith(e)
    );

    if (!isPublicEndpoint && retry) {
      try {
        await executeTokenRefresh();
        return apiCall<T>(endpoint, options, false); // retry once with new token
      } catch {
        // refresh failed, redirect to login
        useAuthStore.getState().clearLoginData();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }
    // For public endpoints, throw the backend's actual error message
    throw new Error(data.message || 'Unauthorized');
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
  body: unknown
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Patch request helper
export async function patch<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// Get request helper
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall<T>(endpoint, {
    method: 'GET',
  });
}

// POST request helper for FormData (file uploads)

export async function postFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const { accessToken, companyId } = useAuthStore.getState();

  const headers: Record<string, string> = {};

  // Include Authorization header if token is available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (companyId) {
    headers['x-company-id'] = companyId;
  }

  const response = await fetch(url, {
    method: 'POST',
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
