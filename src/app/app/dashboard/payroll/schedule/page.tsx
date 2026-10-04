"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePayrollPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/payroll?schedule=1");
  }, [router]);

  return null;
}
