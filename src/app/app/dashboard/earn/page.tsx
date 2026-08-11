"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function EarnPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Earn");
  }, [setTitle]);

  return (
    <ComingSoon
      title="Earn"
      description="Yield and earn products for your company balance are coming soon."
    />
  );
}
