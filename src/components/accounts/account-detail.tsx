"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarIcon,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  ShareIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
// import { PageTitleContext } from "@/app/app/dashboard/layout";
import { downloadAccountLetter } from "@/lib/account-documents";
import {
  openStatementDownload,
  prepareStatement,
} from "@/lib/statements-service";
import {
  displayCurrency,
  formatAccountMoney,
  formatMonthLabel,
  formatPeriodRange,
  formatShortDate,
  formatSignedMoney,
  hasAmount,
  maskFullNumber,
  railsLabel,
  statusLabel,
} from "@/lib/account-format";
import {
  getAccountRequest,
  getAccountTransactions,
  getCurrencyAccount,
  getStatementPeriods,
  type AccountDetails,
  type CurrencyAccount,
  type StatementPeriod,
} from "@/lib/accounts-service";
import type { CompanyFeedTransaction } from "@/lib/transactions-feed-service";
import { cn } from "@/lib/utils";
import { CurrencyMark } from "./currency-mark";
import { DownloadStatementModal } from "./download-statement-modal";
import { ReceiveDetailsModal } from "./receive-details-modal";
import Image from "next/image";

type DirectionFilter = "all" | "in" | "out";
type RangeFilter = "30d" | "month" | "all";

function rangeParams(range: RangeFilter) {
  const today = new Date();
  if (range === "30d") {
    return { from: format(subDays(today, 30), "yyyy-MM-dd") };
  }
  if (range === "month") {
    return {
      from: format(
        new Date(today.getFullYear(), today.getMonth(), 1),
        "yyyy-MM-dd",
      ),
    };
  }
  return {};
}

function partyName(transaction: CompanyFeedTransaction) {
  if (transaction.type === "Received") {
    return transaction.sender?.name || transaction.paymentMethod;
  }
  return transaction.receiver?.name || transaction.paymentMethod;
}

function partySubtitle(transaction: CompanyFeedTransaction) {
  return transaction.source?.method || transaction.paymentMethod;
}

function detailFields(details: AccountDetails, revealed: boolean) {
  const fields: {
    key: string;
    label: string;
    value: string;
    secret?: boolean;
  }[] = [];
  if (details.accountName) {
    fields.push({
      key: "holder",
      label: "Account holder",
      value: details.accountName,
    });
  }
  if (details.bankName) {
    fields.push({ key: "bank", label: "Bank", value: details.bankName });
  }
  if (details.accountNumber) {
    fields.push({
      key: "number",
      label: "Account number",
      value: revealed
        ? details.accountNumber
        : maskFullNumber(details.accountNumber),
      secret: true,
    });
  }
  if (details.routingNumber) {
    fields.push({
      key: "ach",
      label: "ACH routing",
      value: details.routingNumber,
    });
    fields.push({
      key: "wire",
      label: "Wire routing",
      value: details.routingNumber,
    });
  }
  if (details.iban) {
    fields.push({
      key: "iban",
      label: "IBAN",
      value: revealed ? details.iban : maskFullNumber(details.iban),
      secret: true,
    });
  }
  if (details.bic) {
    fields.push({ key: "bic", label: "BIC", value: details.bic });
  }
  if (details.bankAddress) {
    fields.push({
      key: "address",
      label: "Bank address",
      value: details.bankAddress,
    });
  }
  if (details.beneficiaryAddress) {
    fields.push({
      key: "beneficiary",
      label: "Beneficiary address",
      value: details.beneficiaryAddress,
    });
  }
  return fields;
}

