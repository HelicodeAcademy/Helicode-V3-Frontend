import { teamPost } from "../api-client";

export type TransactionVerificationSubject =
  | "COMPANY_WITHDRAWAL_CRYPTO"
  | "COMPANY_PAY_NOW_GROUP"
  | "COMPANY_PAY_NOW_MEMBER"
  | "COMPANY_PAY_NOW_ALL"
  | "TEAM_WITHDRAWAL_CRYPTO"
  | "TEAM_WITHDRAWAL_FIAT";

export interface TransactionVerificationResponse {
  message: string;
  expiresIn: number;
}

export async function requestTeamTransactionVerificationCode(
  subject: TransactionVerificationSubject,
): Promise<TransactionVerificationResponse> {
  const response = await teamPost<TransactionVerificationResponse>(
    "/auth/transaction-verification-code",
    { subject },
  );
  return response.data;
}
