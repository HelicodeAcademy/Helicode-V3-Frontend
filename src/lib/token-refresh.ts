// lib/token-refresh.ts — single shared refresh manager

import { useAuthStore } from "@/store/auth-store";
import { refreshAccessToken } from "@/lib/auth-service";

let refreshPromise: Promise<void> | null = null;

export function getLoginPathForAuthType(
  authType: string | null | undefined,
): string {
  return authType === "company_admin" ? "/company-admin/login" : "/login";
}

export async function executeTokenRefresh(): Promise<void> {
  // If a refresh is already happening, wait for it — don't start another
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { setLoginData, clearLoginData, user, companyId, authType } =
      useAuthStore.getState();

    try {
      const response =
        authType === "company_admin"
          ? await (
              await import("@/lib/company-admins-service")
            ).refreshCompanyAdminAccessToken()
          : await refreshAccessToken();

      setLoginData({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: user!,
        companyId: companyId || "",
        authType: authType ?? "employer",
      });
    } catch {
      clearLoginData();
      throw new Error("Session expired. Please log in again.");
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
