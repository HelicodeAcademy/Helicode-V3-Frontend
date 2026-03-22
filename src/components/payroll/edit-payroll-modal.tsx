import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { X, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { updatePayrollGroup, PayrollGroup } from "@/lib/payroll-service";
import { TeamMember } from "@/store/team-store";
import toast from "react-hot-toast";
import { useTeamStore } from "@/store/team-store";
import { format } from "date-fns";

interface EditPayrollModalProps {
  payroll: PayrollGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPayrollModal({
  payroll,
  open,
  onOpenChange,
  onSuccess,
}: EditPayrollModalProps) {
  const { members } = useTeamStore();

  const [groupName, setGroupName] = useState(payroll.name);
  const [frequency, setFrequency] = useState(payroll.frequency);
  const [startDate, setStartDate] = useState<Date | undefined>(
    payroll.startDate ? new Date(payroll.startDate) : undefined,
  );
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payroll.teamMembers && payroll.teamMembers.length > 0) {
      const selectedMemberIds = payroll.teamMembers.map((tm) => tm.id);
      const preselected = members.filter((m) =>
        selectedMemberIds.includes(m.id),
      );
      setSelectedMembers(preselected);
    }
  }, [members, payroll.teamMembers]);

  const handleAddMember = (member: TeamMember) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setSearchInput("");
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a payroll group name");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one team member");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePayrollGroup(payroll.id, {
        name: groupName,
        teamIds: selectedMembers.map((m) => m.id),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        frequency: frequency as any,
        startDate: format(startDate, "yyyy-MM-dd"),
      });

      toast.success("Payroll group updated successfully!");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update payroll group";
      toast.error(errorMessage);
      console.error("Payroll update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.fullName.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payroll Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Group Name */}
          <div>
            <label
              htmlFor="GroupName"
              className="block text-sm font-medium text-[#0F112A] mb-2"
            >
              Payroll Group Name <span className="text-[#FF383C]">*</span>
            </label>

            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g Engineering Team Payroll"
              id="GroupName"
            />
          </div>

          {/* Start Date and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-2">
                Start Date <span className="text-[#FF383C]">*</span>
              </label>

              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "MMM dd, yyyy")
                      : "Pick a date"}
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

            {/* Frequency */}
            <div>
              <label
                htmlFor="frequency"
                className="block text-sm font-medium text-[#0F112A] mb-2"
              >
                Frequency <span className="text-[#FF383C]">*</span>
              </label>

              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label
              htmlFor="teamMembers"
              className="block text-sm font-medium text-[#0F112A] mb-2"
            >
              Team Members <span className="text-[#FF383C]">*</span>
            </label>

            <div className="relative mb-4">
              <Input
                placeholder="Search team members..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border-[#e5e7eb] focus:border-[#0166f4]"
              />

              {searchInput && (
                <div className="absolute top-full left-0 right-0 border border-[#e5e7eb] rounded-lg bg-white mt-1 max-h-48 overflow-y-auto z-10">
                  {filteredMembers.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-[#667085]">
                      No members found
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleAddMember(member)}
                        className="w-full text-left px-4 py-2 hover:bg-[#f9fafb] text-sm text-[#101828]"
                      >
                        {member.fullName}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Members */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="inline-flex items-center gap-2 bg-blue-50 text-[#0166f4] px-3 py-1 rounded-full text-sm"
                >
                  <span>{member.fullName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              ) : (
                "Update Payroll"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
