'use client';

import { PageTitleContext } from '@/app/dashboard/layout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';

const payrollData = [
  { label: 'Incoming', value: '$3,000.40' },
  { label: 'Next Payroll', value: 'Mar 31, 2026' },
];

export default function TalentDashboardHomePage() {
  const { setTitle } = useContext(PageTitleContext);
  const [currency, setCurrency] = useState<string>('usd');
  const [showBalance, setShowBalance] = useState<boolean>(true);

  useEffect(() => {
    setTitle('Home');
  }, [setTitle]);
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
                    <div className="text-[2rem] font-bold text-[#1C232D]">
                      {showBalance ? `$500.00` : '••••••'}
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
          <Button className="bg-[#0052FF] rounded-lg text-white font-medium">
            <Image
              src="/home/arrow-narrow-up-right-white.svg"
              alt="send"
              width={16}
              height={16}
            />
            Send
          </Button>
          <Button className="bg-[#FFFFFF] border border-[#0052FF] rounded-lg text-[#0052FF] font-medium hover:bg-[#ECF2FF]/20">
            <Image
              src="/home/arrow-narrow-down-left.svg"
              alt="withdraw"
              width={16}
              height={16}
            />
            Withdraw funds
          </Button>
        </div>
      </div>
    </div>
  );
}
