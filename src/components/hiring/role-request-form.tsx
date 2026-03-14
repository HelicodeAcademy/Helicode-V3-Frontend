"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar as CalendarIcon } from "lucide-react";
import Image from "next/image";

interface RoleRequestFormData {
  roleTitle: string;
  roleType: string;
  seniority: string;
  workStyle: string;
  expectedStartDate: string;
  salaryRange: string;
  preferredLocation: string;
  workerType: string;
}

interface RoleRequestFormProps {
  onSubmit?: (data: RoleRequestFormData) => void;
}

export function RoleRequestForm({ onSubmit }: RoleRequestFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleRequestFormData>({
    defaultValues: {
      roleTitle: "",
      roleType: "",
      seniority: "",
      workStyle: "",
      expectedStartDate: "",
      salaryRange: "",
      preferredLocation: "",
      workerType: "",
    },
  });

  const expectedStartDate = watch("expectedStartDate");

  const handleFormSubmit = (data: RoleRequestFormData) => {
    onSubmit?.(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5 max-w-md"
    >
      {/* Role Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          Role title <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          {...register("roleTitle", { required: true })}
          placeholder="Backend Engineer"
          className=""
        />
      </div>

      {/* Role Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          Role type <span className="text-[#FF3F3F]">*</span>
        </label>
        <Select onValueChange={(value) => setValue("roleType", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Full-time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Seniority */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          Seniority <span className="text-[#FF3F3F]">*</span>
        </label>
        <Select onValueChange={(value) => setValue("seniority", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Junior" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="mid">Mid-level</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* How will they work */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          How will they work? <span className="text-[#FF3F3F]">*</span>
        </label>
        <Select onValueChange={(value) => setValue("workStyle", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Remote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expected Start Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#101828]">
          Expected Start date <span className="text-[#f04438]">*</span>
        </label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`flex h-10 w-full items-center gap-3 rounded-md border bg-white px-3 text-sm text-left ${
                expectedStartDate ? "text-[#101928]" : "text-[#667085]"
              } ${errors.expectedStartDate ? "border-red-400" : "border-[#E4E7EC]"}`}
            >
              <CalendarIcon className="h-5 w-5 shrink-0 text-[#667085]" />
              {expectedStartDate
                ? format(parseISO(expectedStartDate), "MMM d, yyyy")
                : "Pick a date"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                expectedStartDate ? parseISO(expectedStartDate) : undefined
              }
              onSelect={(date) => {
                if (date) {
                  setValue("expectedStartDate", format(date, "yyyy-MM-dd"), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setCalendarOpen(false);
                }
              }}
              autoFocus
              captionLayout="dropdown-years"
            />
          </PopoverContent>
        </Popover>
        <input
          type="hidden"
          {...register("expectedStartDate", { required: true })}
        />
        {errors.expectedStartDate && (
          <p className="text-xs text-red-500 mt-1">
            Expected start date is required.
          </p>
        )}
      </div>

      {/* Monthly Salary Range */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          Monthly Salary range <span className="text-[#FF3F3F]">*</span>
        </label>
        <div className="relative">
          <Image
            src="/hiring/currency-dollar.svg"
            alt="dollar"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#000000]"
          />

          <Select onValueChange={(value) => setValue("salaryRange", value)}>
            <SelectTrigger className="pl-10 w-full">
              <SelectValue placeholder="1000 - 5000" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000-5000">1000 - 5000</SelectItem>
              <SelectItem value="5000-10000">5000 - 10000</SelectItem>
              <SelectItem value="10000-20000">10000 - 20000</SelectItem>
              <SelectItem value="20000+">20000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preferred Location */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          Preferred Location <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          {...register("preferredLocation", { required: true })}
          placeholder="Kenya"
          className=""
        />
      </div>

      {/* Worker Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#0F112A]">
          Worker type <span className="text-[#FF3F3F]">*</span>
        </label>
        <Input
          {...register("workerType", { required: true })}
          placeholder="Contractor"
        />
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <Button type="submit" variant={"primary"}>
          Submit & Schedule a Call
        </Button>
      </div>
    </form>
  );
}
