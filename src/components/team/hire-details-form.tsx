"use client";

import { useState } from "react";
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
import { CalendarIcon, Mail } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useAddHireStore } from "@/store/add-hire-store";
import { HireDetailsForm } from "@/store/add-hire-store";
import { getAllCountries, getFlagEmoji } from "@/lib/countries";

const COUNTRIES = getAllCountries();

// const COUNTRIES = [
//     "United States",
//     "United Kingdom",
//     "Nigeria",
//     "Rwanda",
//     "Kenya",
//     "Ghana",
//     "Singapore",
//     "South Africa",
//     "Namibia",
// ];

interface HireDetailsFormComponentProps {
  title: string;
  subtitle: string;
  onNext: () => void;
}

export function HireDetailsFormComponent({
  title,
  subtitle,
  onNext,
}: HireDetailsFormComponentProps) {
  const { details, setDetails } = useAddHireStore();
  const [errors, setErrors] = useState<
    Partial<Record<keyof HireDetailsForm, string>>
  >({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof HireDetailsForm, string>> = {};
    if (!details.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!details.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!details.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!details.country) newErrors.country = "Country is required.";
    if (!details.role.trim()) newErrors.role = "Job title is required.";
    if (!details.startDate) newErrors.startDate = "Start date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="max-w-112.5 w-full mx-auto">
        <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2">
          {title}
        </h1>
        <p className="text-[#444444] text-sm mb-8">{subtitle}</p>

        <div className="space-y-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                First Name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input
                placeholder="John"
                value={details.firstName}
                onChange={(e) => setDetails({ firstName: e.target.value })}
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
                placeholder="Doe"
                value={details.lastName}
                onChange={(e) => setDetails({ lastName: e.target.value })}
                className={errors.lastName ? "border-red-400" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-[#475367] -mt-3">
            As it appears on their government issued identification
          </p>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Email address <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
              <Input
                type="email"
                placeholder="john@example.com"
                value={details.email}
                onChange={(e) => setDetails({ email: e.target.value })}
                className={cn("pl-10", errors.email ? "border-red-400" : "")}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            ) : (
              <p className="text-xs text-[#475367] mt-1.5">
                An invite will be sent to this address
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Country <span className="text-[#FF3F3F]">*</span>
            </label>
            <Select
              value={details.country}
              onValueChange={(val) => setDetails({ country: val })}
            >
              <SelectTrigger
                className={cn("w-full", errors.country ? "border-red-400" : "")}
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              {/* <SelectContent>
                                {COUNTRIES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent> */}
              <SelectContent className="max-h-64">
                {COUNTRIES.map(({ code, name }) => (
                  <SelectItem key={code} value={name}>
                    <span className="flex items-center gap-2">
                      {/* <span>{getFlagEmoji(name)}</span> */}
                      <span>{name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country ? (
              <p className="text-xs text-red-500 mt-1">{errors.country}</p>
            ) : (
              <p className="text-xs text-[#475367] mt-1.5">
                Country of employment
              </p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Job title <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              placeholder="Software Engineer"
              value={details.role}
              onChange={(e) => setDetails({ role: e.target.value })}
              className={errors.role ? "border-red-400" : ""}
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Start Date — calendar picker */}
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
                    details.startDate ? "text-[#101928]" : "text-[#667085]",
                    errors.startDate ? "border-red-400" : "border-[#E4E7EC]",
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-[#667085]" />
                  {details.startDate
                    ? format(parseISO(details.startDate), "MMM d, yyyy")
                    : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    details.startDate ? parseISO(details.startDate) : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      setDetails({ startDate: format(date, "yyyy-MM-dd") });
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="primary" onClick={handleNext} className="w-13.5">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
