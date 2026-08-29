"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function PayslipsPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Payslips");
  }, [setTitle]);

  return (
    <ComingSoon
      title="Payslips"
      description="View and download employee payslips from one place. This feature is coming soon."
    />
  );
}