export function AccountDetail({ currency }: { currency: string }) {
  // const { setTitle } = useContext(PageTitleContext);
  const [account, setAccount] = useState<CurrencyAccount | null>(null);
  const [transactions, setTransactions] = useState<CompanyFeedTransaction[]>(
    [],
  );
  const [periods, setPeriods] = useState<StatementPeriod[]>([]);
  const [hostedLink, setHostedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [missing, setMissing] = useState(false);
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [range, setRange] = useState<RangeFilter>("30d");
  const [revealed, setRevealed] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [downloadingMonth, setDownloadingMonth] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setMissing(false);
        const [details, statementPeriods] = await Promise.all([
          getCurrencyAccount(currency),
          getStatementPeriods(currency),
        ]);
        if (cancelled) return;
        setAccount(details);
        setPeriods(statementPeriods);
        // setTitle(`${details.name} account`);
        if (
          details.status === "PENDING_REVIEW" ||
          details.status === "REJECTED"
        ) {
          const request = await getAccountRequest(currency).catch(() => null);
          if (!cancelled) setHostedLink(request?.hostedLink ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setMissing(true);
          // setTitle("Accounts");
          toast.error(
            error instanceof Error ? error.message : "Account not found",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [currency]);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    const loadRows = async () => {
      try {
        setIsLoadingRows(true);
        const result = await getAccountTransactions(currency, {
          limit: 8,
          direction: direction === "all" ? undefined : direction,
          ...rangeParams(range),
        });
        if (!cancelled) setTransactions(result.transactions);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load transactions",
          );
        }
      } finally {
        if (!cancelled) setIsLoadingRows(false);
      }
    };
    void loadRows();
    return () => {
      cancelled = true;
    };
  }, [account, currency, direction, range]);

  const copyAll = async () => {
    if (!account) return;
    const text = detailFields(account.details, true)
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Account details copied");
  };

  const downloadMonth = async (period: StatementPeriod) => {
    try {
      setDownloadingMonth(period.month);
      const record = await prepareStatement({
        type: "ACCOUNT",
        currency,
        from: period.from.slice(0, 10),
        to: period.to.slice(0, 10),
      });
      if (record.status === "FAILED") {
        throw new Error(
          record.error ||
            "We couldn't prepare this statement. Please try again.",
        );
      }
      await openStatementDownload(record.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download statement",
      );
    } finally {
      setDownloadingMonth(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center px-6 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0052FF]" />
      </div>
    );
  }

  if (missing || !account) {
    return (
      <div className="px-6 py-10">
        <p className="text-sm text-[#667085]">This account is not available.</p>
        <Link
          href="/dashboard/accounts"
          className="mt-3 inline-block text-sm font-semibold text-[#0052FF]"
        >
          Back to accounts
        </Link>
      </div>
    );
  }

  const isEur = account.currency === "EUR";
  const moneyCurrency = displayCurrency(account.balanceCurrency || "USDC");
  const fields = detailFields(account.details, revealed);
  const active = account.status === "ACTIVE";

  return (
    <div className="px-6 pb-10">
      {/* <p className="text-sm text-[#667085]">
        <Link href="/dashboard/accounts" className="hover:text-[#101828]">
          Accounts
        </Link>
        <span className="mx-1.5 text-[#D0D5DD]">›</span>
        <span className="text-[#101828]">{account.name}</span>
      </p> */}

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <CurrencyMark currency={account.currency} size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-[#101828]">
                {account.name} account
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  active
                    ? "bg-[#E4F4EC] text-[#0B7A55]"
                    : "bg-[#FFFAEB] text-[#B54708]",
                )}
              >
                <span
                  className={cn(active ? "bg-[#12B76A]" : "bg-[#F79009]")}
                />
                {statusLabel(account.status)}
              </span>
            </div>
            <p className="text-sm text-[#667085]">
              {railsLabel(account.currency)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg border-[#D0D5DD] bg-white"
          onClick={() => setStatementOpen(true)}
        >
          <Download className="h-4 w-4" />
          Statement
        </Button>
      </div>

      {(account.status === "PENDING_REVIEW" ||
        account.status === "REJECTED") && (
        <div className="mt-4 rounded-xl border border-[#FEC84B] bg-[#FFFAEB] px-4 py-3 text-sm text-[#B54708]">
          {account.reason || statusLabel(account.status)}
          {hostedLink && (
            <a
              href={hostedLink}
              target="_blank"
              rel="noreferrer"
              className="ml-2 font-semibold underline"
            >
              Continue review
            </a>
          )}
        </div>
      )}

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#EAECF0] bg-white px-6 py-5">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm text-[#667085]">
                  {isEur ? "Received" : "Balance"}
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-[#101828]">
                  {isEur
                    ? formatSignedMoney(account.period.moneyIn, "in", "USD")
                    : formatAccountMoney(account.balance, moneyCurrency)}
                </p>
                {!isEur && (
                  <p className="mt-2 text-sm text-[#667085]">
                    Available{" "}
                    {formatAccountMoney(account.available, moneyCurrency)}
                    {hasAmount(account.pendingOut)
                      ? ` · ${formatAccountMoney(account.pendingOut, moneyCurrency)} pending`
                      : ""}
                  </p>
                )}
                {account.balanceSource === "stored" && !isEur && (
                  <p className="mt-1 text-xs text-[#98A2B3]">
                    May be out of date
                  </p>
                )}
              </div>
              <div className="flex gap-8 pb-1 text-right">
                <div>
                  <p className="text-sm text-[#667085]">In</p>
                  <p className="mt-1 text-lg font-semibold text-[#0052FF]">
                    {formatSignedMoney(
                      account.period.moneyIn,
                      "in",
                      moneyCurrency,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#667085]">Out</p>
                  <p className="mt-1 text-lg font-semibold text-[#0C1424]">
                    {formatSignedMoney(
                      account.period.moneyOut,
                      "out",
                      moneyCurrency,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#EAECF0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <h3 className="text-base font-semibold text-[#101828]">
                Transactions
              </h3>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg bg-[#F2F4F7] p-1">
                  {(
                    [
                      ["all", "All"],
                      ["in", "Money in"],
                      ["out", "Money out"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDirection(value)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium",
                        direction === value
                          ? "bg-white text-[#101828] shadow-sm"
                          : "text-[#667085]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="relative">
                  <select
                    value={range}
                    onChange={(event) =>
                      setRange(event.target.value as RangeFilter)
                    }
                    className="h-9 appearance-none rounded-lg border border-[#E4E7EC] bg-white pr-8 pl-3 text-sm font-medium text-[#101828]"
                  >
                    <option value="month">This month</option>
                    <option value="30d">Last 30 days</option>
                    <option value="all">All</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-2.5 right-2 h-4 w-4 text-[#667085]" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.7fr] border-y border-[#EAECF0] px-5 py-2 text-[11px] font-medium tracking-wide text-[#98A2B3] uppercase">
              <span>Description</span>
              <span>Date</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>

            {isLoadingRows ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#0052FF]" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#667085]">
                No transactions on this account yet.
              </p>
            ) : (
              <ul>
                {transactions.map((transaction) => {
                  const incoming = transaction.type === "Received";
                  const rowCurrency = displayCurrency(
                    transaction.localCurrency || transaction.currency,
                  );
                  const amount = transaction.localAmount || transaction.amount;
                  return (
                    <li
                      key={transaction.id}
                      className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.7fr] items-center border-b border-[#F2F4F7] px-5 py-3.5 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            incoming
                              ? "bg-[#ECFDF3] text-[#039855]"
                              : "bg-[#F2F4F7] text-[#667085]",
                          )}
                        >
                          {incoming ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#101828]">
                            {partyName(transaction)}
                          </p>
                          <p className="truncate text-xs text-[#667085] uppercase">
                            {partySubtitle(transaction)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[#475467]">
                        {formatShortDate(transaction.date)}
                      </p>
                      <p>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            transaction.status === "Pending"
                              ? "bg-[#FBEEDA] text-[#9A5B00]"
                              : transaction.status === "Failed"
                                ? "bg-[#FEF3F2] text-[#B42318]"
                                : "bg-[#E4F4EC] text-[#0B7A55]",
                          )}
                        >
                          {statusLabel(transaction.status)}
                        </span>
                      </p>
                      <p
                        className={cn(
                          "text-right text-sm font-semibold",
                          incoming ? "text-[#0B7A55]" : "text-[#101828]",
                        )}
                      >
                        {formatSignedMoney(
                          amount,
                          incoming ? "in" : "out",
                          rowCurrency,
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-[#EAECF0] px-5 py-3 text-center">
              <Link
                href="/dashboard/transactions"
                className="flex items-center gap-1 text-sm font-semibold text-[#0052FF] justify-center"
              >
                View all transactions{" "}
                <ArrowRight className="h-4 w-4 text-[#0052FF]" />
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <aside className="rounded-2xl border border-[#EAECF0] bg-white">
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div>
                <h3 className="text-base font-semibold text-[#101828]">
                  Account details
                </h3>
                <p className="mt-1 text-xs text-[#667085]">
                  Share these to get paid in {account.currency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyAll()}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#667085]"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy all
              </button>
            </div>
            <dl className="mt-3">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between gap-3 border-t border-[#F2F4F7] px-5 py-3"
                >
                  <div className="min-w-0">
                    <dt className="text-xs text-[#667085]">{field.label}</dt>
                    <dd className="text-sm font-medium text-[#101828] break-all">
                      {field.value}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    {field.secret && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052FF]"
                        onClick={() => setRevealed((value) => !value)}
                      >
                        {revealed ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        {revealed ? "Hide" : "Show"}
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Copy ${field.label}`}
                      className="text-[#98A2B3]"
                      onClick={() => {
                        const full = detailFields(account.details, true).find(
                          (item) => item.key === field.key,
                        );
                        void navigator.clipboard.writeText(
                          full?.value ?? field.value,
                        );
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-2 gap-2 p-5">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg bg-[#E9F0FF] border-none shadow-none text-[#0052FF] flex items-center gap-2"
                onClick={() => setReceiveOpen(true)}
              >
                {/* <Image
                  src="/account/share.svg"
                  alt="Share"
                  width={16}
                  height={16}
                /> */}
                <ShareIcon className="h-4 w-4 text-[#0052FF]" strokeWidth={3} />
                Share details
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-[#D0D5DD] text-[#0C1424] flex items-center gap-2"
                onClick={() =>
                  downloadAccountLetter(
                    account.currency,
                    `${account.name} account letter`,
                    detailFields(account.details, true).map((field) => ({
                      label: field.label,
                      value: field.value,
                    })),
                  )
                }
              >
                <Image
                  src="/account/doc.svg"
                  alt="Account letter"
                  width={16}
                  height={16}
                />
                Account letter
              </Button>
            </div>
          </aside>

          <aside className="rounded-2xl border border-[#EAECF0] bg-white p-5">
            <h3 className="text-base font-semibold text-[#101828]">
              Statements
            </h3>
            <p className="mt-1 text-xs text-[#667085]">
              Monthly PDF statements, ready on the 1st
            </p>
            <ul className="mt-4 space-y-3">
              {periods.length === 0 ? (
                <li className="text-sm text-[#667085]">No statements yet.</li>
              ) : (
                periods.map((period) => (
                  <li key={period.month} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF3F2] text-[10px] font-bold text-[#D92D20]">
                      PDF
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#101828]">
                        {formatMonthLabel(period.month)}
                      </p>
                      <p className="text-xs text-[#667085]">
                        {formatPeriodRange(period.from, period.to)} ·{" "}
                        {period.transactionCount} transactions
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Download ${period.month}`}
                      disabled={downloadingMonth === period.month}
                      onClick={() => void downloadMonth(period)}
                      className="text-[#667085]"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
            <button
              type="button"
              onClick={() => setStatementOpen(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#0052FF]"
            >
              <CalendarIcon className="h-4 w-4" />
              Custom date range or CSV...
            </button>
          </aside>
        </div>
      </div>

      <DownloadStatementModal
        open={statementOpen}
        onOpenChange={setStatementOpen}
        currency={account.currency}
        accountName={account.name}
      />
      <ReceiveDetailsModal
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        currency={account.currency}
        accountName={account.name}
        details={account.receive?.domestic ?? account.details}
      />
    </div>
  );
}
