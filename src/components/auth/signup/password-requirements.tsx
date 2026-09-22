"use client";

export const SIGNUP_PASSWORD_MIN_LENGTH = 10;

export const SIGNUP_PASSWORD_LENGTH_ERROR =
  "Password required to be atleast 10 characters long";

export function isSignupPasswordValid(password: string) {
  return (password?.length ?? 0) >= SIGNUP_PASSWORD_MIN_LENGTH;
}
