"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface PayrollOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayNow: () => void;
}

const employees = [
  { id: 1, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 2, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 3, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 4, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 5, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 6, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 7, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
  { id: 8, name: "Vandross Idiake", role: "Software Engineer", amount: 2450 },
];

export function PayrollOverviewModal({
  open,
  onOpenChange,
  onPayNow,
}: PayrollOverviewModalProps) {
  const totalPayout = employees.reduce((sum, emp) => sum + emp.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl gap-0 bg-[#F8F8F8]"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0F112A]">Helicode Inc</h2>
            <p className="text-base text-[#475367]">Payroll overview</p>
          </div>
          <div className="text-xs text-[#0052FF] font-medium border border-[#E3ECFF] bg-[#ECF2FF] px-2 py-1 rounded-full">
            {employees.length} Members
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Employees Grid */}
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-3 p-4 border border-[#E4E7EC] rounded-md bg-white hover:bg-[#f9fafb]"
              >
                <div className="h-7 w-7 rounded-full bg-[#FFED94] flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                  VI
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#101928] truncate">
                    {employee.name}
                  </p>
                  <p className="text-xs text-[#BEBEBE] truncate">
                    {employee.role}
                  </p>
                </div>
                <div className="text-sm font-semibold text-[#101828] shrink-0 bg-[#F2F2F2] px-2 py-1 rounded-full">
                  ${employee.amount.toLocaleString()}.00
                </div>
              </div>
            ))}
          </div>

          {/* Total Payout */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#000000] mb-1">Total Payout</p>
              <h3 className="text-3xl font-bold text-[#000000]">
                ${totalPayout.toLocaleString()}.00
              </h3>
            </div>
            <button
              onClick={onPayNow}
              className="bg-[#363636] text-white hover:bg-[#1f2937]/90 px-3 py-2 rounded-md font-medium transition-colors"
            >
              Pay now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
