import { post } from "../api-client";
import {
  AcceptInviteData,
  AcceptInviteResponse,
  TalentLoginResponse,
} from "@/store/talent/talent-auth-store";

// Accept takent invite
// Sents otp, email and password to the endpoint
// ccompletes account setup for invited talent
export async function acceptTalentInvite(
  data: AcceptInviteData,
): Promise<AcceptInviteResponse> {
  const response = await post<AcceptInviteResponse>("/teams/accept-invite", {
    otp: data.otp,
    email: data.email,
    password: data.password,
  });
  return response.data;
}

// Talent login
// Authenticates user with email and password
// Returns access and refresh tokens
export async function login(
  email: string,
  password: string,
): Promise<TalentLoginResponse> {
  const response = await post<TalentLoginResponse>("/teams/login", {
    email,
    password,
  });

  return response.data;
}
