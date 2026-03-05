"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { isTokenExpired, getTokenTimeRemaining } from "@/lib/auth-utils";
import { refreshAccessToken } from "@/lib/auth-service";
import toast from "react-hot-toast";

// Custom hook for authentication and token management
// Check if user is authenticated and then token refreshes before expiration
// Clear session on logout
// Redrecting based on auth status

export function useAuth() {
  const router = useRouter();
  const {
    accessToken,
    refreshToken,
    user,
    setLoginData,
    clearLoginData,
    isAuthenticated,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Attempt to refresh the access token using the refresh token
  // SHould be called before the access token is about to expire

  const refreshTokenIfNeeded = async () => {
    if (!refreshToken || isRefreshing) return;

    try {
      setIsRefreshing(true);

      const response = await refreshAccessToken(refreshToken);
      console.log("Token refreshed", response);

      // update store with new tokens
      setLoginData({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: user!,
        companyId: user?.id || "",
      });
    } catch (error) {
      console.error("Token refreshed failed", error);

      // Clear login data on refresh failure as user needs to login again
      clearLoginData();
      router.push("/login");
      toast.error("Session expired. Please login again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const logout = () => {
    clearLoginData();
    router.push("/login");
    toast.success("Logout successful!");
  };

  useEffect(() => {
    setIsLoading(false);

    if (!accessToken) return;
    // Check if toke is expired
    if (isTokenExpired(accessToken)) {
      refreshTokenIfNeeded();
      return;
    }

    // Get time remaining until token expiration
    const timeRemaining = getTokenTimeRemaining(accessToken);

    // Refresh token 5 mins before expirtation)
    const refreshThreshold = 5 * 60;

    if (timeRemaining > 0 && timeRemaining < refreshThreshold) {
      // Token is about to expire, refresh it
      refreshTokenIfNeeded();
      return;
    }

    // Set up interval to check token periodically
    // Check every minute for token refresh needs
    const interval = setInterval(() => {
      if (isTokenExpired(accessToken)) {
        refreshTokenIfNeeded();
      } else {
        const remaining = getTokenTimeRemaining(accessToken);
        if (remaining > 0 && remaining < refreshThreshold) {
          refreshTokenIfNeeded();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, refreshToken]);
  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    refreshTokenIfNeeded,
  };
}
