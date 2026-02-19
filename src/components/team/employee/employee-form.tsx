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
import Image from "next/image";
interface ContractFormProps {
  onSubmit: () => void;
}

export function EmployeeContractForm({ onSubmit }: ContractFormProps) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="max-w-112.5 mx-auto w-full">
        <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2">
          Add Employee
        </h1>
        <p className="text-[#444444] text-sm mb-8">
          Onboard a new team member and get them ready to receive payments in
          just a few clicks.
        </p>

        <div className="space-y-5">
          {/* Monthly Rate */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A]  mb-1.5">
              Monthly rate <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <Image
                  src="/team/currency.svg"
                  width={20}
                  height={20}
                  alt="Currency icon"
                />
              </div>
              <Input type="number" placeholder="5000" className="pl-10" />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A]  mb-1.5">
              Currency <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <Image
                  src="/team/dollar.svg"
                  width={20}
                  height={20}
                  alt="Currency icon"
                />
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
            <Input placeholder="Engineering" />
          </div>

          {/* Upload Contract */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Upload contract <span className="text-[#f04438]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]">
                <Image
                  src="/team/upload.svg"
                  width={24}
                  height={24}
                  alt="Upload icon"
                />
              </div>
              <Input
                type="file"
                placeholder="Upload PDF File"
                className="pl-10"
              />
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
