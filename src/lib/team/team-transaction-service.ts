import { teamGet } from '../api-client';

interface TeamTransaction {
  status: boolean;
  statusCode: number;
  message: string;
  data: TeamTransactionData[];
}

export interface TeamTransactionData {
  payrollDate: string;
  amount: number;
  currency: string;
  status: string;
  frequency: string;
}

export async function getTeamTransactions(): Promise<TeamTransaction> {
  const response = await teamGet<TeamTransaction>(`/team/transactions`);
  return response.data;
}
