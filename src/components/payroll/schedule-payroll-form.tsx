"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useTeamStore } from "@/store/team-store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createPayrollGroup } from "@/lib/payroll-service";
import { type TeamMember } from "@/store/team-store";

interface SchedulePayrollFormProps {
  onSuccess?: () => void;
}

export function SchedulePayrollForm({ onSuccess }: SchedulePayrollFormProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [recipients, setRecipients] = useState<TeamMember[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { members } = useTeamStore();

  const handleAddRecipient = (member: TeamMember) => {
    if (!recipients.find((r) => r.id === member.id)) {
      setRecipients([...recipients, member]);
    }
    setSearchInput("");
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSelectAll = () => {
    setRecipients(members);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a payroll group name.");
      return;
    }

    if (recipients.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      type Frequency =
        | "WEEKLY"
        | "BIWEEKLY"
        | "MONTHLY"
        | "QUARTERLY"
        | "ANNUAL";

      const frequencyMap: Record<string, Frequency> = {
        weekly: "WEEKLY",
        biweekly: "BIWEEKLY",
        monthly: "MONTHLY",
        quarterly: "QUARTERLY",
        annual: "ANNUAL",
      };

      await createPayrollGroup({
        name: groupName,
        teamIds: recipients.map((r) => r.id),
        frequency: frequencyMap[frequency.toLowerCase()] || "MONTHLY",
        startDate: format(startDate!, "yyyy-MM-dd"),
      });
      toast.success("Payroll group created successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/payroll");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create payroll group";
      toast.error(errorMessage);
      console.error("Payroll group creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    `${member.fullName}`.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <div className="max-w-md mx-auto w-full bg-white p-6 rounded-lg border border-[#F2F2F2]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2">
            Payroll group name <span className="text-[#FF383C]">*</span>
          </label>
          <Input
            type="text"
            placeholder="Helicode Payroll"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border-[#e5e7eb] focus:border-[#0166f4]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2">
            Select payroll frequency <span className="text-[#FF383C]">*</span>
          </label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-full border-[#e5e7eb] focus:border-[#0166f4]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2">
            Add recipients <span className="text-[#FF383C]">*</span>
          </label>
          <div className="flex gap-2 mb-4 relative">
            <Input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border-[#e5e7eb] focus:border-[#0166f4] flex-1"
            />
            <Button
              type="button"
              onClick={handleSelectAll}
              className="bg-[#0052FF] rounded-[40px] text-white hover:bg-[#0166f4]/90 px-2 h-6 absolute right-2 top-1/2 -translate-y-1/2"
            >
              Select all team <span className="mr-1">✓</span>
            </Button>
          </div>

          {/* Recipient Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {recipients.map((recipient, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 bg-blue-50 text-[#0166f4] px-3 py-1 rounded-full text-sm"
              >
                <span>{recipient.fullName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(idx)}
                  className="hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Search Results Dropdown */}
          {searchInput && (
            <div className="border border-[#e5e7eb] rounded-lg bg-white">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleAddRecipient(member)}
                  className="w-full text-left px-4 py-2 hover:bg-[#f9fafb] text-sm text-[#101828]"
                >
                  {member.fullName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#101828] mb-3">
            Select start date <span className="text-[#FF383C]">*</span>
          </label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartDateOpen(false);
                }}
                autoFocus
                captionLayout="dropdown-years"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant={"primary"}
            className=""
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex justify-between items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              "Schedule Payroll"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
