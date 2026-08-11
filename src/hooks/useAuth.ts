"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useTeamStore } from "@/store/team-store";
import { isTokenExpired, getTokenTimeRemaining } from "@/lib/auth-utils";
import toast from "react-hot-toast";
import {
  executeTokenRefresh,
  getLoginPathForAuthType,
} from "@/lib/token-refresh";

const REFRESH_THRESHOLD_SECONDS = 10 * 60;
const CHECK_INTERVAL_MS = 60_000;

export function useAuth() {
  const router = useRouter();
  const {
    accessToken,
    refreshToken,
    user,
    clearLoginData,
    isAuthenticated,
    authType,
  } = useAuthStore();

  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  const refreshTokenIfNeeded = useCallback(async () => {
    try {
      await executeTokenRefresh();
    } catch {
      router.push(getLoginPathForAuthType(useAuthStore.getState().authType));
      toast.error("Session expired. Please login again.");
    }
  }, [router]);

  useEffect(() => {
    if (!accessToken) return;

    const checkAndRefresh = () => {
      const currentToken = accessTokenRef.current;
      if (!currentToken) return;

      if (isTokenExpired(currentToken)) {
        refreshTokenIfNeeded();
        return;
      }

      const timeRemaining = getTokenTimeRemaining(currentToken);

      if (timeRemaining > 0 && timeRemaining < REFRESH_THRESHOLD_SECONDS) {
        refreshTokenIfNeeded();
      }
    };

    const initialCheckTimer = setTimeout(checkAndRefresh, 500);
    const interval = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(interval);
    };
  }, [accessToken, refreshTokenIfNeeded]);

  const logout = useCallback(() => {
    const loginPath = getLoginPathForAuthType(authType);
    clearLoginData();
    useTeamStore.getState().clearMembers();
    router.push(loginPath);
    toast.success("Logout successful!");
  }, [authType, clearLoginData, router]);

  return {
    isAuthenticated,
    isLoading: false,
    user,
    authType,
    logout,
    refreshTokenIfNeeded,
  };
}
