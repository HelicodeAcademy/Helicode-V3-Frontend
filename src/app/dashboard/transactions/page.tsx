'use client';

import {
  useContext,
  useEffect,
  useState,
  useMemo,
  useEffectEvent,
} from 'react';
import { PageTitleContext } from '../layout';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { TransactionsFilters } from '@/components/transactions/transactions-filters';
import toast from 'react-hot-toast';
import {
  getCompanyTransactions,
  TransactionData,
} from '@/lib/transaction-service';

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { setTitle } = useContext(PageTitleContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [workerType, setWorkerType] = useState('');
  const [status, setStatus] = useState('');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const handleSearchChange = (term: string) => {
    setCurrentPage(1);
    setSearchTerm(term);
  };

  const handleWorkerTypeChange = (type: string) => {
    setCurrentPage(1);
    setWorkerType(type);
  };

  const handleStatusChange = (nextStatus: string) => {
    setCurrentPage(1);
    setStatus(nextStatus);
  };

  const fetchCompanyTransactions = useEffectEvent(async () => {
    try {
      const transactions = await getCompanyTransactions();
      setTransactions(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch transactions';
      toast.error(errorMessage);
      console.error('Company transactions fetch error:', error);
    }
  });

  useEffect(() => {
    setTitle('Transactions');
    fetchCompanyTransactions();
  }, [setTitle]);

  const filteredTransactions = useMemo(() => {
    let filtered = Array.isArray(transactions) ? transactions : [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const hasWorkerTypeFilter = workerType !== '' && workerType !== 'all';
    const hasStatusFilter = status !== '' && status !== 'all';

    if (normalizedSearch) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(normalizedSearch) ||
          t.role.toLowerCase().includes(normalizedSearch)
      );
    }

    if (hasWorkerTypeFilter) {
      filtered = filtered.filter(
        (t) => t.workerType.toLowerCase() === workerType.toLowerCase()
      );
    }

    if (hasStatusFilter) {
      filtered = filtered.filter(
        (t) => t.status.toLowerCase() === status.toLowerCase()
      );
    }

    return filtered;
  }, [transactions, searchTerm, workerType, status]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  return (
    <div className="space-y-6 border border-[#E4E7EC] rounded-lg bg-white mx-8 my-6 py-5">
      <TransactionsFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        workerType={workerType}
        onWorkerTypeChange={handleWorkerTypeChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <TransactionsTable
        transactions={displayedTransactions}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
