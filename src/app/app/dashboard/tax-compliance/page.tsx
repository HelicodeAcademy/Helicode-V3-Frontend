"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { TaxCompliance } from "@/components/tax-compliance/tax-compliance";

export default function TaxCompliancePage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Tax & Compliance");
  }, [setTitle]);

  return <TaxCompliance />;
}
