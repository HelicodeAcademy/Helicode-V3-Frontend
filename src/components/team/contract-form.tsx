"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, DollarSign } from "lucide-react";

interface ContractFormProps {
  onSubmit: () => void;
}

export function ContractForm({ onSubmit }: ContractFormProps) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="max-w-112.5 mx-auto w-full">
        <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2">
          Add Contractor
        </h1>
        <p className="text-[#444444] text-sm mb-8">
          Create a contract for an individual contractor
        </p>

        <div className="space-y-5">
          {/* Monthly Rate */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Monthly rate <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-[#667085]" />
              </div>
              <Input type="number" placeholder="5000" className="pl-10" />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Currency <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-[#2775ca] flex items-center justify-center">
                <span className="text-white text-xs font-bold">$</span>
              </div>
              <Input value="USDC" readOnly className="pl-10" />
            </div>
          </div>

          {/* Payment Frequency */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Payment Frequency <span className="text-[#FF3F3F]">*</span>
            </label>
            <Select defaultValue="monthly">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Department <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input placeholder="Engineering" className="" />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Start date <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#000000]" />
              <Input type="text" placeholder="DD:MM:YYYY" className="pl-10" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={onSubmit} variant={"primary"} className="w-32">
            Create New Hire
          </Button>
        </div>
      </div>
    </div>
  );
}
