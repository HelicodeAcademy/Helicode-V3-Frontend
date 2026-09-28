"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompanyDetails } from "@/lib/company-details";
import {
  formatUsd,
  LOCAL_ACCOUNTS,
  type AccountCode,
  type LocalAccount,
} from "@/lib/local-accounts";
import { useLocalAccountsStore } from "@/store/local-accounts-store";
import { CurrencyMark } from "./currency-mark";
import { AddCurrencyAccountDialog } from "./add-currency-account-dialog";
import { AccountLiveDialog } from "./account-live-dialog";

export function AccountsOverview() {
  const opened = useLocalAccountsStore((state) => state.opened);
  const [companyName, setCompanyName] = useState("your company");
  const [addOpen, setAddOpen] = useState(false);
  const [preset, setPreset] = useState<AccountCode | null>(null);
  const [liveAccount, setLiveAccount] = useState<LocalAccount | null>(null);

  useEffect(() => {
    getCompanyDetails()
      .then((company) => setCompanyName(company.name))
      .catch(() => {});
  }, []);

  const accounts = useMemo(
    () => LOCAL_ACCOUNTS.filter((account) => opened.includes(account.code)),
    [opened],
  );

  const totalUsd = accounts.reduce(
    (sum, account) => sum + account.balanceUsd,
    0,
  );

  return (
    <div className="px-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-[#667085]">
            Hold, receive and pay out in local currencies.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            className="bg-[#0052FF] transition-colors hover:bg-[#0041c4] disabled:bg-[#D0D5DD] disabled:cursor-not-allowed"
            onClick={() => {
              setPreset(null);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4 text-white" />
            Add account
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E2E7F0] bg-white px-6 py-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm text-[#66748C]">Total balance</p>
            <p className="mt-2 text-[40px] leading-none font-semibold tracking-tight text-[#0C1424]">
              {formatUsd(totalUsd)}
            </p>
            <p className="mt-2 text-sm text-[#98A2B3]">
              Across {accounts.length} account{accounts.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-10 pb-1 text-right">
            <div>
              <p className="text-sm text-[#66748C]">Money in</p>
              <p className="mt-1 text-sm font-semibold text-[#0B7A55]">
                +$12,400.00
              </p>
            </div>
            <div>
              <p className="text-sm text-[#66748C]">Money out</p>
              <p className="mt-1 text-sm font-semibold text-[#0C1424]">
                −$9,870.00
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#E2E7F0] bg-white">
        <div className="grid grid-cols-[1.4fr_1.4fr_0.8fr] border-b border-[#EAECF0] px-6 py-3 text-[11px] font-medium tracking-wide text-[#98A2B3] uppercase">
          <span>Account</span>
          <span>Account details</span>
          <span className="text-right">Balance</span>
        </div>
        {accounts.map((account) => (
          <Link
            key={account.code}
            href={`/dashboard/accounts/${account.code.toLowerCase()}`}
            className="grid grid-cols-[1.4fr_1.4fr_0.8fr] items-center border-b border-[#F2F4F7] px-6 py-4 last:border-b-0 hover:bg-[#F9FAFB]"
          >
            <div className="flex items-center gap-3">
              <CurrencyMark mark={account.mark} />
              <div>
                <p className="text-sm font-semibold text-[#101828]">
                  {account.name}
                </p>
                <p className="text-sm text-[#667085]">{account.kind}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#101828]">
                {account.bankName}
              </p>
              <p className="text-sm text-[#667085]">{account.detailLine}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#101828]">
                {account.balanceLabel}
              </p>
              {account.approxUsdLabel && (
                <p className="text-sm text-[#98A2B3]">
                  {account.approxUsdLabel}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <AddCurrencyAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        companyName={companyName}
        preset={preset}
        onLive={(account) => setLiveAccount(account)}
      />
      <AccountLiveDialog
        account={liveAccount}
        companyName={companyName}
        onOpenChange={(open) => {
          if (!open) setLiveAccount(null);
        }}
      />
    </div>
  );
}
