"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { getCompanyDetails } from "@/lib/company-details";
import type { LocalAccount } from "@/lib/local-accounts";
import { CurrencyMark } from "./currency-mark";

export function AccountDetail({ account }: { account: LocalAccount }) {
  const [companyName, setCompanyName] = useState("your company");

  useEffect(() => {
    getCompanyDetails()
      .then((company) => setCompanyName(company.name))
      .catch(() => {});
  }, []);

  const fields = account.fields.map((field) =>
    field.label === "Account name"
      ? { ...field, value: `${companyName} Ltd` }
      : field,
  );

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  const share = async () => {
    const text = fields
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Account details copied");
  };

  return (
    <div className="px-6 pb-10">
      <p className="text-sm text-[#667085]">
        <Link href="/dashboard/accounts" className="hover:text-[#101828]">
          Accounts
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#101828]">{account.name}</span>
      </p>

      <div className="mt-4 flex items-center gap-3">
        <CurrencyMark mark={account.mark} />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-[#101828]">
              {account.name}
            </h2>
            <span
              className={
                account.lifecycle === "review"
                  ? "rounded-full bg-[#FFFAEB] px-2.5 py-0.5 text-xs font-medium text-[#B54708]"
                  : "rounded-full bg-[#ECFDF3] px-2.5 py-0.5 text-xs font-medium text-[#027A48]"
              }
            >
              {account.lifecycle === "review" ? "Review" : "Active"}
            </span>
          </div>
          <p className="text-sm text-[#667085]">{account.currencyLine}</p>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#EAECF0] bg-white px-6 py-5">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm text-[#667085]">Available balance</p>
                <p className="mt-2 text-[36px] leading-none font-semibold tracking-tight text-[#101828]">
                  {account.availableBalance}
                </p>
                {account.rateLine && (
                  <p className="mt-2 text-sm text-[#98A2B3]">
                    {account.rateLine}
                  </p>
                )}
              </div>
              <div className="flex gap-8 pb-1 text-right">
                <div>
                  <p className="text-sm text-[#667085]">In · September</p>
                  <p className="mt-1 text-sm font-semibold text-[#039855]">
                    {account.periodIn}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#667085]">Out · September</p>
                  <p className="mt-1 text-sm font-semibold text-[#101828]">
                    {account.periodOut}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#EAECF0] bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-base font-semibold text-[#101828]">
                Transactions
              </h3>
              <Link
                href="/dashboard/transactions"
                className="text-sm font-semibold text-[#0052FF]"
              >
                View all
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <p className="border-t border-[#F2F4F7] px-6 py-8 text-sm text-[#667085]">
                No transactions on this account yet.
              </p>
            ) : (
              <ul>
                {account.transactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-3 border-t border-[#F2F4F7] px-6 py-4"
                  >
                    <span
                      className={
                        transaction.direction === "in"
                          ? "flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF3] text-[#039855]"
                          : "flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F4F7] text-[#667085]"
                      }
                    >
                      {transaction.direction === "in" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#101828]">
                        {transaction.title}
                      </p>
                      <p className="text-sm text-[#667085]">
                        {transaction.subtitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          transaction.direction === "in"
                            ? "text-sm font-semibold text-[#039855]"
                            : "text-sm font-semibold text-[#101828]"
                        }
                      >
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-[#667085]">
                        {transaction.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="rounded-2xl border border-[#EAECF0] bg-white">
          <div className="flex items-center justify-between p-5">
            <h3 className="text-base font-semibold text-[#101828]">
              Account details
            </h3>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#027A48]">
              <span className="h-2 w-2 rounded-full bg-[#12B76A]" />
              Verified
            </span>
          </div>

          <hr />
          <dl>
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-3 border-b border-[#EAECF0] px-5 py-4 last:border-b-0"
              >
                <div>
                  <dt className="text-sm text-[#667085]">{field.label}</dt>
                  <dd className="text-sm font-medium text-[#101828]">
                    {field.value}
                  </dd>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#0052FF]"
                  onClick={() => copyValue(field.value)}
                >
                  <span className="inline-flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </span>
                </button>
              </div>
            ))}
          </dl>
          <div className="mb-5 px-5">
            <Button
              type="button"
              variant="outline"
              className="mt-5 h-10 w-full rounded-lg border-[#D0D5DD]"
              onClick={share}
            >
              Share account details
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
