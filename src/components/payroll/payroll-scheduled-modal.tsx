"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface PayrollScheduledModalProps {
  open: boolean;
}

export function PayrollScheduledModal({ open }: PayrollScheduledModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-102.5 w-full mx-4 p-1">
        <Image
          src="/payroll/modal-illustration.png"
          alt="illustration"
          width={410}
          height={223}
        />

        <div className="px-6 mt-6">
          <h2 className="text-2xl font-bold text-[#101828] mb-10">
            Payroll Scheduled
          </h2>

          <Button variant={"primary"} className="mb-6">
            <Link href="/dashboard">Go to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
