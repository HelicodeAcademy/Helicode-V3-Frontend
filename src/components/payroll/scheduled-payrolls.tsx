"use client";

import { Button } from "@/components/ui/button";

interface PayrollCard {
  id: string;
  dateCreated: string;
  frequency: string;
  name: string;
  amount: string;
  status: "Active" | "Inactive";
}

const payrolls: PayrollCard[] = [
  {
    id: "1",
    dateCreated: "24/02/2026",
    frequency: "Monthly",
    name: "Helicode Payroll",
    amount: "$100,000",
    status: "Active",
  },
  {
    id: "2",
    dateCreated: "24/02/2026",
    frequency: "Monthly",
    name: "Only Contractor",
    amount: "$100,000",
    status: "Active",
  },
  {
    id: "3",
    dateCreated: "24/02/2026",
    frequency: "Monthly",
    name: "Helicode Payroll",
    amount: "$100,000",
    status: "Active",
  },
  {
    id: "4",
    dateCreated: "24/02/2026",
    frequency: "Monthly",
    name: "Helicode Payroll",
    amount: "$100,000",
    status: "Active",
  },
];

export function ScheduledPayrolls() {
  return (
    <div className="space-y-4 bg-white p-6 rounded-lg">
      <h2 className="text-sm font-medium text-[#475367]">Scheduled Payrolls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {payrolls.map((payroll) => (
          <div
            key={payroll.id}
            className="rounded-lg border border-[#eaeaea] bg-white"
          >
            <div className="">
              {/* Header with Date and Frequency */}
              <div className="flex items-start justify-between bg-[#F8F8F8] p-4 rounded-tl-lg rounded-tr-lg">
                <p className="text-sm text-[#0052FF]">Date Created</p>
                <p className="text-sm font-medium text-[#101828]">
                  {payroll.dateCreated}
                </p>
              </div>

              {/* Frequency and Name */}
              <div className="p-4 bg-white border-t border-[#EAEAEA] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#C4C6D1] mb-1.5 font-medium">
                      {payroll.frequency}
                    </p>
                    <h3 className="text-2xl font-bold">{payroll.name}</h3>
                  </div>
                  <div className="border border-[#CAEFDC] text-[#4D8F72] text-xs font-medium px-2 py-1 rounded-full bg-[#ECFDF3]">
                    {payroll.status}
                  </div>
                </div>

                <hr className="border-dashed border-t border-[#D4D6E2] w-full my-6" />

                <div className="flex items-center justify-between">
                  {/* Amount */}
                  <div className="text-2xl font-bold">{payroll.amount}</div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-[#1f2937] text-white hover:bg-[#1f2937]/90 h-9 px-3 py-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      //   variant="ghost"
                      className="text-[#f04438] bg-[#FFF3F3] hover:bg-transparent px-3 py-2 h-9"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
