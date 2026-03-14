"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  name: string;
  role: string;
  workerType: "Contractor" | "Employee";
  amount: number;
  date: string;
  status: "Paid" | "Failed" | "Pending";
}

interface TransactionsTableProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const statusStyles = {
  Paid: "bg-[#ECFDF3] text-[#12B76A] border border-[#CAEFDC]",
  Failed: "bg-[#FDECEC] text-[#D32828] border boder-[#F0D0D0]",
  Pending: "bg-[#FFEFE2] text-[#EE7D1F] border border-[#E5D7CB]",
};

export function TransactionsTable({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
}: TransactionsTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-l-0 border-r-0 rounded-l-none rounded-r-none border border-[#E4E7EC] bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E4E7EC] hover:bg-transparent bg-[#F9FAFB]">
              <TableHead className="text-[#808B9E] font-medium py-4">
                Name
              </TableHead>
              <TableHead className="text-[#808B9E] font-medium py-4">
                Role
              </TableHead>
              <TableHead className="text-[#808B9E] font-medium">
                Worker type
              </TableHead>
              <TableHead className="text-[#808B9E] font-medium">
                Amount
              </TableHead>
              <TableHead className="text-[#808B9E] font-medium">Date</TableHead>
              <TableHead className="text-[#808B9E] font-medium">
                Status
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="border-b border-[#E4E7EC] hover:bg-[#f9fafb]"
              >
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 text-[#8F3E19] text-xl font-bold">
                      <AvatarFallback className="bg-[#FFED94]">
                        {transaction.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-[#101928]">
                        {transaction.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  {transaction.role}
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  {transaction.workerType}
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-sm text-[#101928] font-medium">
                  {transaction.date}
                </TableCell>
                <TableCell>
                  <Badge className={statusStyles[transaction.status]}>
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6">
        <p className="text-sm text-[#344054] font-medium">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-[#d1d5db]"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-[#d1d5db]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
