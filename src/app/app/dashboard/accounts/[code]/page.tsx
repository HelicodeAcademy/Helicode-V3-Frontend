"use client";

import { useParams } from "next/navigation";
import { AccountDetail } from "@/components/accounts/account-detail";

export default function AccountDetailPage() {
  const params = useParams<{ code: string }>();
  const currency = (params.code ?? "").toUpperCase();

  return <AccountDetail currency={currency} />;
}
