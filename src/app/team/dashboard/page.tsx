'use client';

import { TeamPageTitleContext } from './layout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { addDays, addHours, addMonths, format, isValid, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import PaymentHistory from '@/components/team-dashboard/home/payment-history';
import { SendFundsModal } from '@/components/team-dashboard/home/send-funds-modal';
import toast from 'react-hot-toast';
import { getTeamMe } from '@/lib/team/team-auth-service';
import { TeamMeResponse } from '@/store/team/team-auth-store';
import { TalentWithdrawFundsModal } from '@/components/team-dashboard/home/withdraw-funds-modal';
import {
  getTeamTransactions,
  TeamTransactionData,
} from '@/lib/team/team-transaction-service';

export default function TalentDashboardHomePage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const [currency, setCurrency] = useState<string>('usd');
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamMeResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    TeamTransactionData[]
  >([]);
  const [withdrawFundsModalOpen, setWithdrawFundsModalOpen] =
    useState<boolean>(false);

  const handleSelectCrypto = () => {
    setWithdrawFundsModalOpen(false);
    setSendFundsModalOpen(true);
  };

  useEffect(() => {
    setTitle('Home');
    fetchTeamData();
    fetchTeamTransactions();
  }, [setTitle]);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const data = await getTeamMe();
      setTeamData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch team data';
      toast.error(errorMessage);
      console.error('Team data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamTransactions = async () => {
    try {
      setIsLoading(true);
      const transactions = await getTeamTransactions();
      setRecentTransactions(transactions.data);
      console.log('Team transactions:', transactions);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch team transactions';
      toast.error(errorMessage);
      console.error('Team transactions fetch error:', error);
    }
  };

  const balance = teamData?.wallet.balance ?? 0;

  const getCurrencySymbol = (currency?: string) => {
    switch (currency?.toUpperCase()) {
      case 'USD':
      case 'USDC':
      case 'USDT':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currency ?? '';
    }
  };

  const formatIncomingAmount = (amount?: number, currency?: string) => {
    if (typeof amount !== 'number') return '--';

    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateNextPayroll = (
    frequency?: string,
    startDate?: string
  ) => {
    if (!frequency || !startDate) return '--';

    const anchorDate = parseISO(startDate);
    if (!isValid(anchorDate)) return '--';

    const now = new Date();
    let nextDate = anchorDate;

    while (nextDate <= now) {
      switch (frequency.toUpperCase()) {
        case 'DAILY':
          nextDate = addDays(nextDate, 1);
          break;
        case 'WEEKLY':
          nextDate = addDays(nextDate, 7);
          break;
        case 'MONTHLY':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'HOURLY':
          nextDate = addHours(nextDate, 1);
          break;
        default:
          return '--';
      }
    }

    return frequency.toUpperCase() === 'HOURLY'
      ? format(nextDate, 'MMM d, yyyy hh:mm a')
      : format(nextDate, 'MMM d, yyyy');
  };

  const payrollData = [
    {
      label: 'Incoming',
      value: formatIncomingAmount(
        teamData?.payroll.amount,
        teamData?.payroll.currency
      ),
    },
    {
      label: 'Next Payroll',
      value: calculateNextPayroll(
        teamData?.payroll.frequency,
        teamData?.membership.startDate
      ),
    },
  ];

  return (
    <div className="py-4 px-8 space-y-6">
      <div className="bg-white border border-[#F2F2F2] p-6 rounded-2xl">
        <div className="flex justify-between items-end">
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

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#475367] mb-2">
                    Available Balance
                  </p>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <>
                        <div className="text-[2rem] font-bold text-[#1C232D]">
                          {showBalance
                            ? `${getCurrencySymbol(teamData?.payroll.currency)}${balance.toFixed(2)}`
                            : '••••••'}
                        </div>

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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-20 md:grid-cols-2 justify-end place-items-end">
            {payrollData.map((metric) => (
              <div key={metric.label}>
                <div className="font-medium text-[#475367] text-sm text-right">
                  {metric.label}
                </div>

                <div className="space-y-4 text-right">
                  <div className="text-[32px] font-bold text-[#1C232D]">
                    {metric.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-6" />

        <div className="flex gap-3">
          {/* <Button
            className="bg-[#0052FF] rounded-lg text-white font-medium"
            onClick={() => setSendFundsModalOpen(true)}
          >
            <Image
              src="/home/arrow-narrow-up-right-white.svg"
              alt="send"
              width={16}
              height={16}
            />
            Send
          </Button> */}
          <Button
            onClick={() => setWithdrawFundsModalOpen(true)}
            className="bg-[#0052FF] rounded-lg text-white items-center font-medium hover:bg-[#0052FF]/50"
          >
            <Image
              src="/home/arrow-narrow-up-right-white.svg"
              alt="withdraw"
              className="rotate-180"
              width={16}
              height={16}
            />
            Withdraw funds
          </Button>
        </div>
      </div>

      <div className="">
        <PaymentHistory payments={recentTransactions} />
      </div>

      <SendFundsModal
        open={sendFundsModalOpen}
        onOpenChange={setSendFundsModalOpen}
      />
      <TalentWithdrawFundsModal
        open={withdrawFundsModalOpen}
        onOpenChange={setWithdrawFundsModalOpen}
        onSelectCrypto={handleSelectCrypto}
      />
    </div>
  );
}
