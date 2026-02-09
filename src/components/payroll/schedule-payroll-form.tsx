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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { X } from "lucide-react";

interface SchedulePayrollFormProps {
  onSuccess?: () => void;
}

const teamMembers = [
  { id: 1, name: "Vandross Idiake" },
  { id: 2, name: "Flyin Odebunmi" },
  { id: 3, name: "John Doe" },
  { id: 4, name: "Jane Smith" },
];

export function SchedulePayrollForm({ onSuccess }: SchedulePayrollFormProps) {
  const [groupName, setGroupName] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [recipients, setRecipients] = useState<typeof teamMembers>([
    { id: 1, name: "Vandross Idiake" },
    { id: 2, name: "Flyin Odebunmi" },
    { id: 3, name: "Vandross Idiake" },
  ]);
  const [searchInput, setSearchInput] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleAddRecipient = (member: (typeof teamMembers)[0]) => {
    if (!recipients.find((r) => r.id === member.id && r.name === member.name)) {
      setRecipients([...recipients, member]);
    }
    setSearchInput("");
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSelectAll = () => {
    setRecipients(teamMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess();
    }
  };

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <div className="max-w-md mx-auto w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2">
            Payroll group name <span className="text-red-500">*</span>
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
                <span>{recipient.name}</span>
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
                  {member.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#101828] mb-3">
            Select start date <span className="text-[#FF383C]">*</span>
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-[#e5e7eb] focus:border-[#0166f4]"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant={"primary"}
            className="bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
          >
            Schedule Payroll
          </Button>
        </div>
      </form>
    </div>
  );
}
