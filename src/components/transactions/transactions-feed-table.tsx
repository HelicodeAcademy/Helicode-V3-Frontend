"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type {
  CompanyFeedTransaction,
  PeopleFeedTransaction,
  TransactionsFeedPagination,
  TransactionsFeedView,
} from "@/lib/transactions-feed-service";

interface TransactionsFeedTableProps {
  view: TransactionsFeedView;
  companyTransactions: CompanyFeedTransaction[];
  peopleTransactions: PeopleFeedTransaction[];
  pagination: TransactionsFeedPagination | null;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

const statusStyles: Record<string, string> = {
  Success:
    "bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC] text-xs font-semibold",
  Paid: "bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC] text-xs font-semibold",
  Pending:
    "bg-[#FFEFE2] text-[#EE7D1F] border border-[#E5D7CB] text-xs font-semibold",
  Failed:
    "bg-[#FDECEC] text-[#D32828] border border-[#F0D0D0] text-xs font-semibold",
};

function formatCompanyAmount(
  amount: string,
  type: CompanyFeedTransaction["type"],
) {
  const value = Number.parseFloat(amount);
  const formatted = Number.isNaN(value)
    ? amount
    : value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  if (type === "Received") {
    return `+$${formatted}`;
  }

  return `$${formatted}`;
}

function formatPeopleAmount(amount: string) {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) {
    return amount;
  }

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function CurrencyCell({ currency }: { currency: string }) {
  const showUsdFlag = currency === "USD" || currency === "USDC";

  return (
    <div className="flex items-center gap-2">
      {showUsdFlag && (
        <Image
          src="/home/usa.svg"
          alt=""
          width={16}
          height={16}
          className="h-4 w-4"
        />
      )}
      <span>{currency === "USDC" ? "USD" : currency}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {(status === "Success" || status === "Paid") && (
        <Image src="/transaction/check.png" alt="" width={16} height={16} />
      )}
      {status}
    </span>
  );
}

function TypeCell({ type }: { type: CompanyFeedTransaction["type"] }) {
  const isReceived = type === "Received";

  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full`}>
        {isReceived ? (
          <Image
            src="/transaction/received.png"
            alt=""
            width={24}
            height={24}
          />
        ) : (
          <Image src="/transaction/sent.png" alt="" width={24} height={24} />
        )}
      </span>
      <span className="text-sm font-medium text-[#101928]">{type}</span>
    </div>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="border-b border-[#E4E7EC]">
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <TableCell key={cellIndex} className="px-6 py-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#F2F4F7]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TransactionsFeedTable({
  view,
  companyTransactions,
  peopleTransactions,
  pagination,
  isLoading,
  onPageChange,
}: TransactionsFeedTableProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPrevious = pagination?.hasPrevious ?? currentPage > 1;
  const hasNext = pagination?.hasNext ?? currentPage < totalPages;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E4E7EC] bg-[#ECEFF4] hover:bg-[#F9FAFB]">
              {view === "company" ? (
                <>
                  <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#667085]">
                    Type
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Amount
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Currency
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Payment Method
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Status
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Date
                  </TableHead>
                </>
              ) : (
                <>
                  <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#667085]">
                    Name
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Role
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Worker type
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Amount
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Status
                  </TableHead>
                  <TableHead className="py-4 text-xs font-medium uppercase text-[#667085]">
                    Date
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <SkeletonRows columns={6} />
            ) : view === "company" ? (
              companyTransactions.length === 0 ? (
                <TableRow className="border-b border-[#E4E7EC]">
                  <TableCell
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-medium text-[#667085]"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                companyTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-b border-[#E4E7EC] hover:bg-[#F9FAFB]"
                  >
                    <TableCell className="px-6 py-5">
                      <TypeCell type={transaction.type} />
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#101928]">
                      {formatCompanyAmount(
                        transaction.amount,
                        transaction.type,
                      )}
                    </TableCell>
                    <TableCell>
                      <CurrencyCell currency={transaction.currency} />
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#101928]">
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#101928]">
                      {transaction.dateDisplay}
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : peopleTransactions.length === 0 ? (
              <TableRow className="border-b border-[#E4E7EC]">
                <TableCell
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm font-medium text-[#667085]"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              peopleTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="border-b border-[#E4E7EC] hover:bg-[#F9FAFB]"
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 text-base font-bold text-[#8F3E19]">
                        <AvatarFallback className="bg-[#FFED94]">
                          {transaction.initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-[#101928]">
                        {transaction.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#101928]">
                    {transaction.role}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#101928]">
                    {transaction.workerType}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#101928]">
                    {formatPeopleAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#101928]">
                    {transaction.dateDisplay}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-[#344054]">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious || isLoading}
            className="border-[#D0D5DD]"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext || isLoading}
            className="border-[#D0D5DD]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
