"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function ReportsPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Reports");
  }, [setTitle]);

  return (
    <ComingSoon
      title="Reports"
      description="Payroll and workforce reports will live here. This feature is coming soon."
    />
  );
}
