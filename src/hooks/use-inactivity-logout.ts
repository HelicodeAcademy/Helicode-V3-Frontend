"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ACTIVITY_THROTTLE_MS,
  getLastActivity,
  getMsUntilInactivityLogout,
  INACTIVITY_LIMIT_MS,
  isInactiveBeyondLimit,
  touchLastActivity,
} from "@/lib/inactivity-session";

const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
  "pointerdown",
  "wheel",
] as const;

interface UseInactivityLogoutOptions {
  storageKey: string;
  onLogout: () => void;
  enabled?: boolean;
  limitMs?: number;
}

export function useInactivityLogout({
  storageKey,
  onLogout,
  enabled = true,
  limitMs = INACTIVITY_LIMIT_MS,
}: UseInactivityLogoutOptions) {
  const timerRef = useRef<number | null>(null);
  const lastPersistedActivityRef = useRef(0);
  const onLogoutRef = useRef(onLogout);

  onLogoutRef.current = onLogout;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerLogout = useCallback(() => {
    clearTimer();
    onLogoutRef.current();
  }, [clearTimer]);

  const scheduleLogout = useCallback(
    (delayMs: number) => {
      clearTimer();

      if (delayMs <= 0) {
        triggerLogout();
        return;
      }

      timerRef.current = window.setTimeout(() => {
        triggerLogout();
      }, delayMs);
    },
    [clearTimer, triggerLogout],
  );

  const recordActivity = useCallback(() => {
    const now = Date.now();

    if (now - lastPersistedActivityRef.current >= ACTIVITY_THROTTLE_MS) {
      touchLastActivity(storageKey);
      lastPersistedActivityRef.current = now;
    }

    scheduleLogout(limitMs);
  }, [limitMs, scheduleLogout, storageKey]);

  const enforceInactivityLimit = useCallback(() => {
    if (isInactiveBeyondLimit(storageKey, limitMs)) {
      triggerLogout();
      return true;
    }

    scheduleLogout(getMsUntilInactivityLogout(storageKey, limitMs));
    return false;
  }, [limitMs, scheduleLogout, storageKey, triggerLogout]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    if (getLastActivity(storageKey) === null) {
      touchLastActivity(storageKey);
      lastPersistedActivityRef.current = Date.now();
    }

    if (enforceInactivityLimit()) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        touchLastActivity(storageKey);
        lastPersistedActivityRef.current = Date.now();
        clearTimer();
        return;
      }

      enforceInactivityLimit();
    };

    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, recordActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", enforceInactivityLimit);

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", enforceInactivityLimit);
    };
  }, [
    clearTimer,
    enabled,
    enforceInactivityLimit,
    recordActivity,
    storageKey,
  ]);
}
