import { useState } from "react";
import { Button } from "../ui/button";
import { deletePayrollGroup } from "@/lib/payroll-service";
import toast from "react-hot-toast";

interface PayrollDeleteModalProps {
  payrollId: string;
  payrollName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PayrollDeleteModal({
  payrollId,
  payrollName,
  open,
  onOpenChange,
  onSuccess,
}: PayrollDeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await deletePayrollGroup(payrollId);
      toast.success("Payroll group deleted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete payroll group",
      );
      console.error("Payroll group delete error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold text-[#101828] mb-2">
          Delete Payroll Group
        </h2>
        <p className="text-sm text-[#667085] mb-6">
          Are you sure you want to delete &quot;{payrollName}&quot;? This cannot
          be undone. Team members will no longer be paid on this schedule.
        </p>
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
            className="flex-1 bg-red-400 text-white hover:bg-[#f04438]/90"
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
