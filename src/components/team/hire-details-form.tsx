"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddHireStore } from "@/store/add-hire-store";
import { HireDetailsForm } from "@/store/add-hire-store";
import { getAllCountries } from "@/lib/countries";

const COUNTRIES = getAllCountries();

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter(({ name }) => name.toLowerCase().includes(query));
  }, [countrySearch]);

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
            <Popover
              open={countryOpen}
              onOpenChange={(open) => {
                setCountryOpen(open);
                if (!open) setCountrySearch("");
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-9 w-full items-center justify-between rounded-lg border border-[#E4E7EC] bg-white px-3 py-2 text-sm text-[#101828] outline-none focus:border-ring focus:ring-2 focus:ring-ring/10",
                    !details.country && "text-[#98a8c1]",
                    errors.country && "border-red-400",
                  )}
                >
                  <span className="truncate">
                    {details.country || "Select country"}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-[#667085]" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
              >
                <div className="border-b border-[#E4E7EC] p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />
                    <Input
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country..."
                      className="h-9 border-[#E4E7EC] pl-8"
                      autoFocus
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    "max-h-60 overflow-y-auto overscroll-contain p-1",
                    "scrollbar-thin scrollbar-thumb-[#D0D5DD] scrollbar-track-transparent",
                    "[scrollbar-width:thin] [scrollbar-color:#D0D5DD_transparent]",
                    "[&::-webkit-scrollbar]:w-2",
                    "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D0D5DD]",
                    "[&::-webkit-scrollbar-track]:bg-transparent",
                  )}
                >
                  {filteredCountries.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-[#667085]">
                      No country found
                    </p>
                  ) : (
                    filteredCountries.map(({ code, name }) => {
                      const selected = details.country === name;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setDetails({ country: name });
                            setCountryOpen(false);
                            setCountrySearch("");
                            if (errors.country) {
                              setErrors((prev) => ({
                                ...prev,
                                country: undefined,
                              }));
                            }
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm text-[#101828] hover:bg-[#F2F4F7]",
                            selected && "bg-[#EFF4FF]",
                          )}
                        >
                          <span>{name}</span>
                          {selected && (
                            <Check className="size-4 text-[#0052FF]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
                <p className="border-t border-[#E4E7EC] px-3 py-1.5 text-[11px] text-[#98A2B3]">
                  Scroll for more countries
                </p>
              </PopoverContent>
            </Popover>
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

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Start date <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              type="date"
              value={details.startDate}
              onChange={(e) => setDetails({ startDate: e.target.value })}
              className={cn(
                errors.startDate ? "border-red-400" : "",
                details.startDate ? "text-[#101928]" : "text-[#667085]",
              )}
            />
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
