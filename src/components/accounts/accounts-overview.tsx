"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Download, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { getCompanyDetails } from "@/lib/company-details";
import {
  formatAccountMoney,
  formatSignedMoney,
  hasAmount,
  maskLast4,
  railsLabel,
  statusLabel,
} from "@/lib/account-format";
import {
  ACCOUNTS_CHANGED_EVENT,
  getAccountCatalog,
  getAccountsOverview,
  joinAccountWaitlist,
  notifyAccountsChanged,
  type AccountsOverview as AccountsOverviewData,
  type CatalogCurrency,
  type OverviewAccount,
} from "@/lib/accounts-service";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { AddCurrencyAccountDialog } from "./add-currency-account-dialog";
import { CurrencyMark } from "./currency-mark";
import { DownloadStatementModal } from "./download-statement-modal";

const BALANCE_COLORS: Record<string, string> = {
  USD: "#0052FF",
  NGN: "#6B98F7",
  EUR: "#C6D6F9",
};

function percentShares(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    if (values.length === 0) return [];
    const base = Math.floor(100 / values.length);
    const shares = values.map(() => base);
    shares[0] += 100 - base * values.length;
    return shares;
  }

  const raw = values.map((value) => (value / total) * 100);
  const shares = raw.map((value) => Math.floor(value));
  let remainder = 100 - shares.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (const item of order) {
    if (remainder <= 0) break;
    shares[item.index] += 1;
    remainder -= 1;
  }

  return shares;
}

function balanceMix(accounts: OverviewAccount[]) {
  const amounts = accounts.map((account) => {
    const inflow = Number.parseFloat(account.period.moneyIn);
    return Number.isFinite(inflow) ? Math.max(inflow, 0) : 0;
  });
  const weights = amounts.some((amount) => amount > 0)
    ? amounts
    : accounts.map(() => 1);
  const shares = percentShares(weights);

  return accounts
    .map((account, index) => ({
      currency: account.currency,
      name: account.name,
      color: BALANCE_COLORS[account.currency] ?? "#0052FF",
      percent: shares[index] ?? 0,
    }))
    .sort((left, right) => right.percent - left.percent);
}

