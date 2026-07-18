import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { TeamTransactionData } from "@/lib/team/team-transaction-service";

interface PaymentHistoryProps {
  payments?: TeamTransactionData[];
}

export default function PaymentHistory({ payments = [] }: PaymentHistoryProps) {
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC]";
      case "pending":
        return "bg-[#FDF4EC] text-[#DB8F3F] border border-[#FFD3A5]";
      case "failed":
        return "bg-[#FFEFEF] text-[#CC4646] border border-[#EEC5C5]";
      case "processing":
        return "bg-[#E9F0FF] text-[#0052FF] border border-[#BED3FF]";
      default:
        return "bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC]";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(parsedDate);
  };

  return (
    <div className="rounded-2xl border border-[#F2F2F2] bg-white p-4 sm:p-6">
      <h2 className="p-2 text-[14px] font-semibold text-[#101928] sm:p-4">
        Payment historys
      </h2>

      <div className="space-y-3 md:hidden">
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E4E7EC] bg-[#F9FAFB] px-4 py-8 text-center text-sm text-[#667085]">
            No recent transactions
          </div>
        ) : (
          payments.map((payment, idx) => (
            <div
              key={`${payment.payrollDate}-${payment.amount}-${idx}`}
              className="rounded-xl border border-[#E4E7EC] bg-[#FCFCFD] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-[#101928]">
                    {formatAmount(payment.amount)}
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    {formatDate(payment.payrollDate)}
                  </p>
                </div>
                <span
                  className={`${getStatusClasses(payment.status)} rounded-full px-2 py-1 text-xs font-medium capitalize`}
                >
                  {payment.status === "crypto confirmed"
                    ? "Success"
                    : payment.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#667085]">Currency</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[#101928]">
                      {payment.currency === "USDC" ? "USD" : payment.currency}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[#667085]">Type</p>
                  <p className="mt-1 text-[#101928] capitalize">
                    {payment.direction}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table className="w-full min-w-180">
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="border-b border-[#E4E7EC] hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#344054]">
                Date
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#344054]">
                Amount
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#344054]">
                Currency
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#344054]">
                Type
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-medium uppercase text-[#344054]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow className="border-b border-[#E4E7EC] hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="p-6 text-center text-sm text-[#667085]"
                >
                  No recent transactions
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment, idx) => (
                <TableRow
                  key={`${payment.payrollDate}-${payment.amount}-${idx}`}
                  className="border-b border-[#E4E7EC] last:border-b-0 hover:bg-[#F9FAFB]"
                >
                  <TableCell className="px-6 py-5 text-sm text-[#101928]">
                    {formatDate(payment.payrollDate)}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm font-bold text-[#101928]">
                    {formatAmount(payment.amount)}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-row items-center space-x-1">
                      <span className="text-sm text-[#101928]">
                        {payment.currency === "USDC" ? "USD" : payment.currency}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-[#101928] capitalize">
                    {payment.direction}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <span
                      className={`${getStatusClasses(payment.status)} rounded-full px-2 py-1 text-sm font-medium capitalize`}
                    >
                      {payment.status === "crypto confirmed"
                        ? "Success"
                        : payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
