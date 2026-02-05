"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PayrollScheduledModalProps {
  open: boolean;
}

export function PayrollScheduledModal({ open }: PayrollScheduledModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-8">
        <div className="h-40 bg-[#f3f4f6] rounded-lg mb-8"></div>

        <h2 className="text-2xl font-bold text-[#101828] mb-4">
          Payroll Scheduled
        </h2>

        <p className="text-sm text-[#444444] mb-8">
          You can now start adding hires and company admins to grow your team on
          Helicode. If you have any questions, don&apos;t hesitate to drop us a
          line at{" "}
          <a href="mailto:help@helicode.xyz" className="text-[#0052FF]">
            help@helicode.xyz
          </a>
          .
        </p>

        <Link href="/dashboard">
          <Button variant={"primary"} className="hover:bg-[#1f2937]/90">
            Go to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
