export const INACTIVITY_LIMIT_MS = 20 * 60 * 1000;
export const ACTIVITY_THROTTLE_MS = 10_000;

export const EMPLOYER_LAST_ACTIVITY_KEY = "helicode-last-activity-employer";
export const TEAM_LAST_ACTIVITY_KEY = "helicode-last-activity-team";

export function getLastActivity(storageKey: string): number | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  const timestamp = Number(raw);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function touchLastActivity(storageKey: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, String(Date.now()));
}

export function clearLastActivity(storageKey: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}

export function isInactiveBeyondLimit(
  storageKey: string,
  limitMs: number = INACTIVITY_LIMIT_MS,
): boolean {
  const lastActivity = getLastActivity(storageKey);
  if (!lastActivity) return false;
  return Date.now() - lastActivity > limitMs;
}

export function getMsUntilInactivityLogout(
  storageKey: string,
  limitMs: number = INACTIVITY_LIMIT_MS,
): number {
  const lastActivity = getLastActivity(storageKey);
  if (!lastActivity) return limitMs;

  const remaining = limitMs - (Date.now() - lastActivity);
  return remaining <= 0 ? 0 : remaining;
}
