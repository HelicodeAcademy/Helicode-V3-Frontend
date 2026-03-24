import { teamGet, teamPost } from "../api-client";
import {
  AcceptInviteData,
  AcceptInviteResponse,
  TeamLoginResponse,
  TeamMeResponse,
} from "@/store/team/team-auth-store";

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
// Returns access and refresh tokens
export async function teamLogin(
  email: string,
  password: string,
): Promise<TeamLoginResponse> {
  const response = await teamPost<TeamLoginResponse>("/team/login", {
    email,
    password,
  });

  return response.data;
} 


//  Accept team invite for existing team members joining another company
//  sends OTP and email to /teams/accept-invite endpoint (no password required)
//  Completes company invitation for existing team members

export async function acceptTeamInviteExisting(data: {
  otp: string
  email: string
}): Promise<AcceptInviteResponse> {
  const response = await teamPost<AcceptInviteResponse>('/teams/accept-invite', {
    otp: data.otp,
    email: data.email,
  })

  return response.data
}

export async function getTeamMe(): Promise<TeamMeResponse> {
  const response = await teamGet<TeamMeResponse>("/team/me");
  return response.data;
}
