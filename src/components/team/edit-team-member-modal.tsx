"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/store/team-store";
import { apiCall } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { updateTeamMember } from "@/lib/team-service";

interface EditTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSuccess: () => void;
}

interface EditForm {
  firstName: string;
  lastName: string;
  role: string;
  startDate: string;
  amount: string;
}

interface EditErrors {
  firstName?: string;
  lastName?: string;
  role?: string;
  startDate?: string;
  amount?: string;
}

export function EditTeamMemberModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditTeamMemberModalProps) {
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    role: "",
    startDate: "",
    amount: "",
  });
  const [errors, setErrors] = useState<EditErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Seed form when member changes
  useEffect(() => {
    if (member) {
      const [firstName = "", ...rest] = member.fullName.split(" ");
      setForm({
        firstName,
        lastName: rest.join(" "),
        role: member.role,
        startDate: member.dateJoined ?? "",
        amount: String(member.amount),
      });
      setErrors({});
      setShowSuccess(false);
    }
  }, [member]);

  const setField = (field: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required.";
    if (!form.lastName.trim()) e.lastName = "Required.";
    if (!form.role.trim()) e.role = "Required.";
    if (!form.startDate) e.startDate = "Required.";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !member) return;
    setIsSubmitting(true);
    try {
      await updateTeamMember(member.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        startDate: form.startDate,
        amount: String(form.amount),
      });
      setShowSuccess(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update team member.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToTeam = () => {
    setShowSuccess(false);
    onOpenChange(false);
    onSuccess();
  };

  const parsedDate =
    form.startDate && isValid(parseISO(form.startDate))
      ? parseISO(form.startDate)
      : undefined;

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md gap-0 p-2"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Team member updated</DialogTitle>

          <Image
            src="/payroll/modal-illustration.png"
            alt="Success"
            width={384}
            height={220}
            className="w-full rounded-md"
          />
          <div className="px-4 pt-6 pb-6">
            <h2 className="text-2xl font-bold text-[#000000] mb-3">
              Team member updated
            </h2>
            <p className="text-sm text-[#444444] mb-8">
              The team member&apos;s details have been successfully updated.
            </p>
            <Button
              variant="primary"
              onClick={handleBackToTeam}
              className="hover:bg-[#101828]/90"
            >
              Back to team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Edit Team Member
        </DialogTitle>
        <p className="text-sm text-[#475367] -mt-2">
          Update information and manage how this team member works with your
          team.
        </p>

        <div className="space-y-4 mt-1">
          {/* First & Last name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                First Name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="John"
                className={errors.firstName ? "border-red-400" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                Last Name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Doe"
                className={errors.lastName ? "border-red-400" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-[#475367] -mt-2">
            As it appears on their government issued identification
          </p>

          {/* Job title */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Job title <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              placeholder="Software Engineer"
              className={errors.role ? "border-red-400" : ""}
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Start date <span className="text-[#FF3F3F]">*</span>
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-md border bg-white px-3 text-sm text-left",
                    parsedDate ? "text-[#101928]" : "text-[#667085]",
                    errors.startDate ? "border-red-400" : "border-[#E4E7EC]",
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-[#667085]" />
                  {parsedDate
                    ? format(parsedDate, "MMM d, yyyy")
                    : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedDate}
                  onSelect={(date) => {
                    if (date) {
                      setField("startDate", format(date, "yyyy-MM-dd"));
                      setCalendarOpen(false);
                    }
                  }}
                  autoFocus
                  captionLayout="dropdown-years"
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* Monthly rate */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Monthly rate <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#667085] font-medium">
                $
              </span>
              <Input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="5000"
                className={cn("pl-7", errors.amount ? "border-red-400" : "")}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="hover:bg-[#101828]/90"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
