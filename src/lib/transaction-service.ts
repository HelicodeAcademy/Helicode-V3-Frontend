import { get } from './api-client';

export interface TransactionData {
  id: string;
  name: string;
  role: string;
  workerType: 'Contractor' | 'Employee';
  amount: number;
  date: string;
  status: 'Paid' | 'Failed' | 'Pending';
}

interface RawTransactionData {
  id: string;
  name?: string;
  teamName?: string;
  role?: string;
  workerType?: string;
  amount?: number;
  date?: string;
  time?: string;
  status?: string;
}

type CompanyTransactionsPayload =
  | RawTransactionData[]
  | {
      transactions?: RawTransactionData[];
      payrollTransactions?: RawTransactionData[];
      items?: RawTransactionData[];
    };

function formatTransactionDate(value?: string): string {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function normalizeWorkerType(
  workerType?: string
): TransactionData['workerType'] {
  return workerType?.toLowerCase() === 'employee' ? 'Employee' : 'Contractor';
}

function normalizeStatus(status?: string): TransactionData['status'] {
  switch (status?.toLowerCase()) {
    case 'failed':
      return 'Failed';
    case 'pending':
      return 'Pending';
    default:
      return 'Paid';
  }
}

function normalizeTransaction(
  transaction: RawTransactionData
): TransactionData {
  return {
    id: transaction.id,
    name: transaction.name ?? transaction.teamName ?? 'Unknown',
    role: transaction.role ?? 'N/A',
    workerType: normalizeWorkerType(transaction.workerType),
    amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
    date: formatTransactionDate(transaction.date ?? transaction.time),
    status: normalizeStatus(transaction.status),
  };
}

function normalizeTransactions(
  payload: CompanyTransactionsPayload
): TransactionData[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeTransaction);
  }

  if (Array.isArray(payload?.transactions)) {
    return payload.transactions.map(normalizeTransaction);
  }

  if (Array.isArray(payload?.payrollTransactions)) {
    return payload.payrollTransactions.map(normalizeTransaction);
  }

  if (Array.isArray(payload?.items)) {
    return payload.items.map(normalizeTransaction);
  }

  return [];
}

export async function getCompanyTransactions(): Promise<TransactionData[]> {
  const response = await get<CompanyTransactionsPayload>(
    `/payroll-groups/transactions`
  );
  return normalizeTransactions(response.data);
}
