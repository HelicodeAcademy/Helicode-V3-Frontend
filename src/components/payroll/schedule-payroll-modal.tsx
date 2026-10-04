"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getDay,
  isBefore,
  isSaturday,
  isSunday,
  setDate,
  startOfDay,
} from "date-fns";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Search,
  Send,
  Zap,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TeamMember, useTeamStore } from "@/store/team-store";
import { useWalletStore } from "@/store/wallet-store";
import { getTeamMembers } from "@/lib/team-service";
import {
  createPayrollGroup,
  updatePayrollGroupStatus,
} from "@/lib/payroll-service";

interface SchedulePayrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FlowStep = "details" | "people" | "review" | "success";
type FrequencyOption = "weekly" | "every2weeks" | "monthly" | "twiceMonth";
type MemberFilter = "all" | "employees" | "contractors";

const AVATAR_COLORS = [
  "bg-[#7A5AF8] text-white",
  "bg-[#EE46BC] text-white",
  "bg-[#0E9384] text-white",
  "bg-[#F79009] text-white",
  "bg-[#12B76A] text-white",
  "bg-[#0052FF] text-white",
];

const FREQUENCY_OPTIONS: { value: FrequencyOption; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "every2weeks", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "twiceMonth", label: "Twice a month" },
];

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
];

const MONTH_DAY_OPTIONS = Array.from({ length: 28 }, (_, index) => {
  const day = index + 1;
  return { value: String(day), label: `${ordinal(day)} of each month` };
});

const TWICE_MONTH_OPTIONS = [
  { value: "1-15", label: "1st and 15th" },
  { value: "15-last", label: "15th and last day" },
];

