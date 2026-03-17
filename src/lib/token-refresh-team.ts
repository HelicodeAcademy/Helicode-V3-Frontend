import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { refreshTeamAccessToken } from "@/lib/auth-service";

let refreshPromise: Promise<void> | null = null;

export async function executeTeamTokenRefresh(): Promise<void> {
  // If a refresh is already happening, wait for it — don't start another
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { setTeamLoginData, clearTeamLoginData, user, companyId } =
      useTeamAuthStore.getState();

    try {
      const response = await refreshTeamAccessToken();
      setTeamLoginData({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: user!,
        companyId: companyId || "",
        companies: [], // Assuming companies are not updated on refresh
      });
    } catch {
      clearTeamLoginData();
      throw new Error("Team session expired. Please log in again.");
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
