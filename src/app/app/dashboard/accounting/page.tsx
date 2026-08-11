"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AccountingPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Accounting");
  }, [setTitle]);

  return (
    <ComingSoon
      title="Accounting"
      description="Accounting tools and exports will be available here. This feature is coming soon."
    />
  );
}
