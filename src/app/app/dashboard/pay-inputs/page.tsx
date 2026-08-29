"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function PayInputsPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Pay Inputs");
  }, [setTitle]);

  return (
    <ComingSoon
      title="Pay Inputs"
      description="Manage bonuses, deductions, and other pay inputs here. This feature is coming soon."
    />
  );
}
