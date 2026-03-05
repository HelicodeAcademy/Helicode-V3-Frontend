// Token management utlities for authentication

// Checks if JWT tokeni is expired
// Decodes the token and checks the exp claim against the time

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const payload = decodePayload(token);
  if (!payload?.exp) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
}

//  Get time remaining until token expiration in seconds
//  Returns negative number if token is already expired
export function getTokenTimeRemaining(token: string | null): number {
  if (!token) return 0;

  const payload = decodePayload(token);
  if (!payload?.exp) return 0;
  return payload.exp - Math.floor(Date.now() / 1000);
}

// Decode JWT token and extract payload
// Used to get user info and token details

export function decodeToken(
  token: string | null,
): Record<string, unknown> | null {
  if (!token) return null;

  return decodePayload(token);
}
