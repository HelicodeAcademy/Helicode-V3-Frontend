"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { AccountsOverview } from "@/components/accounts/accounts-overview";

export default function AccountsPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Accounts");
  }, [setTitle]);

  return <AccountsOverview />;
}
