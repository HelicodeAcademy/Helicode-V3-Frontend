import { post } from "./api-client";
import {
  SignupData,
  SignupResponse,
  VerifyEmailResponse,
  LoginResponse,
} from "../store/auth-store";

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
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await post<LoginResponse>("/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

//  Initiate password recovery
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
