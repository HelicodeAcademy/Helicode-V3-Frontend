"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical } from "lucide-react";

export interface Transaction {
  id: string;
  type: "Deposit" | "Withdraw";
  amount: string;
  date: string;
  status: "Paid" | "Failed" | "Pending";
}

interface TransactionsTableProps {
  transactions: Transaction[];
  membersCount?: number;
}

const statusStyles = {
  Paid: "bg-[#ECFDF3] text-[#12B76A]",
  Failed: "bg-[#FDECEC] text-[#D32828]",
  Pending: "bg-[#FFEFE2] text-[#EE7D1F]",
};

export function TransactionsTable({
  transactions,
  membersCount,
}: TransactionsTableProps) {
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-2xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#eaeaea] flex items-center gap-4">
        <span className="font-medium text-sm text-[#101928]">
          Recent transactions
        </span>
        {membersCount && (
          <span className="text-[#0166f4] text-sm hidden">
            {membersCount} Members
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
              Status
            </TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50 text-sm">
              <TableCell className="text-[#101828] font-medium px-6 py-4">
                {transaction.type}
              </TableCell>
              <TableCell className="text-[#101828] font-medium ">
                {transaction.amount}
              </TableCell>
              <TableCell className="text-[#101828] font-medium">
                {transaction.date}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[transaction.status]} font-medium`}
                >
                  {transaction.status}
                </span>
              </TableCell>
              <TableCell>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="h-4 w-4 text-[#667085]" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
