import { post } from "./api-client";
import {
  SignupData,
  SignupResponse,
  VerifyEmailResponse,
  LoginResponse,
  useAuthStore,
} from "../store/auth-store";
import { useTeamAuthStore } from "../store/team/team-auth-store";

const BASE_URL = "https://helicode-backend.onrender.com";

// Sign up a new company user
// Sends user details to /auth/signup endpoint and returns the API response
// returns userId and companyId to be used for further onboarding steps

export async function signupCompany(data: SignupData): Promise<SignupResponse> {
  const response = await post<SignupResponse>("/auth/signup", {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    companyName: data.companyName,
    teamSize: data.teamSize,
    country: data.country,
    product: data.product || "PAYROLL",
  });
  return response.data;
}

// Verify email using OTP code
// Sends the 6 digit code and userID to verify the user's email address
export async function verifyEmail(
  code: string,
  userId: string,
): Promise<VerifyEmailResponse> {
  const response = await post<VerifyEmailResponse>("/auth/verify-email", {
    code,
    userId,
  });
  return response.data;
}

// Resend OTP code for email verification
// If user did not receive the OTP code, this function can be called to resend it
export async function resendVerificationCode(
  email: string,
  type: "SIGNUP" | "RECOVERY" = "RECOVERY",
): Promise<{ userId: string; token: string }> {
  const response = await post<{ userId: string; token: string }>(
    "/auth/resend-code",
    { email, type },
  );
  return response.data;
}

// Login using email and password, returns refresh and access tokens and the user data
// Access token expires in 30 minutes, refresh token used to get new access token

export async function signin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await post<LoginResponse>("/auth/signin", {
    email,
    password,
  });

  return response.data;
}

// Refresh access token using refresh token
// This will be called when the access token is about to expire and it returns the new access token and refresh token
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { refreshToken, companyId } = useAuthStore.getState();

  if (!refreshToken) throw new Error("No refresh token found");
  if (!companyId) throw new Error("No company ID found");

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
      "x-company-id": companyId,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Token refresh failed");
  }

  return data.data;
}

// Refresh team access token using refresh token
// This will be called when the team access token is about to expire and it returns the new access token and refresh token
export async function refreshTeamAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { refreshToken, companyId } = useTeamAuthStore.getState();

  if (!refreshToken) throw new Error("No team refresh token found");
  if (!companyId) throw new Error("No team company ID found");

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
      "x-company-id": companyId,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Team token refresh failed");
  }

  return data.data;
}
//  Sends email and new password to backend
//  Backend sends verification code to user's email
//  Returns userId and token for verification step
//
export async function forgotPassword(
  email: string,
  newPassword: string,
): Promise<{ userId: string; token: string }> {
  const response = await post<{ userId: string; token: string }>(
    "/auth/password/forgot",
    {
      email,
      newPass: newPassword,
    },
  );

  return response.data;
}

//  Confirm password reset with verification code
//  Called after user enters the code from their email
//  Updates the password on the backend

export async function confirmPasswordReset(
  userId: string,
  code: string,
): Promise<void> {
  await post("/auth/password/confirm-reset", {
    userId,
    code,
  });
}

// Change user password
// Requires current password and new password
// Used in settings to update password
export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await post("/auth/password/change", {
    oldPassword,
    newPassword,
  });
}

//company details