function BalanceMix({ accounts }: { accounts: OverviewAccount[] }) {
  const segments = balanceMix(accounts);

  return (
    <div className="mt-5">
      <div className="flex h-1.5 overflow-hidden rounded-full">
        {segments.map((segment) => (
          <div
            key={segment.currency}
            className="h-full"
            style={{
              width: `${segment.percent}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <span
            key={segment.currency}
            className="inline-flex items-center gap-1.5 text-xs text-[#667085]"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.name} {segment.percent}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function AccountsOverview() {
  const authType = useAuthStore((state) => state.authType);
  const canRequest = authType !== "company_admin";
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<AccountsOverviewData | null>(null);
  const [catalog, setCatalog] = useState<CatalogCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [preset, setPreset] = useState<string | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const company = await getCompanyDetails();
      if (company.currencyAccountsEnabled === false) {
        setEnabled(false);
        return;
      }
      setEnabled(true);
      const [accounts, currencies] = await Promise.all([
        getAccountsOverview(),
        getAccountCatalog(),
      ]);
      setOverview(accounts);
      setCatalog(currencies);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load accounts",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const onChange = () => void load();
    window.addEventListener(ACCOUNTS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(ACCOUNTS_CHANGED_EVENT, onChange);
  }, [load]);

  const join = async (currency: string) => {
    if (!canRequest) {
      toast.error("Only the employer can join a waitlist.");
      return;
    }
    try {
      setJoining(currency);
      await joinAccountWaitlist(currency);
      setCatalog((current) =>
        current.map((item) =>
          item.code === currency ? { ...item, waitlisted: true } : item,
        ),
      );
      notifyAccountsChanged();
      toast.success("You're on the waitlist.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  if (enabled === false) {
    return (
      <p className="px-6 py-10 text-sm text-[#667085]">
        Currency accounts are not enabled.
      </p>
    );
  }

  const statementAccount =
    overview?.accounts.find((account) => account.currency === "USD") ??
    overview?.accounts[0];
  const comingSoon = catalog.filter(
    (item) => item.availability === "COMING_SOON",
  );

  return (
    <div className="px-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-[#667085]">
          Hold, receive and pay out in multiple currencies.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-[#D0D5DD] bg-white"
            disabled={!statementAccount}
            onClick={() => setStatementOpen(true)}
          >
            <Download className="h-4 w-4" />
            Statements
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
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

      <section className="mt-5 rounded-2xl border border-[#EAECF0] bg-white px-6 py-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm text-[#667085]">Total balance</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-[#101828]">
              {isLoading
                ? "—"
                : formatAccountMoney(overview?.totalBalance, "USD")}
            </p>
            {overview?.balanceSource === "stored" && (
              <p className="mt-2 text-xs text-[#98A2B3]">May be out of date</p>
            )}
          </div>
          <div className="flex gap-10 pb-1 text-right">
            <div>
              <p className="text-sm text-[#667085]">Money in</p>
              <p className="mt-1 text-sm font-semibold text-[#0052FF]">
                {formatSignedMoney(overview?.period.moneyIn, "in", "USD")}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#667085]">Money out</p>
              <p className="mt-1 text-sm font-semibold text-[#101828]">
                {formatSignedMoney(overview?.period.moneyOut, "out", "USD")}
              </p>
            </div>
          </div>
        </div>
        {overview && overview.accounts.length > 0 && (
          <BalanceMix accounts={overview.accounts} />
        )}
        {hasAmount(overview?.pendingOut) && (
          <p className="mt-3 text-sm text-[#667085]">
            · {formatAccountMoney(overview?.pendingOut, "USD")} pending
          </p>
        )}
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
        <div className="grid grid-cols-[1.3fr_1.3fr_0.9fr_auto] border-b border-[#EAECF0] px-6 py-3 text-[11px] font-medium tracking-wide text-[#98A2B3] uppercase">
          <span>Account</span>
          <span>Account details</span>
          <span className="text-right">Balance</span>
          <span className="w-4" />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0052FF]" />
          </div>
        ) : overview && overview.accounts.length > 0 ? (
          overview.accounts.map((account) => {
            const isUsd = account.currency === "USD";
            const amount = isUsd
              ? formatAccountMoney(overview.totalBalance, "USD")
              : formatSignedMoney(account.period.moneyIn, "in", "USD");
            const secondary = isUsd
              ? hasAmount(overview.pendingOut)
                ? `· ${formatAccountMoney(overview.pendingOut, "USD")} pending`
                : null
              : "Received";
            const masked = maskLast4(account.accountNumberLast4);
            const detailLine = masked
              ? account.currency === "EUR"
                ? `IBAN ${masked}`
                : `Acct ${masked}`
              : null;

            return (
              <Link
                key={account.currency}
                href={`/dashboard/accounts/${account.currency.toLowerCase()}`}
                className="grid grid-cols-[1.3fr_1.3fr_0.9fr_auto] items-center border-b border-[#F2F4F7] px-6 py-4 last:border-b-0 hover:bg-[#F9FAFB]"
              >
                <div className="flex items-center gap-3">
                  <CurrencyMark currency={account.currency} />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
                      {account.name}
                      {account.status !== "ACTIVE" && (
                        <span className="rounded-full bg-[#FFFAEB] px-2 py-0.5 text-[11px] font-medium text-[#B54708]">
                          {statusLabel(account.status)}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-[#667085]">
                      {railsLabel(account.currency)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#101828]">
                    {account.bankName || "—"}
                  </p>
                  {detailLine && (
                    <p className="text-sm text-[#667085]">{detailLine}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#101828]">
                    {amount}
                  </p>
                  {secondary && (
                    <p className="text-sm text-[#98A2B3]">{secondary}</p>
                  )}
                </div>
                <ChevronRight className="ml-3 h-4 w-4 text-[#98A2B3]" />
              </Link>
            );
          })
        ) : (
          <p className="px-6 py-10 text-sm text-[#667085]">
            No accounts yet. Finish company verification to open a US Dollar
            account.
          </p>
        )}
      </section>

      {comingSoon.length > 0 && (
        <section className="mt-8">
          <h2 className="text-base font-semibold text-[#101828]">
            Add more currencies
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            Activate only what you need. You can close an empty account at any
            time.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {comingSoon.map((item) => (
              <div
                key={item.code}
                className="rounded-2xl border border-[#EAECF0] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CurrencyMark currency={item.code} letter size={36} />
                    <div>
                      <p className="text-sm font-semibold text-[#101828]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#98A2B3]">{item.code}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[11px] font-medium text-[#667085]">
                    Coming soon
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {item.benefits.slice(0, 3).map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 text-sm text-[#475467]"
                    >
                      <Check className="h-4 w-4 text-[#8D9AB0]" /> {benefit}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={item.waitlisted || joining === item.code}
                  onClick={() => void join(item.code)}
                  className={cn(
                    "mt-4 w-full text-center text-sm font-semibold transition-colors",
                    item.waitlisted
                      ? "text-[#98A2B3]"
                      : "text-[#66748C] hover:text-[#0052FF]",
                  )}
                >
                  {item.waitlisted
                    ? "On the waitlist"
                    : joining === item.code
                      ? "Joining..."
                      : "Join waitlist"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <AddCurrencyAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        currencies={catalog}
        preset={preset}
        canRequest={canRequest}
        onSubmitted={() => void load()}
      />
      {statementAccount && (
        <DownloadStatementModal
          open={statementOpen}
          onOpenChange={setStatementOpen}
          currency={statementAccount.currency}
          accountName={statementAccount.name}
        />
      )}
    </div>
  );
}
