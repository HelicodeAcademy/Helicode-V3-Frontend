"use client";

import { useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../layout";
import { TransactionsSummaryCards } from "@/components/transactions/transactions-summary-cards";
import { TransactionsFeedFilters } from "@/components/transactions/transactions-feed-filters";
import { TransactionsFeedTable } from "@/components/transactions/transactions-feed-table";
import { useDebounce } from "@/hooks/use-debounce";
import toast from "react-hot-toast";
import {
  getTransactionsFeed,
  type CompanyFeedTransaction,
  type PeopleFeedTransaction,
  type TransactionsFeedPagination,
  type TransactionsFeedStatusFilter,
  type TransactionsFeedSummary,
  type TransactionsFeedView,
} from "@/lib/transactions-feed-service";

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { setTitle } = useContext(PageTitleContext);
  const [view, setView] = useState<TransactionsFeedView>("company");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("all");
  const [workerType, setWorkerType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<TransactionsFeedSummary | null>(null);
  const [companyTransactions, setCompanyTransactions] = useState<
    CompanyFeedTransaction[]
  >([]);
  const [peopleTransactions, setPeopleTransactions] = useState<
    PeopleFeedTransaction[]
  >([]);
  const [pagination, setPagination] =
    useState<TransactionsFeedPagination | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setTitle("Transactions");
  }, [setTitle]);

  useEffect(() => {
    setCurrentPage(1);
  }, [view, debouncedSearch, status, workerType]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);

        const statusParam =
          status === "all" ? undefined : (status as TransactionsFeedStatusFilter);

        const workerTypeParam =
          view === "people" && workerType !== "all"
            ? (workerType as "employee" | "contractor")
            : undefined;

        const data = await getTransactionsFeed({
          view,
          search: debouncedSearch,
          status: statusParam,
          workerType: workerTypeParam,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        setSummary(data.summary);
        setPagination(data.pagination);

        if (data.view === "company") {
          setCompanyTransactions(data.transactions as CompanyFeedTransaction[]);
          setPeopleTransactions([]);
        } else {
          setPeopleTransactions(data.transactions as PeopleFeedTransaction[]);
          setCompanyTransactions([]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions";
        toast.error(errorMessage);
        console.error("Transactions feed fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchFeed();
  }, [view, debouncedSearch, status, workerType, currentPage]);

  const handleViewChange = (nextView: TransactionsFeedView) => {
    setView(nextView);
    setStatus("all");
    if (nextView === "company") {
      setWorkerType("all");
    }
  };

  return (
    <div className="mx-8 my-6 space-y-6 rounded-lg border border-[#E4E7EC] bg-white p-6">
      <TransactionsSummaryCards summary={summary} isLoading={isLoading} />

      <TransactionsFeedFilters
        view={view}
        onViewChange={handleViewChange}
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
        workerType={workerType}
        onWorkerTypeChange={setWorkerType}
      />

      <TransactionsFeedTable
        view={view}
        companyTransactions={companyTransactions}
        peopleTransactions={peopleTransactions}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
