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
import { Calendar } from "lucide-react";
import Image from "next/image";

interface ContractorDetailsFormProps {
  onNext: () => void;
}

export function ContractorDetailsForm({ onNext }: ContractorDetailsFormProps) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="max-w-112.5 mx-auto">
        <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2">
          Add Contractor
        </h1>
        <p className="text-[#444444] text-sm mb-8">
          Create a contract for an individual contractor
        </p>

        <div className="space-y-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                First Name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input placeholder="Enter your first name" className="" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                Last Name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input placeholder="Enter your last name" className="" />
            </div>
          </div>
          <p className="text-xs text-[#475367] -mt-3">
            As it appears on their government issued identification
          </p>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Email address <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Image
                src="/signup/mail-01.png"
                alt="Email Icon"
                width={18}
                height={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-[#475367] mt-1.5">
              As it appears on their government issued identification
            </p>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Country <span className="text-[#FF3F3F]">*</span>
            </label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="rw">Rwanda</SelectItem>
                <SelectItem value="ke">Kenya</SelectItem>
                <SelectItem value="gh">Ghana</SelectItem>
                <SelectItem value="sg">Singapore</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#475367] mt-1.5">
              Country of employment
            </p>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Job title <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input placeholder="Software Engineer" className="" />
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
          <Button variant={"primary"} onClick={onNext} className="w-13.5">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
