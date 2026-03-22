import { useState } from "react";
import { Button } from "../ui/button";
import { updatePayrollGroupStatus } from "@/lib/payroll-service";
import toast from "react-hot-toast";

interface PayrollStatusModalProps {
  payrollId: string;
  payrollName: string;
  isActive: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PayrollStatusModal({
  payrollId,
  payrollName,
  isActive,
  open,
  onOpenChange,
  onSuccess,
}: PayrollStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);

      const newStatus = !isActive;
      await updatePayrollGroupStatus(payrollId, newStatus);

      const action = newStatus ? "reactivated" : "reactivated";
      toast.success(`Payroll group ${action} successfully`);

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update payroll group status";
      toast.error(errorMessage);
      console.error("Payroll group update error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const action = isActive ? "deactivate" : "activate";
  const title = isActive
    ? "Deactivate Payroll Group"
    : "Activate Payroll Group";
  const message = isActive
    ? `Are you sure you want to deactivate "${payrollName}"? Team members will not receive payments until it's reactivated.`
    : `Are you sure you want to reactivate "${payrollName}"?`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold text-[#101828] mb-2">{title}</h2>

        {/* Message */}
        <p className="text-sm text-[#667085] mb-6">{message}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1 border-[#d0d5dd]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 ${
              isActive
                ? "bg-[#f04438] text-white hover:bg-[#f04438]/90"
                : "bg-[#219d53] text-white hover:bg-[#219d53]/90"
            }`}
          >
            {isSubmitting
              ? "Processing..."
              : action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        </div>
      </div>
    </div>
  );
}
