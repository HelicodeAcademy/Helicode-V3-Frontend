"use client";

import { useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../../layout";
import { SchedulePayrollForm } from "@/components/payroll/schedule-payroll-form";
import { PayrollScheduledModal } from "@/components/payroll/payroll-scheduled-modal";

export default function SchedulePayrollPage() {
  const { setTitle } = useContext(PageTitleContext);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setTitle("Schedule Payroll");
  }, [setTitle]);

  return (
    <>
      <div className="max-w-md mx-auto py-8 flex items-center justify-center min-h-full shrink-0">
        <SchedulePayrollForm onSuccess={() => setShowSuccess(true)} />
      </div>
      <PayrollScheduledModal open={showSuccess} />
    </>
  );
}
