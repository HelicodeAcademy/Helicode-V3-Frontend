"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const metrics = [
  {
    label: "Total Payroll Processed",
    value: "$100,200.80",
    icon: "💳",
  },
  {
    label: "Number of Payments",
    value: "350",
    icon: "📊",
  },
];

export function PayrollMetrics() {
  const [activeMetric] = useState("Last 30 days");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[#eaeaea] bg-white p-6 flex justify-between items-center"
        >
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-base text-[#475367] mb-4 font-medium">
                  {metric.label}
                </p>
                <h3 className="text-[2.5rem] font-bold text-[#1C232D]">
                  {metric.value}
                </h3>
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm text-[#475367] font-medium hover:text-[#101828] border border-[#D0D5DD] rounded-lg px-4 py-2">
              {activeMetric}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="">
            <Image
              src="/wallet/wallet.svg"
              alt="payroll icon"
              width={136}
              height={107}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
