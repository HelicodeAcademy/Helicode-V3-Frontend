"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getWalletTransactions } from "@/lib/wallet-service";
import { Transaction } from "@/store/wallet-store";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

function SkeletonRow() {
  return (
    <TableRow className="border-b border-[#eaeaea]">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i} className="py-4 px-6">
          <div className="h-4 bg-[#f0f0f0] rounded animate-pulse w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  );
}

const statusStyles = {
  Paid: "bg-[#ECFDF3] text-[#12B76A] border border-[#CAEFDC]",
  Failed: "bg-[#FDECEC] text-[#D32828] border boder-[#F0D0D0]",
  Pending: "bg-[#FFEFE2] text-[#EE7D1F] border border-[#E5D7CB]",
};

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTototalTransactions] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (currentPage: number) => {
    try {
      setIsLoading(true);
      const response = await getWalletTransactions(currentPage, itemsPerPage);
      setTransactions(response.data);
      setTotalPages(response.meta.lastPage);
      setTototalTransactions(response.meta.total);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error fetching transaction data";
      toast.error(errorMessage);

      console.error("KYC status error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      STABLECOIN_PAYIN: "Deposit",
      STABLECOIN_PAYOUT: "Withdraw",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E4E7EC] rounded-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eaeaea] flex items-center gap-4">
          <span className="font-medium text-sm text-[#101928]">
            Recent transactions
          </span>

          {totalTransactions > 0 && (
            <span className="text-[#0166f4] text-sm hidden">
              ({totalTransactions} total)
            </span>
          )}
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f9fafb] hover:bg-[#f9fafb]">
              <TableHead className="text-[#344054] font-medium text-xs px-6 py-4">
                Type
              </TableHead>
              <TableHead className="text-[#344054] font-medium text-xs">
                Amount
              </TableHead>
              <TableHead className="text-[#344054] font-medium text-xs">
                Date
              </TableHead>
              <TableHead className="text-[#344054] font-medium text-xs">
                Method
              </TableHead>
              <TableHead className="text-[#344054] font-medium text-xs">
                Currency
              </TableHead>
              <TableHead className="text-[#344054] font-medium text-xs">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-[#667085]"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.transactionId}
                  className="hover:bg-gray-50 text-sm"
                >
                  <TableCell className="text-[#101828] font-medium px-6 py-4">
                    {getTransactionType(transaction.type)}
                  </TableCell>
                  <TableCell className="text-[#101828] font-medium">
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-[#101828] font-medium">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="text-[#101828] font-medium">
                    {transaction.category}
                  </TableCell>
                  <TableCell className="text-[#101828] font-medium">
                    {transaction.currency}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[transaction.status as keyof typeof statusStyles]} font-medium`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#667085]">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#d1d5db]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="border-[#d1d5db]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
