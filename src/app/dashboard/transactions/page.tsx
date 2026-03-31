'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import { PageTitleContext } from '../layout';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { TransactionsFilters } from '@/components/transactions/transactions-filters';
import toast from 'react-hot-toast';
import {
  getCompanyTransactions,
  TransactionData,
} from '@/lib/transaction-service';

// Mock data for transactions
// const mockTransactions: TransactionData[] = Array.from(
//   { length: 50 },
//   (_, i) => ({
//     id: `trans-${i + 1}`,
//     name: 'Vandross Idiake',
//     role: 'Backend Engineer',
//     workerType: i % 2 === 0 ? 'Contractor' : 'Employee',
//     amount: 3400.0,
//     date: 'Dec 4th 2025',
//     status: ['Paid', 'Failed', 'Pending'][i % 3] as
//       | 'Paid'
//       | 'Failed'
//       | 'Pending',
//   })
// );

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { setTitle } = useContext(PageTitleContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [workerType, setWorkerType] = useState('');
  const [status, setStatus] = useState('');
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  useEffect(() => {
    setTitle('Transactions');
    // eslint-disable-next-line react-hooks/immutability
    fetchCompanyTransactions();
  }, [setTitle]);

  const fetchCompanyTransactions = async () => {
    try {
      const transactions = await getCompanyTransactions();
      setTransactions(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch transactions';
      toast.error(errorMessage);
      console.error('Company transactions fetch error:', error);
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = Array.isArray(transactions) ? transactions : [];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (workerType) {
      filtered = filtered.filter(
        (t) => t.workerType.toLowerCase() === workerType.toLowerCase()
      );
    }

    if (status) {
      filtered = filtered.filter(
        (t) => t.status.toLowerCase() === status.toLowerCase()
      );
    }

    return filtered;
  }, [transactions, searchTerm, workerType, status]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  return (
    <div className="space-y-6 border border-[#E4E7EC] rounded-lg bg-white mx-8 my-6 py-5">
      <TransactionsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        workerType={workerType}
        onWorkerTypeChange={setWorkerType}
        status={status}
        onStatusChange={setStatus}
      />

      <TransactionsTable
        transactions={displayedTransactions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
