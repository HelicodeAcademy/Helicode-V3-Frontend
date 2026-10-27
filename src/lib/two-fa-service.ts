import { get, post, teamGet, teamPost } from "./api-client";
import { getApiErrorCode } from "./api-error";

export interface TwoFaStatus {
  available: boolean;
  enrolled: boolean;
  enabled: boolean;
  required: boolean;
  mustEnrollNow: boolean;
  codeRequired: boolean;
  canDisable: boolean;
  enforcementEnabled: boolean;
  deadline: string | null;
  backupCodesRemaining: number;
}

export interface TwoFaSetupResponse {
  otpauthUrl: string;
  secret: string;
  qrSvg: string;
  expiresInMinutes: number;
}

export interface TwoFaConfirmResponse {
  enabled: boolean;
  backupCodes: string[];
}

const UNAVAILABLE_STATUS: TwoFaStatus = {
  available: false,
  enrolled: false,
  enabled: false,
  required: false,
  mustEnrollNow: false,
  codeRequired: false,
  canDisable: true,
  enforcementEnabled: false,
  deadline: null,
  backupCodesRemaining: 0,
};

function isTeamClient(forTeam: boolean) {
  return forTeam
    ? { get: teamGet, post: teamPost }
    : { get, post };
}

export async function getTwoFaStatus(forTeam = false): Promise<TwoFaStatus> {
  try {
    const client = isTeamClient(forTeam);
    const response = await client.get<TwoFaStatus>("/2fa/status");
    return response.data;
  } catch (error) {
    if (getApiErrorCode(error) === "2FA_NOT_AVAILABLE") {
      return UNAVAILABLE_STATUS;
    }
    throw error;
  }
}

export async function startTwoFaSetup(
  forTeam: boolean,
  payload?: { code2fa: string; verificationCode: string },
): Promise<TwoFaSetupResponse> {
  const client = isTeamClient(forTeam);
  const response = await client.post<TwoFaSetupResponse>(
    "/2fa/setup",
    payload ?? {},
  );
  return response.data;
}

export async function confirmTwoFaSetup(
  forTeam: boolean,
  payload: { code: string; verificationCode: string },
): Promise<TwoFaConfirmResponse> {
  const client = isTeamClient(forTeam);
  const response = await client.post<TwoFaConfirmResponse>(
    "/2fa/setup/confirm",
    payload,
  );
  return response.data;
}

export async function disableTwoFa(
  forTeam: boolean,
  payload: { code2fa: string; verificationCode: string },
): Promise<TwoFaStatus> {
  const client = isTeamClient(forTeam);
  const response = await client.post<TwoFaStatus>("/2fa/disable", payload);
  return response.data;
}

export async function enableTwoFa(
  forTeam: boolean,
  payload: { code2fa: string; verificationCode: string },
): Promise<TwoFaStatus> {
  const client = isTeamClient(forTeam);
  const response = await client.post<TwoFaStatus>("/2fa/enable", payload);
  return response.data;
}

export async function replaceTwoFaBackupCodes(
  forTeam: boolean,
  payload: { code2fa: string; verificationCode: string },
): Promise<string[]> {
  const client = isTeamClient(forTeam);
  const response = await client.post<{ backupCodes: string[] }>(
    "/2fa/backup-codes",
    payload,
  );
  return response.data.backupCodes;
}

export async function resolveTwoFaSubmitError(
  error: unknown,
  resendEmail?: () => Promise<void>,
): Promise<{
  message: string;
  enrollmentRequired: boolean;
  requireCode: boolean;
}> {
  const code = getApiErrorCode(error);
  const message =
    error instanceof Error ? error.message : "Request failed. Please try again.";

  if (code === "2FA_ENROLLMENT_REQUIRED") {
    return { message, enrollmentRequired: true, requireCode: true };
  }
  if (code === "2FA_REQUIRED") {
    return { message, enrollmentRequired: false, requireCode: true };
  }
  if (code === "2FA_LOCKED") {
    return {
      message: "Too many wrong codes. Try again in 15 minutes.",
      enrollmentRequired: false,
      requireCode: true,
    };
  }
  if (code === "2FA_INVALID") {
    if (resendEmail) {
      try {
        await resendEmail();
      } catch {
        // The invalid-code message still needs to reach the user.
      }
    }
    return {
      message: `${message} A new email code has been sent.`,
      enrollmentRequired: false,
      requireCode: true,
    };
  }

  return { message, enrollmentRequired: false, requireCode: false };
}
