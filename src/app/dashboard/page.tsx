'use client';

import { useContext, useEffect } from 'react';
import { PageTitleContext } from './layout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KYCStatusCard } from '@/components/dashboard-home/kyc/kyc-status-card';
import { useWalletStore } from '@/store/wallet-store';
import { getWalletAddress } from '@/lib/wallet-service';
import { getCompanyDetails } from '@/lib/company-details';
import Link from 'next/link';
import {
  getCompanyTransactions,
  TransactionData,
} from '@/lib/transaction-service';
import toast from 'react-hot-toast';
import { getPayrollMetrics, PayrollMetrics } from '@/lib/payroll-service';

export default function DashboardHomePage() {
  const router = useRouter();
  const { setTitle } = useContext(PageTitleContext);
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState('usd');
  const [activeMetric] = useState('Last 30 days');
  const [payrollMetrics, setPayrollMetrics] = useState<PayrollMetrics | null>(
    null
  );
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const { walletData, setWalletData, setHasPin } = useWalletStore();
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionData[]
  >([]);

  useEffect(() => {
    setTitle('Home');
    fetchWalletBalance();
    fetchCompanyDetails();
    fetchRecentTransactions();
    fetchPayrollMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTitle]);

  const fetchPayrollMetrics = async () => {
    try {
      const payrollMetricsData = await getPayrollMetrics();
      setPayrollMetrics(payrollMetricsData);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch payroll metrics';
      toast.error(errorMessage);
      console.error('Failed to fetch payroll metrics', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const transactions = await getCompanyTransactions();
      setRecentTransactions(Array.isArray(transactions) ? transactions : []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch transactions';
      toast.error(errorMessage);
      console.error('Company transactions fetch error:', error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const data = await getWalletAddress();
      setWalletData(data);
    } catch (error) {
      console.error('Failed to fetch wallet balance', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const data = await getCompanyDetails();
      setHasPin(data.hasTransactionPin);
    } catch (error) {
      console.error('Failed to fetch company details', error);
    }
  };

  const balance = walletData?.balance ?? 0;
  const previewTransactions = recentTransactions.slice(0, 5);
  const metricCards = [
    {
      label: 'Total Payroll Processed',
      value: payrollMetrics?.formattedTotalPayrollProcessed ?? '$0.00',
    },
    {
      label: 'Active Employee',
      value: String(payrollMetrics?.activeTeamMembers ?? 0),
    },
  ];

  return (
    <div className="py-4 px-8 space-y-6">
      <div className="bg-white border border-[#F2F2F2] p-6 rounded-2xl">
        {/* First row */}

        <div className="flex justify-between">
          {/* first column */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="border-[#d1d5db] h-8! text-sm rounded-lg font-medium">
                  <SelectValue className="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">
                    <span className="flex items-center gap-2">
                      <Image
                        src="/home/usa.svg"
                        alt="USD"
                        width={16}
                        height={16}
                        priority
                        className="w-4 h-4"
                      />
                      <span className="mt-1">US Dollars (USD)</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="eur">
                    <span className="flex items-center gap-2">
                      🇪🇺 Euro (EUR)
                    </span>
                  </SelectItem>
                  <SelectItem value="gbp">
                    <span className="flex items-center gap-2">
                      🇬🇧 British Pound (GBP)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Available Balance with Visibility Toggle */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#475367] mb-2">
                    Available Balance
                  </p>
                  <div className="flex items-center gap-2">
                    {!isLoadingBalance ? (
                      <div className="text-[2rem] font-bold text-[#1C232D]">
                        {showBalance ? `$${balance.toFixed(2)}` : '••••••'}
                      </div>
                    ) : (
                      <></>
                    )}

                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-[#141B34] hover:text-[#667085] transition-colors"
                    >
                      {showBalance ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second colomn */}

          {/* Metrics Cards */}

          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-[#D0D5DD] bg-white text-sm text-[#475367] hover:bg-[#f9fafb]"
              >
                {activeMetric}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2 justify-end place-items-end">
              {metricCards.map((metric) => (
                <div key={metric.label}>
                  <div className="font-medium text-[#475367] text-sm text-right">
                    {metric.label}
                  </div>

                  <div className="space-y-4 text-right">
                    <div className="text-[2rem] font-bold text-[#1C232D]">
                      {metric.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-6" />

        {/* Second row */}
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            className=""
            onClick={() => router.push('/dashboard/team/add')}
          >
            <Image
              src="/home/plus-sign.svg"
              alt="contract"
              width={16}
              height={16}
            />
            Add new hire
          </Button>
          <Link href="/dashboard/payroll">
            <Button className="bg-[#FFFFFF] border border-[#0052FF] rounded-lg text-[#0052FF] font-medium hover:bg-[#ECF2FF]/20">
              <Image
                src="/home/arrow-narrow-up-right.svg"
                alt="contract"
                width={16}
                height={16}
              />
              Run Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* Promotional Section */}
      <div className="flex items-stretch gap-6 rounded-2xl border border-[#F2F2F2] bg-white overflow-hidden">
        <div className="flex-1 p-6">
          <h2 className="text-lg font-bold text-[#0F112A] mb-2">
            Use Helicode to run seamless payroll and hiring
          </h2>
          <p className="text-[#475367] leading-[145%] mb-4 text-sm">
            Hire talent, manage contracts, stay compliant, and pay your team
            instantly using stablecoins, all from one simple platform.
          </p>
          <Button
            variant="primary"
            className="text-white hover:bg-[#101828]/90"
          >
            <Link href={'/dashboard/payroll'}>Run Payroll</Link>
          </Button>
        </div>

        <div className="shrink-0 hidden md:block relative w-117">
          <Image
            src="/home/bridge-2.svg"
            alt="Alex"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Recent Payments and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Recent Payments */}
        <div className="rounded-2xl border border-[#F2F2F2] bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E7EC]">
            <h3 className="text-sm font-medium text-[#101928]">
              Recent Payments
            </h3>
            <Button
              variant="secondary"
              className="rounded-full w-18 h-7 text-xs  bg-white border hover:bg-[#E0EAFF]"
            >
              <Link href={'/dashboard/transactions'}>View all</Link>
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow className="border-b border-[#E4E7EC] hover:bg-transparent">
                <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
                  Person
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-medium text-[#344054] uppercase">
                  Date
                </TableHead>
                <TableHead className="py-4 text-xs font-medium text-[#344054] uppercase">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {previewTransactions.length === 0 ? (
                <TableRow className="border-b border-[#E4E7EC] last:border-b-0">
                  <TableCell
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm font-medium text-[#667085]"
                  >
                    No recent payment.
                  </TableCell>
                </TableRow>
              ) : (
                previewTransactions.map((payment, idx) => {
                  const initials = payment.name
                    .trim()
                    .split(/\s+/)
                    .map((word) => word[0].toUpperCase())
                    .join('');

                  return (
                    <TableRow
                      key={idx}
                      className="border-b border-[#E4E7EC] last:border-b-0 hover:bg-[#F9FAFB]"
                    >
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 text-[#8F3E19] text-xl font-bold">
                            <AvatarFallback className="bg-[#FFED94]">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-[#101828]">
                              {payment.name}
                            </p>
                            <p className="text-xs text-[#475367]">
                              {payment.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 text-sm font-bold text-[#101928]">
                        {payment.amount}
                      </TableCell>

                      <TableCell className="px-6 text-sm text-[#101928]">
                        {payment.date}
                      </TableCell>

                      <TableCell className="">
                        <span className="bg-[#ECFDF3] text-[#4D8F72] px-2 py-1 rounded-full border border-[#CAEFDC] font-medium">
                          {payment.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="rounded-2xl border border-[#F2F2F2] bg-white p-6">
          <h3 className="text-sm font-medium text-[#101828] mb-8">
            Quick Actions
          </h3>
          <div className="space-y-4">
            <KYCStatusCard />
          </div>
        </div>
      </div>
    </div>
  );
}
