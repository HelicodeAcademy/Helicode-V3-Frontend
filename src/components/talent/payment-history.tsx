import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

export default function PaymentHistory() {
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC]';
      case 'pending':
        return 'bg-[#FDF4EC] text-[#DB8F3F] border border-[#FFD3A5]';
      case 'failed':
        return 'bg-[#FFEFEF] text-[#CC4646] border border-[#EEC5C5]';
      case 'processing':
        return 'bg-[#E9F0FF] text-[#0052FF] border border-[#BED3FF]';
      default:
        return 'bg-[#ECFDF3] text-[#4D8F72] border border-[#CAEFDC]';
    }
  };

  const recentPayments = [
    {
      payrollFrequency: 'Monthly',
      currency: 'USDC',
      status: 'Paid',
      amount: '$3,400.00',
      date: '19 May 07:23 AM',
    },
    {
      payrollFrequency: 'Weekly',
      currency: 'USDC',
      status: 'Pending',
      amount: '$1,200.00',
      date: '18 May 02:15 PM',
    },
    {
      payrollFrequency: 'Monthly',
      currency: 'USDC',
      status: 'Paid',
      amount: '$3,400.00',
      date: '19 May 07:23 AM',
    },
    {
      payrollFrequency: 'Bi-weekly',
      currency: 'USDC',
      status: 'Failed',
      amount: '$2,500.00',
      date: '17 May 11:45 AM',
    },
    {
      payrollFrequency: 'Monthly',
      currency: 'USDC',
      status: 'Processing',
      amount: '$3,400.00',
      date: '19 May 07:23 AM',
    },
    {
      payrollFrequency: 'Monthly',
      currency: 'USDC',
      status: 'Paid',
      amount: '$3,400.00',
      date: '19 May 07:23 AM',
    },
  ];
  return (
    <div className="bg-white border border-[#F2F2F2] p-6 rounded-2xl">
      <h2 className="text-[#101928] text-[14px] p-4 font-semibold">
        Payment history
      </h2>
      <Table className="w-full">
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="border-b border-[#E4E7EC] hover:bg-transparent">
            <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
              Date
            </TableHead>
            <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
              Amount
            </TableHead>
            <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
              Currency
            </TableHead>
            <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
              Status
            </TableHead>
            <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
              Payroll Frequency
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentPayments.map((payment, idx) => (
            <TableRow
              key={idx}
              className="border-b border-[#E4E7EC] last:border-b-0 hover:bg-[#F9FAFB]"
            >
              <TableCell className="px-6 py-5 text-sm text-[#101928]">
                {payment.date}
              </TableCell>
              <TableCell className="px-6 py-5 text-sm font-bold text-[#101928]">
                {payment.amount}
              </TableCell>
              <TableCell className="px-6 py-5">
                <div className="flex flex-row items-center space-x-1">
                  <Image
                    src="/wallet/usdc.svg"
                    alt="USDC"
                    width={16}
                    height={16}
                  />
                  <span className="text-sm text-[#101928]">
                    {payment.currency}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-5">
                <span
                  className={`${getStatusClasses(payment.status)} px-2 py-1 rounded-full font-medium text-sm`}
                >
                  {payment.status}
                </span>
              </TableCell>
              <TableCell className="px-6 py-5 text-sm text-[#101928]">
                {payment.payrollFrequency}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
