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

export async function requestTeamLoginVerificationCode(email: string) {
  const response = await teamPost("/team/login/verification-code", {
    email,
  });
  return response.data;
}

// Accept talent invite
// Sends otp, email to the endpoint
// completes account setup for invited team
export async function acceptTeamInvite(
  data: AcceptInviteData,
): Promise<AcceptInviteResponse> {
  const response = await teamPost<AcceptInviteResponse>(
    "/teams/accept-invite",
    {
      otp: data.otp,
      email: data.email,
    },
  );
  return response.data;
}

// team login
// Authenticates user with email
// Returns access and refresh tokens
export async function teamLogin(
  email: string,
  code: string,
): Promise<TeamLoginResponse> {
  const response = await teamPost<TeamLoginResponse>("/team/login", {
    email,
    code,
  });

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
