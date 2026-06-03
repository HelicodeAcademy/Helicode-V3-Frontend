"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getPayrollGroups,
  PayrollGroup,
  generatePayslip as generatePayslipService,
} from "@/lib/payroll-service";
import toast from "react-hot-toast";
import { EditPayrollModal } from "./edit-payroll-modal";
import { format } from "date-fns";
import { PayrollStatusModal } from "./payroll-status-modal";
// import html2pdf from "html2pdf.js";
import { Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";

export function ScheduledPayrolls() {
  const [payrolls, setPayrolls] = useState<PayrollGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayroll, setEditingPayroll] = useState<PayrollGroup | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusPayroll, setStatusPayroll] = useState<PayrollGroup | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [generatingPayslipId, setGeneratingPayslipId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchPayrollGroups();
  }, []);

  const fetchPayrollGroups = async () => {
    try {
      setIsLoading(true);
      const groups = await getPayrollGroups();
      setPayrolls(groups);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch payroll groups";
      toast.error(errorMessage);
      console.error("Payroll groups fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (payroll: PayrollGroup) => {
    setEditingPayroll(payroll);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingPayroll(null);
    fetchPayrollGroups();
  };

  const handleStatusClick = (payroll: PayrollGroup) => {
    setStatusPayroll(payroll);
    setShowStatusModal(true);
  };

  const handleStatusSuccess = () => {
    setShowStatusModal(false);
    setStatusPayroll(null);
    fetchPayrollGroups();
  };

  // Generate payslip for specific payroll group

  const generatePayslip = async (payrollId: string, payrollName: string) => {
    try {
      setGeneratingPayslipId(payrollId);

      const payslipData = await generatePayslipService(payrollId);

      const pdf = new jsPDF();

      pdf.setFontSize(20);
      pdf.text("Payslip", 20, 20);

      pdf.setFontSize(12);
      pdf.text(`Payroll: ${payrollName}`, 20, 35);

      pdf.text(
        `Payment Date: ${new Date(
          payslipData.paymentDate,
        ).toLocaleDateString()}`,
        20,
        45,
      );

      pdf.text(
        `Generated At: ${new Date(
          payslipData.generatedAt,
        ).toLocaleDateString()}`,
        20,
        55,
      );

      let y = 80;

      pdf.setFont("helvetica", "bold");
      pdf.text("Name", 20, y);
      pdf.text("Role", 80, y);
      pdf.text("Amount", 130, y);
      pdf.text("Currency", 170, y);

      pdf.setFont("helvetica", "normal");

      y += 10;

      payslipData.members.forEach((member) => {
        pdf.text(member.name, 20, y);
        pdf.text(member.role, 80, y);
        pdf.text(member.amount.toLocaleString(), 130, y);
        pdf.text(member.currency, 170, y);

        y += 10;
      });

      y += 10;

      pdf.setFont("helvetica", "bold");
      pdf.text(`Total: ${payslipData.totalAmount.toLocaleString()}`, 130, y);

      pdf.save(`payslip-${payrollName}.pdf`);

      toast.success("Payslip generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate payslip");
    } finally {
      setGeneratingPayslipId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#101828]">
          Scheduled Payrolls
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#0166f4] mx-auto mb-3"></div>
            <p className="text-[#667085]">Loading payroll groups...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 bg-white p-6 rounded-lg">
        <h2 className="text-sm font-medium text-[#475367]">
          Scheduled Payrolls
        </h2>
        {payrolls.length === 0 ? (
          <div className="rounded-lg border border-[#eaeaea] bg-white p-12 text-center">
            <p className="text-[#667085]">
              No scheduled payrolls yet. Create your first payroll group.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payrolls.map((payroll) => (
              <div
                key={payroll.id}
                className="rounded-lg border border-[#eaeaea] bg-[#F8F8F8]"
              >
                <div className="">
                  {/* Header with Date */}
                  <div className="flex items-start justify-between bg-[#F8F8F8] p-4 rounded-t-lg">
                    <p className="text-sm text-[#0052FF]">Date Created</p>
                    <p className="text-sm font-medium text-[#101828]">
                      {format(payroll.createdAt as string, "MMM dd, yyyy") ||
                        new Date().toISOString()}
                    </p>
                  </div>

                  {/* Frequency and Name */}
                  <div className="p-4 bg-white border-t border-[#EAEAEA] rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#C4C6D1] mb-1.5 font-medium">
                          {payroll.frequency}
                        </p>
                        <h3 className="text-2xl font-bold">{payroll.name}</h3>
                      </div>
                      <div className="border border-[#CAEFDC] text-[#4D8F72] text-xs font-medium px-2 py-1 rounded-full bg-[#ECFDF3]">
                        {payroll.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <hr className="border-dashed border-t border-[#D4D6E2] w-full my-6" />

                    <div className="flex items-center justify-between">
                      {/* Amount */}
                      <div></div>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            generatePayslip(payroll.id, payroll.name)
                          }
                          size="sm"
                          disabled={generatingPayslipId === payroll.id}
                        >
                          {generatingPayslipId === payroll.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Generate Payslip
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleEditClick(payroll)}
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className={`hover:bg-transparent px-3 py-2 h-9 ${
                            payroll.isActive
                              ? "text-[#f04438] bg-[#FFF3F3]"
                              : "text-[#0052FF] bg-[#ECF2FF]"
                          }`}
                          onClick={() => handleStatusClick(payroll)}
                        >
                          {payroll.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingPayroll && showEditModal && (
        <EditPayrollModal
          payroll={editingPayroll}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {statusPayroll && (
        <PayrollStatusModal
          payrollId={statusPayroll.id}
          payrollName={statusPayroll.name}
          isActive={statusPayroll.isActive}
          open={showStatusModal}
          onOpenChange={setShowStatusModal}
          onSuccess={handleStatusSuccess}
        />
      )}
    </>
  );
}
