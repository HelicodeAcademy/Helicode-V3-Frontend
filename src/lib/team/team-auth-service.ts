import { teamGet, teamPost } from "../api-client";
import {
  AcceptInviteData,
  AcceptInviteResponse,
  TeamLoginResponse,
  TeamMeResponse,
} from "@/store/team/team-auth-store";

// ── Offramp profile types
export interface OfframpKyc {
  id: string;
  membershipId: string;
  customerUID: string;
  country: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  idType: string;
  idNumber: string;
  additionalIdType: string;
  additionalIdNumber: string;
  tier: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfframpBank {
  id: string;
  membershipId: string;
  country: string;
  currencyCode: string;
  channelId: string;
  networkId: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfframpProfile {
  teamId: string;
  email: string;
  kyc: OfframpKyc;
  bank: OfframpBank;
}

// Accept talent invite
// Sends otp, email and password to the endpoint
// completes account setup for invited team
export async function acceptTeamInvite(
  data: AcceptInviteData,
): Promise<AcceptInviteResponse> {
  const response = await teamPost<AcceptInviteResponse>(
    "/teams/accept-invite",
    {
      otp: data.otp,
      email: data.email,
      password: data.password,
    },
  );
  return response.data;
}

// team login
// Authenticates user with email and password
export async function teamLogin(
  email: string,
  password: string,
): Promise<{
  authFlowToken: string;
  requiresVerification: boolean;
  expiresInMinutes: number;
  message: string;
}> {
  const response = await teamPost<{
    authFlowToken: string;
    requiresVerification: boolean;
    expiresInMinutes: number;
    message: string;
  }>("/team/login", {
    email,
    password,
  });

  return response.data;
}

// Verify team login code
// Takes the 6-digits code and authFlowToken to complete login
// Returns access and refresh tokens
export async function verifyTeamLoginCode(
  code: string,
  authFlowToken: string,
): Promise<TeamLoginResponse> {
  const response = await teamPost<TeamLoginResponse>(
    "/team/login/verify",
    {
      code,
    },
    {
      "x-auth-flow-token": authFlowToken,
    },
  );

  return response.data;
}

/**
 * Resend team login verification code
 * Called when OTP expires or user requests new code
 * Returns new authFlowToken with fresh expiration
 */
export async function resendTeamLoginCode(
  authFlowToken: string,
): Promise<{
  authFlowToken: string;
  expiresInMinutes: number;
  message: string;
}> {
  const response = await teamPost<{
    authFlowToken: string;
    expiresInMinutes: number;
    message: string;
  }>(
    "/team/login/resend-code",
    {},
    {
      "x-auth-flow-token": authFlowToken,
    },
  );

  return response.data;
}

//  Accept team invite for existing team members joining another company
//  sends OTP and email to /teams/accept-invite endpoint (no password required)
//  Completes company invitation for existing team members

export async function acceptTeamInviteExisting(data: {
  otp: string;
  email: string;
}): Promise<AcceptInviteResponse> {
  const response = await teamPost<AcceptInviteResponse>(
    "/teams/accept-invite",
    {
      otp: data.otp,
      email: data.email,
    },
  );

  return response.data;
}

export async function getTeamMe(): Promise<TeamMeResponse> {
  const response = await teamGet<TeamMeResponse>("/team/me");
  return response.data;
}

export async function changeTeamPassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await teamPost<void>("/team/password/change", {
    oldPassword,
    newPassword,
  });
}

export async function getOfframpProfile(): Promise<OfframpProfile> {
  const response = await teamGet<OfframpProfile>("/team/offramp/profile");
  return response.data;
}
