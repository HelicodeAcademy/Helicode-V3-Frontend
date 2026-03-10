"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { isTokenExpired, getTokenTimeRemaining } from "@/lib/auth-utils";
import toast from "react-hot-toast";
import { executeTokenRefresh } from "@/lib/token-refresh";

// Custom hook for authentication and token management
// Check if user is authenticated and then token refreshes before expiration
// Clear session on logout
// Redrecting based on auth status

const REFRESH_THRESHOLD_SECONDS = 5 * 60; // 5 minutes
const CHECK_INTERVAL_MS = 60_000; // 1 minute

export function useAuth() {
  const router = useRouter();
  const { accessToken, refreshToken, user, clearLoginData, isAuthenticated } =
    useAuthStore();

  // Using refs for tokens so the interval always sees the latest values
  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  // Attempt to refresh the access token using the refresh token
  // SHould be called before the access token is about to expire

  const refreshTokenIfNeeded = useCallback(async () => {
    try {
      await executeTokenRefresh();
    } catch {
      router.push("/login");
      toast.error("Session expired. Please login again.");
    }
  }, [router]);

  useEffect(() => {
    // Do not do anything if there is no access token
    if (!accessToken) return;

    const checkAndRefresh = () => {
      const currentToken = accessTokenRef.current;
      if (!currentToken) return;

      if (isTokenExpired(currentToken)) {
        refreshTokenIfNeeded();
        return;
      }
      // Get time remaining until token expiration
      const timeRemaining = getTokenTimeRemaining(currentToken);

      if (timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD_SECONDS) {
        // Token is about to expire, refresh it
        refreshTokenIfNeeded();
      }
    };

    // Run an initial check, but defer it slightly to ensure the store
    // has fully settled after login before inspecting the token.

    const initialCheckTimer = setTimeout(checkAndRefresh, 500);

    // check at regular interval
    const interval = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(interval);
    };
  }, [accessToken, refreshTokenIfNeeded]);

  const logout = () => {
    clearLoginData();
    router.push("/login");
    toast.success("Logout successful!");
  };

  return {
    isAuthenticated,
    isLoading: false,
    user,
    logout,
    refreshTokenIfNeeded,
  };
}
