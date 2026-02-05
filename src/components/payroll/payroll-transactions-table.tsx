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
import { MoreVertical } from "lucide-react";

const transactions = [
  {
    id: 1,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Contractor",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Paid",
  },
  {
    id: 2,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Contractor",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Failed",
  },
  {
    id: 3,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Employee",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Pending",
  },
  {
    id: 4,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Contractor",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Paid",
  },
  {
    id: 5,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Contractor",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Paid",
  },
  {
    id: 6,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Employee",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Paid",
  },
  {
    id: 7,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Contractor",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Pending",
  },
  {
    id: 8,
    name: "Vandross Idiake",
    role: "Backend Engineer",
    workerType: "Contractor",
    amount: "$3,400.00",
    date: "Dec 4th 2025",
    status: "Failed",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-[#ECFDF3] text-[#12B76A]";
    case "Failed":
      return "bg-[#FDECEC] text-[#D32828]";
    case "Pending":
      return "bg-[#FFEFE2] text-[#EE7D1F]";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function PayrollTransactionsTable() {
  return (
    <div className="rounded-lg border border-[#eaeaea] bg-white overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E4E7EC]">
        <h3 className="text-sm font-medium text-[#101928] space-x-4">
          <span>Recent transactions</span>
          <span className="text-xs font-medium bg-[#E9F0FF] text-[#0052FF] py-0.5 px-2 rounded-lg">
            8 Members
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="border-b border-[#E4E7EC]">
              <TableHead className="text-xs font-semibold text-[#344054] py-4 px-6">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#344054]">
                Role
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#344054]">
                Worker type
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#344054]">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#344054]">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-[#344054]">
                Status
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="border-b border-[#E4E7EC] hover:bg-[#f9fafb]"
              >
                <TableCell className="p-6 text-sm font-medium text-[#101928]">
                  {tx.name}
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  {tx.role}
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  {tx.workerType}
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  {tx.amount}
                </TableCell>
                <TableCell className="text-sm font-medium text-[#101928]">
                  {tx.date}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-xs font-medium ${getStatusColor(tx.status)} border-0 py-1 px-2`}
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <button className="text-[#344054] hover:text-[#101828]">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
