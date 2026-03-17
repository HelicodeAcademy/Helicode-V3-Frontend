import { teamPost } from "../api-client";
import {
  AcceptInviteData,
  AcceptInviteResponse,
  TeamLoginResponse,
} from "@/store/team/team-auth-store";

// Accept takent invite
// Sents otp, email and password to the endpoint
// ccompletes account setup for invited team
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
