"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Download, Loader2, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generatePayslip as generatePayslipService,
  getPayrollGroups,
  PayrollGroup,
} from "@/lib/payroll-service";
import { useTeamStore } from "@/store/team-store";
import { EditPayrollModal } from "./edit-payroll-modal";
import { PayrollDeleteModal } from "./payroll-delete-modal";
import { PayrollStatusModal } from "./payroll-status-modal";

const AVATAR_COLORS = [
  "bg-[#DBEAFE] text-[#1D4ED8]",
  "bg-[#FCE7F3] text-[#BE185D]",
  "bg-[#FEF3C7] text-[#B45309]",
  "bg-[#D1FAE5] text-[#047857]",
];

function ordinal(day: number) {
  const remainder = day % 100;
  if (remainder >= 11 && remainder <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function frequencyLabel(frequency: string, startDate: string) {
  const base =
    frequency.charAt(0) + frequency.slice(1).toLowerCase().replace(/_/g, " ");
  const day = new Date(startDate).getDate();
  if (Number.isNaN(day)) return base;
  return `${base} / On the ${ordinal(day)}`;
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface ScheduledPayrollsProps {
  balance: number;
  onNewSchedule?: () => void;
}

export function ScheduledPayrolls({
  balance,
  onNewSchedule,
}: ScheduledPayrollsProps) {
  const { members } = useTeamStore();
  const [payrolls, setPayrolls] = useState<PayrollGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayroll, setEditingPayroll] = useState<PayrollGroup | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusPayroll, setStatusPayroll] = useState<PayrollGroup | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deletingPayroll, setDeletingPayroll] = useState<PayrollGroup | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [generatingPayslipId, setGeneratingPayslipId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void fetchPayrollGroups();
  }, []);

  const fetchPayrollGroups = async () => {
    try {
      setIsLoading(true);
      const groups = await getPayrollGroups();
      setPayrolls(groups);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch payroll groups",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const peopleCount = useMemo(
    () =>
      payrolls.reduce(
        (sum, payroll) =>
          sum + (payroll.memberCount ?? payroll.teamMembers?.length ?? 0),
        0,
      ),
    [payrolls],
  );

  const getPerRunAmount = (payroll: PayrollGroup) => {
    const ids = new Set((payroll.teamMembers ?? []).map((member) => member.id));
    if (ids.size === 0) return 0;
    return members
      .filter((member) => ids.has(member.id))
      .reduce((sum, member) => sum + (member.amount ?? 0), 0);
  };

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
        `Payment Date: ${new Date(payslipData.paymentDate).toLocaleDateString()}`,
        20,
        45,
      );
      let y = 70;
      pdf.setFont("helvetica", "bold");
      pdf.text("Name", 20, y);
      pdf.text("Amount", 130, y);
      pdf.setFont("helvetica", "normal");
      y += 10;
      payslipData.members.forEach((member) => {
        pdf.text(member.name, 20, y);
        pdf.text(member.amount.toLocaleString(), 130, y);
        y += 10;
      });
      pdf.save(`payslip-${payrollName}.pdf`);
      toast.success("Payslip generated successfully");
    } catch {
      toast.error("Failed to generate payslip");
    } finally {
      setGeneratingPayslipId(null);
    }
  };

  return (
    <>
      <section className="rounded-xl border border-[#EAECF0] bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-5">
          <div>
            <h2 className="text-base font-semibold text-[#0C1424]">
              Payroll schedules
            </h2>
            <p className="mt-1 text-sm text-[#66748C]">
              Groups of people paid together on a recurring date
            </p>
          </div>
          <p className="text-sm text-[#66748C]">
            {peopleCount} {peopleCount === 1 ? "person" : "people"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center border-t border-[#EAECF0] py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0052FF]" />
          </div>
        ) : payrolls.length === 0 ? (
          <div className="border-t border-[#EAECF0] px-5 py-12 text-center text-sm text-[#66748C]">
            No scheduled payrolls yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-220 text-left">
              <thead>
                <tr className="border-y! border-[#EAECF0] text-[11px] font-medium tracking-wide text-[#66748C] uppercase">
                  <th className="px-5 py-3 font-medium">Schedule</th>
                  <th className="px-5 py-3 font-medium">Frequency</th>
                  <th className="px-5 py-3 font-medium">People</th>
                  <th className="px-5 py-3 font-medium">Per run</th>
                  <th className="px-5 py-3 font-medium">Next run</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => {
                  const perRun = getPerRunAmount(payroll);
                  const nextRunDate = payroll.startDate
                    ? format(new Date(payroll.startDate), "MMM d")
                    : "—";
                  const needsFunding = perRun > 0 && balance < perRun;
                  const visiblePeople = (payroll.teamMembers ?? []).slice(0, 4);
                  const extra =
                    (payroll.memberCount ?? payroll.teamMembers?.length ?? 0) -
                    visiblePeople.length;

                  return (
                    <tr
                      key={payroll.id}
                      className="border-b border-[#EAECF0] last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF2FF] text-sm font-semibold text-[#0052FF]">
                            {payroll.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#0C1424]">
                              {payroll.name}
                            </p>
                            <p className="text-sm text-[#66748C]">
                              Created{" "}
                              {payroll.createdAt
                                ? format(
                                    new Date(payroll.createdAt),
                                    "MMM d, yyyy",
                                  )
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0C1424]">
                        {frequencyLabel(payroll.frequency, payroll.startDate)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center">
                          {visiblePeople.map((person, index) => (
                            <Avatar
                              key={person.id}
                              className="-ml-2 size-8 border-2 border-white first:ml-0"
                            >
                              <AvatarFallback
                                className={`text-[10px] font-semibold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                              >
                                {initials(person.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {extra > 0 && (
                            <span className="-ml-2 inline-flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#F2F4F7] text-[10px] font-semibold text-[#66748C]">
                              +{extra}
                            </span>
                          )}
                          {visiblePeople.length === 0 && (
                            <span className="text-sm text-[#66748C]">
                              {payroll.memberCount ?? 0}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#0C1424]">
                        {formatMoney(perRun)} USD
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#0C1424]">
                          {nextRunDate}
                        </p>
                        {needsFunding && (
                          <p className="text-xs font-medium text-[#9A5B00]">
                            Needs funding
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-medium text-[#66748C]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              payroll.isActive ? "bg-[#12B76A]" : "bg-[#98A2B3]"
                            }`}
                          />
                          {payroll.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!payroll.isActive && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg border-none px-3 text-sm font-medium text-[#0052FF] bg-[#E9F0FF]"
                              onClick={() => {
                                setStatusPayroll(payroll);
                                setShowStatusModal(true);
                              }}
                            >
                              Activate
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-[#66748C] border border-[#E2E7F0]"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPayroll(payroll);
                                  setShowEditModal(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={generatingPayslipId === payroll.id}
                                onClick={() =>
                                  void generatePayslip(payroll.id, payroll.name)
                                }
                              >
                                {generatingPayslipId === payroll.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Download className="mr-2 h-3.5 w-3.5" />
                                    Generate payslip
                                  </>
                                )}
                              </DropdownMenuItem>
                              {payroll.isActive && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setStatusPayroll(payroll);
                                    setShowStatusModal(true);
                                  }}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-[#f04438] focus:text-[#f04438]"
                                onClick={() => {
                                  setDeletingPayroll(payroll);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-[#EAECF0] px-5 py-4">
          {onNewSchedule ? (
            <button
              type="button"
              onClick={onNewSchedule}
              className="text-sm font-semibold text-[#0052FF]"
            >
              + New payroll schedule
            </button>
          ) : (
            <Link
              href="/dashboard/payroll?schedule=1"
              className="text-sm font-semibold text-[#0052FF]"
            >
              + New payroll schedule
            </Link>
          )}
        </div>
      </section>

      {editingPayroll && showEditModal && (
        <EditPayrollModal
          payroll={editingPayroll}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingPayroll(null);
            void fetchPayrollGroups();
          }}
        />
      )}

      {statusPayroll && (
        <PayrollStatusModal
          payrollId={statusPayroll.id}
          payrollName={statusPayroll.name}
          isActive={statusPayroll.isActive}
          open={showStatusModal}
          onOpenChange={setShowStatusModal}
          onSuccess={() => {
            setShowStatusModal(false);
            setStatusPayroll(null);
            void fetchPayrollGroups();
          }}
        />
      )}

      {deletingPayroll && (
        <PayrollDeleteModal
          payrollId={deletingPayroll.id}
          payrollName={deletingPayroll.name}
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onSuccess={() => {
            setShowDeleteModal(false);
            setDeletingPayroll(null);
            void fetchPayrollGroups();
          }}
        />
      )}
    </>
  );
}
