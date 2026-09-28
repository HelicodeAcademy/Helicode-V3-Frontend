"use client";

import { useContext, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageTitleContext } from "../../layout";
import { getAccount } from "@/lib/local-accounts";
import { AccountDetail } from "@/components/accounts/account-detail";
import Link from "next/link";

export default function AccountDetailPage() {
  const { setTitle } = useContext(PageTitleContext);
  const params = useParams<{ code: string }>();
  const account = getAccount(params.code);

  useEffect(() => {
    setTitle(account?.name ?? "Accounts");
  }, [account?.name, setTitle]);

  if (!account) {
    return (
      <div className="px-6 py-10">
        <p className="text-sm text-[#667085]">This account is not available.</p>
        <Link href="/dashboard/accounts" className="mt-3 inline-block text-sm font-semibold text-[#0052FF]">
          Back to accounts
        </Link>
      </div>
    );
  }

  return <AccountDetail account={account} />;
}
