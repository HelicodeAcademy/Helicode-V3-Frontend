"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { isTokenExpired, getTokenTimeRemaining } from "@/lib/auth-utils";
import toast from "react-hot-toast";
import { executeTeamTokenRefresh } from "@/lib/token-refresh-team";
import {
  clearLastActivity,
  TEAM_LAST_ACTIVITY_KEY,
} from "@/lib/inactivity-session";

// Custom hook for team authentication and token management
// Check if team user is authenticated and then token refreshes before expiration
// Clear team session on logout
// Redirecting based on team auth status

const REFRESH_THRESHOLD_SECONDS = 10 * 60; // 10 minutes
const CHECK_INTERVAL_MS = 60_000; // 1 minute

export function useTeamAuth() {
  const router = useRouter();
  const {
    accessToken,
    refreshToken,
    user,
    clearTeamLoginData,
    isAuthenticated,
  } = useTeamAuthStore();

  // Using refs for tokens so the interval always sees the latest values
  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  // Attempt to refresh the team access token using the refresh token
  // Should be called before the access token is about to expire

  const refreshTokenIfNeeded = useCallback(async () => {
    try {
      await executeTeamTokenRefresh();
    } catch {
      router.push("/team/login");
      toast.error("Team session expired. Please login again.");
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
    localStorage.removeItem("team-auth-storage");
    clearLastActivity(TEAM_LAST_ACTIVITY_KEY);
    clearTeamLoginData();
    router.push("/team/login");
    toast.success("Team logout successful!");
  };

  return {
    isAuthenticated,
    isLoading: false,
    user,
    logout,
    refreshTokenIfNeeded,
  };
}
