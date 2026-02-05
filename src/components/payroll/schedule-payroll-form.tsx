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

interface SchedulePayrollFormProps {
  onSuccess?: () => void;
}

export function SchedulePayrollForm({ onSuccess }: SchedulePayrollFormProps) {
  const [frequency, setFrequency] = useState("monthly");
  const [payDate, setPayDate] = useState("monthly");
  const [groupName, setGroupName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-[#0F112A] mb-3">
            Select payroll frequency <span className="text-[#FF383C]">*</span>
          </label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-full">
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
          <label className="block text-lg font-medium text-[#0F112A] mb-3">
            Select employee pay date <span className="text-[#FF383C]">*</span>
          </label>
          <Select value={payDate} onValueChange={setPayDate}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st">1st of the month</SelectItem>
              <SelectItem value="15th">15th of the month</SelectItem>
              <SelectItem value="last">Last day of the month</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-lg font-medium text-[#0F112A] mb-3">
            Payroll group name <span className="text-[#FF383C]">*</span>
          </label>
          <Input
            type="text"
            placeholder="Helicode Payroll"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
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
