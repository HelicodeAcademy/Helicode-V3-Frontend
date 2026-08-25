import { get } from "./api-client";

export type TransactionsFeedView = "company" | "people";

export type TransactionsFeedStatusFilter =
  | "success"
  | "paid"
  | "pending"
  | "failed";

export interface TransactionsFeedSummary {
  payIn: {
    totalAmount: string;
    transactionCount: number;
  };
  payOut: {
    totalAmount: string;
    transactionCount: number;
  };
  currency: string;
}

export interface CompanyFeedTransaction {
  id: string;
  type: "Received" | "Sent";
  amount: string;
  currency: string;
  paymentMethod: string;
  status: "Success" | "Pending" | "Failed";
  date: string;
  dateDisplay: string;
}

export interface PeopleFeedTransaction {
  id: string;
  name: string;
  initials: string;
  role: string;
  workerType: string;
  amount: string;
  currency: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
  dateDisplay: string;
}

export interface TransactionsFeedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface TransactionsFeedResponse {
  view: TransactionsFeedView;
  summary: TransactionsFeedSummary;
  transactions: CompanyFeedTransaction[] | PeopleFeedTransaction[];
  pagination: TransactionsFeedPagination;
}

export interface GetTransactionsFeedParams {
  view?: TransactionsFeedView;
  search?: string;
  status?: TransactionsFeedStatusFilter;
  workerType?: "employee" | "contractor";
  page?: number;
  limit?: number;
}

export async function getTransactionsFeed(
  params: GetTransactionsFeedParams = {},
): Promise<TransactionsFeedResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("view", params.view ?? "company");
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.workerType) {
    searchParams.set("workerType", params.workerType);
  }

  const response = await get<TransactionsFeedResponse>(
    `/wallet/transactions/feed?${searchParams.toString()}`,
  );

  return response.data;
}