function ordinal(day: number) {
  const remainder = day % 100;
  if (remainder >= 11 && remainder <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatMoney(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAmountInput(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseAmountInput(value: string) {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function nextWeekdayOnOrAfter(from: Date, weekday: number) {
  const date = startOfDay(from);
  const current = getDay(date);
  const delta = (weekday - current + 7) % 7;
  return addDays(date, delta);
}

function nextMonthDayOnOrAfter(from: Date, dayOfMonth: number) {
  const base = startOfDay(from);
  let candidate = setDate(base, Math.min(dayOfMonth, 28));
  if (isBefore(candidate, base)) {
    candidate = setDate(addMonths(base, 1), Math.min(dayOfMonth, 28));
  }
  return candidate;
}

function buildPaydaySequence(
  frequency: FrequencyOption,
  firstPayday: Date,
  count: number,
): Date[] {
  const dates: Date[] = [firstPayday];
  let cursor = firstPayday;
  while (dates.length < count) {
    if (frequency === "weekly") cursor = addWeeks(cursor, 1);
    else if (frequency === "every2weeks" || frequency === "twiceMonth")
      cursor = addWeeks(cursor, 2);
    else cursor = addMonths(cursor, 1);
    dates.push(cursor);
  }
  return dates;
}

function frequencyApiValue(
  frequency: FrequencyOption,
): "WEEKLY" | "BIWEEKLY" | "MONTHLY" {
  if (frequency === "weekly") return "WEEKLY";
  if (frequency === "monthly") return "MONTHLY";
  return "BIWEEKLY";
}

function frequencySummary(
  frequency: FrequencyOption,
  paydayValue: string,
): string {
  if (frequency === "weekly") {
    const day =
      WEEKDAY_OPTIONS.find((option) => option.value === paydayValue)?.label ??
      "Friday";
    return `Weekly on ${day}s`;
  }
  if (frequency === "every2weeks") {
    const day =
      WEEKDAY_OPTIONS.find((option) => option.value === paydayValue)?.label ??
      "Friday";
    return `Every 2 weeks on ${day}s`;
  }
  if (frequency === "twiceMonth") {
    const label =
      TWICE_MONTH_OPTIONS.find((option) => option.value === paydayValue)
        ?.label ?? "1st and 15th";
    return `Twice a month · ${label}`;
  }
  return `Monthly on the ${ordinal(Number(paydayValue) || 28)}`;
}

function ScheduleStepper({ step }: { step: FlowStep }) {
  const activeIndex =
    step === "details" ? 0 : step === "people" ? 1 : step === "review" ? 2 : 2;

  const items = [
    { label: "Details", index: 0 },
    { label: "People & pay", index: 1 },
    { label: "Review", index: 2 },
  ];

  return (
    <div className="flex items-center px-1">
      {items.map((item, index) => {
        const completed = activeIndex > item.index;
        const active = activeIndex === item.index;
        const lineComplete = activeIndex > item.index + 1;

        return (
          <div
            key={item.label}
            className="flex min-w-0 flex-1 items-center last:flex-none"
          >
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  completed && "bg-[#0B7A55] text-white",
                  active && "bg-[#0052FF] text-white",
                  !completed && !active && "bg-[#D0D5DD] text-white",
                )}
              >
                {completed ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  item.index + 1
                )}
              </span>
              <span
                className={cn(
                  "text-sm whitespace-nowrap",
                  active && "font-semibold text-[#0052FF]",
                  completed && "font-medium text-[#0C1424]",
                  !completed && !active && "text-[#66748C]",
                )}
              >
                {item.label}
              </span>
            </div>
            {index < items.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px min-w-6 flex-1",
                  lineComplete ? "bg-[#12B76A]" : "bg-[#E4E7EC]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SchedulePayrollModal({
  open,
  onOpenChange,
  onSuccess,
}: SchedulePayrollModalProps) {
  const { members, setMembers } = useTeamStore();
  const { walletData } = useWalletStore();

  const [step, setStep] = useState<FlowStep>("details");
  const [scheduleName, setScheduleName] = useState("");
  const [frequency, setFrequency] = useState<FrequencyOption>("monthly");
  const [paydayValue, setPaydayValue] = useState("28");
  const [firstPayday, setFirstPayday] = useState<Date | undefined>();
  const [firstPaydayOpen, setFirstPaydayOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [amountOverrides, setAmountOverrides] = useState<
    Record<string, string>
  >({});
  const [autoTopUp, setAutoTopUp] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activated, setActivated] = useState(true);

  const walletBalance = walletData?.balance ?? 0;

  const resetState = useCallback(() => {
    setStep("details");
    setScheduleName("");
    setFrequency("monthly");
    setPaydayValue("28");
    setFirstPayday(undefined);
    setFirstPaydayOpen(false);
    setSearchInput("");
    setMemberFilter("all");
    setFilterOpen(false);
    setSelectedIds(new Set());
    setAmountOverrides({});
    setAutoTopUp(true);
    setEmailReminder(true);
    setIsSubmitting(false);
    setActivated(true);
  }, []);

  const syncFirstPayday = useCallback(
    (nextFrequency: FrequencyOption, nextPayday: string) => {
      const today = startOfDay(new Date());
      if (nextFrequency === "monthly") {
        setFirstPayday(nextMonthDayOnOrAfter(today, Number(nextPayday) || 28));
        return;
      }
      if (nextFrequency === "twiceMonth") {
        const day = nextPayday.startsWith("15") ? 15 : 1;
        setFirstPayday(nextMonthDayOnOrAfter(today, day));
        return;
      }
      setFirstPayday(nextWeekdayOnOrAfter(today, Number(nextPayday) || 5));
    },
    [],
  );

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const result = await getTeamMembers({ search: "", page: 1, limit: 100 });
      setMembers(result.data, result.total);
      const defaults: Record<string, string> = {};
      result.data.forEach((member) => {
        defaults[member.id] = formatAmountInput(member.amount || 0);
      });
      setAmountOverrides(defaults);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load team members.",
      );
    } finally {
      setIsLoadingMembers(false);
    }
  }, [setMembers]);

  useEffect(() => {
    if (!open) return;
    resetState();
    syncFirstPayday("monthly", "28");
    void loadMembers();
  }, [open, loadMembers, resetState, syncFirstPayday]);

  useEffect(() => {
    if (frequency === "monthly") {
      setPaydayValue((current) =>
        MONTH_DAY_OPTIONS.some((option) => option.value === current)
          ? current
          : "28",
      );
    } else if (frequency === "twiceMonth") {
      setPaydayValue((current) =>
        TWICE_MONTH_OPTIONS.some((option) => option.value === current)
          ? current
          : "1-15",
      );
    } else {
      setPaydayValue((current) =>
        WEEKDAY_OPTIONS.some((option) => option.value === current)
          ? current
          : "5",
      );
    }
  }, [frequency]);

  const paydayOptions =
    frequency === "monthly"
      ? MONTH_DAY_OPTIONS
      : frequency === "twiceMonth"
        ? TWICE_MONTH_OPTIONS
        : WEEKDAY_OPTIONS;

  const visibleMembers = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    return members.filter((member) => {
      if (memberFilter === "employees" && member.type !== "EMPLOYEE")
        return false;
      if (memberFilter === "contractors" && member.type !== "CONTRACTOR")
        return false;
      if (!query) return true;
      return (
        member.fullName.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    });
  }, [members, memberFilter, searchInput]);

  const selectedMembers = useMemo(
    () => members.filter((member) => selectedIds.has(member.id)),
    [members, selectedIds],
  );

  const perRunTotal = useMemo(() => {
    return selectedMembers.reduce((sum, member) => {
      const raw = amountOverrides[member.id];
      const amount =
        raw !== undefined ? parseAmountInput(raw) : member.amount || 0;
      return sum + amount;
    }, 0);
  }, [selectedMembers, amountOverrides]);

  const shortfall = Math.max(perRunTotal - walletBalance, 0);
  const frequencyLabel = frequencySummary(frequency, paydayValue);

  const nextPaydays = useMemo(() => {
    if (!firstPayday) return [];
    return buildPaydaySequence(frequency, firstPayday, 3);
  }, [firstPayday, frequency]);

  const nextPaydaysLabel = useMemo(() => {
    if (!firstPayday || nextPaydays.length === 0) return "";
    return nextPaydays
      .map((date, index) => {
        const base = format(date, "EEE MMM d");
        if (frequency !== "monthly" || index === 0) return base;
        const day = Number(paydayValue) || 28;
        const nominal = setDate(addMonths(firstPayday, index), day);
        if (isSaturday(nominal) || isSunday(nominal)) {
          return `${base} (${ordinal(day)} is a ${format(nominal, "EEEE")})`;
        }
        return base;
      })
      .join(" · ");
  }, [nextPaydays, frequency, paydayValue, firstPayday]);

  const reminderDate = firstPayday ? addDays(firstPayday, -3) : null;
  const topUpDate = firstPayday ? addDays(firstPayday, -2) : null;

  const headerSubtitle = useMemo(() => {
    if (step === "details") return "Pay a group of people on a recurring date";
    if (step === "people") return scheduleName.trim() || "Untitled schedule";
    if (step === "review") {
      return `${scheduleName.trim() || "Untitled schedule"} · ${frequencyLabel}`;
    }
    return "";
  }, [step, scheduleName, frequencyLabel]);

  const memberAmount = (member: TeamMember) => {
    const raw = amountOverrides[member.id];
    return raw !== undefined ? parseAmountInput(raw) : member.amount || 0;
  };

  const toggleMember = (member: TeamMember) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(member.id)) next.delete(member.id);
      else next.add(member.id);
      return next;
    });
  };

  const continueFromDetails = () => {
    if (!scheduleName.trim()) {
      toast.error("Enter a schedule name.");
      return;
    }
    if (!firstPayday) {
      toast.error("Select a first payday.");
      return;
    }
    setStep("people");
  };

  const continueFromPeople = () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one person.");
      return;
    }
    const invalid = selectedMembers.some((member) => memberAmount(member) <= 0);
    if (invalid) {
      toast.error("Set a valid amount for each selected person.");
      return;
    }
    setStep("review");
  };

  const submitSchedule = async (activate: boolean) => {
    if (!firstPayday) return;
    setIsSubmitting(true);
    try {
      const group = await createPayrollGroup({
        name: scheduleName.trim(),
        teamIds: Array.from(selectedIds),
        frequency: frequencyApiValue(frequency),
        startDate: format(firstPayday, "yyyy-MM-dd"),
      });
      if (activate) {
        await updatePayrollGroupStatus(group.id, true);
      }
      setActivated(activate);
      setStep("success");
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create payroll schedule",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-2xl p-0",
          step === "success" ? "sm:max-w-md" : "sm:max-w-140",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Schedule payroll</DialogTitle>

        {step !== "success" && (
          <div className="border-b border-[#EAECF0] px-6 pt-6 pb-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#0C1424]">
                  Schedule payroll
                </h2>
                <p className="mt-1 text-sm text-[#66748C]">{headerSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7] transition-colors hover:bg-[#E4E7EC]"
              >
                <X className="h-4 w-4 text-[#0C1424]" />
              </button>
            </div>
            <ScheduleStepper step={step} />
          </div>
        )}

        {step === "details" && (
          <>
            <div className="space-y-5 px-6 py-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#66748C]">
                  Schedule name
                </label>
                <Input
                  value={scheduleName}
                  onChange={(event) => setScheduleName(event.target.value)}
                  placeholder="Design team"
                  className="h-11 rounded-xl border-[#E4E7EC] text-[#0C1424] focus-visible:border-[#0052FF] focus-visible:ring-[#0052FF]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#66748C]">
                  How often
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F2F4F7] p-1 sm:grid-cols-4">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFrequency(option.value);
                        const nextPayday =
                          option.value === "monthly"
                            ? "28"
                            : option.value === "twiceMonth"
                              ? "1-15"
                              : "5";
                        setPaydayValue(nextPayday);
                        syncFirstPayday(option.value, nextPayday);
                      }}
                      className={cn(
                        "rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                        frequency === option.value
                          ? "bg-white text-[#0C1424] shadow-sm"
                          : "text-[#66748C]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#66748C]">
                    Payday
                  </label>
                  <Select
                    value={paydayValue}
                    onValueChange={(value) => {
                      setPaydayValue(value);
                      syncFirstPayday(frequency, value);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-[#E4E7EC] text-[#0C1424]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paydayOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#66748C]">
                    First payday
                  </label>
                  <Popover
                    open={firstPaydayOpen}
                    onOpenChange={setFirstPaydayOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-11 w-full items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 text-left text-sm text-[#0C1424]"
                      >
                        <CalendarIcon className="h-4 w-4 text-[#66748C]" />
                        {firstPayday
                          ? format(firstPayday, "MMM d, yyyy")
                          : "Select date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={firstPayday}
                        onSelect={(date) => {
                          if (!date) return;
                          setFirstPayday(startOfDay(date));
                          setFirstPaydayOpen(false);
                        }}
                        disabled={(date) =>
                          isBefore(startOfDay(date), startOfDay(new Date()))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#66748C]">
                  Pay from
                </label>
                <Select defaultValue="usd">
                  <SelectTrigger className="h-11 w-full rounded-xl border-[#E4E7EC] text-[#0C1424]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">
                      USD Account - {formatMoney(walletBalance)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-[#66748C]">
                  Please ensure to load your balance before payday.
                </p>
              </div>

              {nextPaydays.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-[#B2CCFF] bg-[#F5F8FF] px-4 py-3">
                  <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0052FF]" />
                  <p className="text-sm text-[#0052FF]">
                    Next paydays: {nextPaydaysLabel}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#EAECF0] px-6 py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-2 text-sm font-medium text-[#66748C]"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={continueFromDetails}
                className="h-10 rounded-lg bg-[#0052FF] px-4 text-sm font-medium text-white hover:bg-[#0041CC]"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "people" && (
          <>
            <div className="space-y-4 px-6 py-5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#66748C]" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search team"
                    className="h-11 rounded-xl border-[#E4E7EC] pl-9"
                  />
                </div>
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-3 text-sm font-medium text-[#0C1424]"
                    >
                      {memberFilter === "all"
                        ? "All team"
                        : memberFilter === "employees"
                          ? "Employees"
                          : "Contractors"}
                      <ChevronDown className="h-4 w-4 text-[#66748C]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-40 p-1">
                    {(
                      [
                        ["all", "All team"],
                        ["employees", "Employees"],
                        ["contractors", "Contractors"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setMemberFilter(value);
                          setFilterOpen(false);
                        }}
                        className={cn(
                          "flex w-full rounded-lg px-3 py-2 text-left text-sm",
                          memberFilter === value
                            ? "bg-[#F5F8FF] font-medium text-[#0052FF]"
                            : "text-[#0C1424] hover:bg-[#F9FAFB]",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
                <div className="flex items-center justify-between bg-[#F9FAFB] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const allVisibleSelected = visibleMembers.every(
                          (member) => selectedIds.has(member.id),
                        );
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (allVisibleSelected) {
                            visibleMembers.forEach((member) =>
                              next.delete(member.id),
                            );
                          } else {
                            visibleMembers.forEach((member) =>
                              next.add(member.id),
                            );
                          }
                          return next;
                        });
                      }}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border",
                        visibleMembers.length > 0 &&
                          visibleMembers.every((member) =>
                            selectedIds.has(member.id),
                          )
                          ? "border-[#0052FF] bg-[#0052FF]"
                          : "border-[#D0D5DD] bg-white",
                      )}
                      aria-label="Select all visible team members"
                    >
                      {visibleMembers.length > 0 &&
                        visibleMembers.every((member) =>
                          selectedIds.has(member.id),
                        ) && (
                          <Check
                            className="h-3.5 w-3.5 text-white"
                            strokeWidth={3}
                          />
                        )}
                    </button>
                    <span className="text-xs font-semibold tracking-wide text-[#66748C] uppercase">
                      Person
                    </span>
                  </div>
                  <span className="text-xs font-semibold tracking-wide text-[#66748C] uppercase">
                    Amount per run
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto bg-white">
                  {isLoadingMembers ? (
                    <p className="py-10 text-center text-sm text-[#66748C]">
                      Loading team members...
                    </p>
                  ) : visibleMembers.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#66748C]">
                      No team members found.
                    </p>
                  ) : (
                    visibleMembers.map((member, index) => {
                      const selected = selectedIds.has(member.id);
                      return (
                        <div
                          key={member.id}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3",
                            index < visibleMembers.length - 1 &&
                              "border-b border-[#EAECF0]",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => toggleMember(member)}
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border",
                              selected
                                ? "border-[#0052FF] bg-[#0052FF]"
                                : "border-[#D0D5DD] bg-white",
                            )}
                            aria-label={`Select ${member.fullName}`}
                          >
                            {selected && (
                              <Check
                                className="h-3.5 w-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </button>
                          <Avatar className="size-9">
                            <AvatarFallback
                              className={cn(
                                "text-xs font-semibold",
                                AVATAR_COLORS[index % AVATAR_COLORS.length],
                              )}
                            >
                              {initials(member.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#0C1424]">
                              {member.fullName}
                            </p>
                            <p className="truncate text-sm text-[#66748C]">
                              {member.role}
                            </p>
                          </div>
                          {selected ? (
                            <div className="flex h-10 w-32 items-center rounded-lg border border-[#E4E7EC] bg-white px-2">
                              <span className="mr-1 text-sm text-[#66748C]">
                                $
                              </span>
                              <input
                                value={
                                  amountOverrides[member.id] ??
                                  formatAmountInput(member.amount || 0)
                                }
                                onChange={(event) =>
                                  setAmountOverrides((prev) => ({
                                    ...prev,
                                    [member.id]: event.target.value,
                                  }))
                                }
                                onBlur={(event) => {
                                  const parsed = parseAmountInput(
                                    event.target.value,
                                  );
                                  setAmountOverrides((prev) => ({
                                    ...prev,
                                    [member.id]: formatAmountInput(parsed),
                                  }));
                                }}
                                className="w-full bg-transparent text-sm text-[#0C1424] outline-none"
                              />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleMember(member)}
                              className="text-sm font-medium text-[#0052FF]"
                            >
                              Add to set amount
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#EAECF0] px-6 py-4">
              <p className="text-sm font-medium text-[#0C1424]">
                {selectedIds.size} of {members.length} selected ·{" "}
                {formatMoney(perRunTotal)} per run
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("details")}
                  className="h-10 rounded-lg border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#0C1424]"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={continueFromPeople}
                  className="h-10 rounded-lg bg-[#0052FF] px-4 text-sm font-medium text-white hover:bg-[#0041CC]"
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-3">
                {[
                  ["Schedule", scheduleName.trim()],
                  ["Frequency", frequencyLabel],
                  [
                    "First payday",
                    firstPayday ? format(firstPayday, "EEE, MMM d, yyyy") : "—",
                  ],
                  ["People", String(selectedIds.size)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-[#66748C]">{label}</span>
                    <span className="text-sm font-medium text-[#0C1424]">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="border-t border-[#EAECF0] pt-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#66748C]">Per run</span>
                    <span className="text-sm font-semibold text-[#0C1424]">
                      {formatMoney(perRunTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {shortfall > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-[#FFFAEB] px-4 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F79009]/15 text-[#9A5B00]">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#9A5B00]">
                      Wallet is {formatMoney(shortfall)} short for the first run
                    </p>
                    <p className="mt-1 text-sm text-[#9A5B00]/90">
                      Payroll wallet has {formatMoney(walletBalance)}. Fund it
                      before{" "}
                      {firstPayday ? format(firstPayday, "MMM d") : "payday"},
                      or let us top it up automatically.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl border border-[#0052FF] bg-white px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF4FF]">
                  <Zap className="h-4 w-4 text-[#0052FF]" fill="#0052FF" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#0C1424]">
                      Auto top-up from USD account
                    </p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoTopUp}
                      onClick={() => setAutoTopUp((value) => !value)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        autoTopUp ? "bg-[#0052FF]" : "bg-[#D0D5DD]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                          autoTopUp && "translate-x-5",
                        )}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-[#66748C]">
                    2 days before each payday we move only what&apos;s missing.
                    {shortfall > 0 && topUpDate
                      ? ` Next: ${formatMoney(shortfall)} on ${format(topUpDate, "MMM d")}.`
                      : " "}
                    USD account balance {formatMoney(walletBalance)}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEmailReminder((value) => !value)}
                className="flex items-start gap-3 text-left"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border",
                    emailReminder
                      ? "border-[#0052FF] bg-[#0052FF]"
                      : "border-[#D0D5DD] bg-white",
                  )}
                >
                  {emailReminder && (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  )}
                </span>
                <span className="text-sm text-[#0C1424]">
                  Email me 3 days before each run so I can review amounts
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#EAECF0] px-6 py-4">
              <button
                type="button"
                onClick={() => setStep("people")}
                className="text-sm font-medium text-[#66748C]"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => void submitSchedule(false)}
                  className="h-10 rounded-lg border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#0C1424]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save as draft"
                  )}
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void submitSchedule(true)}
                  className="h-10 rounded-lg bg-[#0052FF] px-4 text-sm font-medium text-white hover:bg-[#0041CC]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Activate schedule"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="px-6 py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFAE6]">
              <Check className="h-7 w-7 text-[#079455]" strokeWidth={3} />
            </div>
            <h2 className="text-center text-xl font-semibold text-[#0C1424]">
              {scheduleName.trim() || "Schedule"} is scheduled
            </h2>
            <p className="mt-2 text-center text-sm text-[#66748C]">
              First payroll runs{" "}
              {firstPayday ? format(firstPayday, "EEE, MMM d, yyyy") : "soon"}{" "}
              for {selectedIds.size} people ({formatMoney(perRunTotal)}).
              {!activated ? " Saved as draft." : ""}
            </p>

            <div className="mt-6 rounded-xl bg-[#F9FAFB] px-4 py-4">
              <p className="mb-4 text-xs font-semibold tracking-wide text-[#66748C] uppercase">
                What happens next
              </p>
              <div className="relative space-y-5">
                <div className="absolute top-3 bottom-3 left-3.75 w-px bg-[#E4E7EC]" />
                {emailReminder && reminderDate && (
                  <div className="relative flex gap-3">
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#66748C] ring-4 ring-[#F9FAFB]">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-[#66748C]">
                        {format(reminderDate, "EEE, MMM d")}
                      </p>
                      <p className="text-sm text-[#0C1424]">
                        Reminder email to review amounts
                      </p>
                    </div>
                  </div>
                )}
                {autoTopUp && shortfall > 0 && topUpDate && (
                  <div className="relative flex gap-3">
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#66748C] ring-4 ring-[#F9FAFB]">
                      <Zap className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-[#66748C]">
                        {format(topUpDate, "EEE, MMM d")}
                      </p>
                      <p className="text-sm text-[#0C1424]">
                        Auto top-up of {formatMoney(shortfall)} from USD account
                      </p>
                    </div>
                  </div>
                )}
                {firstPayday && (
                  <div className="relative flex gap-3">
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#12B76A] ring-4 ring-[#F9FAFB]">
                      <Send className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm text-[#66748C]">
                        {format(firstPayday, "EEE, MMM d")}
                      </p>
                      <p className="text-sm text-[#0C1424]">
                        {formatMoney(perRunTotal)} paid to {selectedIds.size}{" "}
                        people
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-lg border-[#D0D5DD] bg-white text-sm font-medium text-[#0C1424]"
              >
                View schedule
              </Button>
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-lg bg-[#0052FF] text-sm font-medium text-white hover:bg-[#0041CC]"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
