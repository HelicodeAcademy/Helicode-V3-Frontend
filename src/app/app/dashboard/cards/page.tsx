"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function CardsPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Cards");
  }, [setTitle]);

  return (
    <ComingSoon
      title="Cards"
      description="Company cards and spend management will live here. This feature is coming soon."
    />
  );
}
