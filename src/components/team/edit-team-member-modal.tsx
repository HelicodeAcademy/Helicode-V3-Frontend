"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/store/team-store";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { quotePayrollSalary, updateTeamMember } from "@/lib/team-service";
import {
  currencySymbol,
  formatPayrollMoney,
  isLocalPayrollCurrency,
  payrollCurrencyOptionsForCountry,
  type PayrollQuoteResponse,
} from "@/lib/local-currency-payroll";
import { useDebounce } from "@/hooks/use-debounce";

interface EditTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSuccess: () => void;
}

interface EditForm {
  firstName: string;
  lastName: string;
  role: string;
  startDate: string;
  amount: string;
  currency: string;
}

interface EditErrors {
  firstName?: string;
  lastName?: string;
  role?: string;
  startDate?: string;
  amount?: string;
}

export function EditTeamMemberModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditTeamMemberModalProps) {
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    role: "",
    startDate: "",
    amount: "",
    currency: "USD",
  });
  const [errors, setErrors] = useState<EditErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [quote, setQuote] = useState<PayrollQuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [isQuoting, setIsQuoting] = useState(false);

  const currencyOptions = payrollCurrencyOptionsForCountry(
    member?.country ?? "",
  );
  const debouncedAmount = useDebounce(form.amount, 400);
  const prefix = currencySymbol(form.currency) || form.currency;

  useEffect(() => {
    if (member) {
      const [firstName = "", ...rest] = member.fullName.split(" ");
      const displayCurrency =
        member.localCurrency ||
        (member.currency && isLocalPayrollCurrency(member.currency)
          ? member.currency
          : "USD");
      const displayAmount =
        member.localAmount != null
          ? String(member.localAmount)
          : String(member.amount);
      setForm({
        firstName,
        lastName: rest.join(" "),
        role: member.role,
        startDate: member.dateJoined ?? "",
        amount: displayAmount,
        currency: displayCurrency,
      });
      setErrors({});
      setShowSuccess(false);
      setQuote(null);
      setQuoteError("");
    }
  }, [member]);

  useEffect(() => {
    const amount = Number(debouncedAmount);
    if (
      !member?.country ||
      !form.currency ||
      !debouncedAmount ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      !isLocalPayrollCurrency(form.currency)
    ) {
      setQuote(null);
      setQuoteError("");
      return;
    }

    let cancelled = false;
    const run = async () => {
      setIsQuoting(true);
      setQuoteError("");
      try {
        const result = await quotePayrollSalary({
          country: member.country,
          currency: form.currency,
          amount,
        });
        if (!cancelled) setQuote(result);
      } catch (error) {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(
            error instanceof Error
              ? error.message
              : "Could not fetch payout rate",
          );
        }
      } finally {
        if (!cancelled) setIsQuoting(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [debouncedAmount, form.currency, member?.country]);

  const setField = (field: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required.";
    if (!form.lastName.trim()) e.lastName = "Required.";
    if (!form.role.trim()) e.role = "Required.";
    if (!form.startDate) e.startDate = "Required.";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount.";
    if (isLocalPayrollCurrency(form.currency) && quoteError) {
      e.amount = "Retry the quote before submitting.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !member) return;
    setIsSubmitting(true);
    try {
      await updateTeamMember(member.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        startDate: form.startDate,
        amount: String(form.amount),
        currency: form.currency,
      });
      setShowSuccess(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update team member.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToTeam = () => {
    setShowSuccess(false);
    onOpenChange(false);
    onSuccess();
  };

  const parsedDate =
    form.startDate && isValid(parseISO(form.startDate))
      ? parseISO(form.startDate)
      : undefined;

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md gap-0 p-2"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Team member updated</DialogTitle>

          <Image
            src="/payroll/modal-illustration.png"
            alt="Success"
            width={384}
            height={220}
            className="w-full rounded-md"
          />
          <div className="px-4 pt-6 pb-6">
            <h2 className="text-2xl font-bold text-[#000000] mb-3">
              Team member updated
            </h2>
            <p className="text-sm text-[#444444] mb-8">
              The team member&apos;s details have been successfully updated.
            </p>
            <Button
              variant="primary"
              onClick={handleBackToTeam}
              className="hover:bg-[#101828]/90"
            >
              Back to team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Edit Team Member
        </DialogTitle>
        <p className="text-sm text-[#475367] -mt-2">
          Update information and manage how this team member works with your
          team.
        </p>

        <div className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                First Name <span className="text-[#FF3F3F]">*</span>
              </label>
              <Input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="John"
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
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Doe"
                className={errors.lastName ? "border-red-400" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          <p className="text-xs text-[#475367] -mt-2">
            As it appears on their government issued identification
          </p>

          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Job title <span className="text-[#FF3F3F]">*</span>
            </label>
            <Input
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              placeholder="Software Engineer"
              className={errors.role ? "border-red-400" : ""}
            />
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

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
                    parsedDate ? "text-[#101928]" : "text-[#667085]",
                    errors.startDate ? "border-red-400" : "border-[#E4E7EC]",
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-[#667085]" />
                  {parsedDate
                    ? format(parsedDate, "MMM d, yyyy")
                    : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parsedDate}
                  onSelect={(date) => {
                    if (date) {
                      setField("startDate", format(date, "yyyy-MM-dd"));
                      setCalendarOpen(false);
                    }
                  }}
                  autoFocus
                  captionLayout="dropdown-years"
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Currency <span className="text-[#FF3F3F]">*</span>
            </label>
            <Select
              value={form.currency}
              onValueChange={(value) => setField("currency", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
              Monthly rate <span className="text-[#FF3F3F]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#667085] font-medium">
                {prefix === "$" || prefix === "₦" || prefix === "€" || prefix === "£" || prefix === "R" || prefix === "GH₵" || prefix === "KSh"
                  ? prefix
                  : ""}
              </span>
              <Input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="5000"
                className={cn(
                  errors.amount ? "border-red-400" : "",
                  prefix === "$" ||
                    prefix === "₦" ||
                    prefix === "€" ||
                    prefix === "£" ||
                    prefix === "R" ||
                    prefix === "GH₵" ||
                    prefix === "KSh"
                    ? "pl-7"
                    : "",
                )}
              />
            </div>
            {isLocalPayrollCurrency(form.currency) && (
              <div className="mt-2 rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] px-3 py-2">
                {isQuoting ? (
                  <p className="flex items-center gap-2 text-xs text-[#66748C]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Fetching payout rate…
                  </p>
                ) : quoteError ? (
                  <p className="text-xs text-[#B42318]">{quoteError}</p>
                ) : quote ? (
                  <p className="text-xs text-[#66748C]">
                    Settles as{" "}
                    {formatPayrollMoney(
                      quote.settlementAmount,
                      quote.settlementCurrency,
                    )}
                    {quote.rate != null
                      ? ` · 1 USD = ${quote.rate.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${quote.currency}`
                      : ""}
                  </p>
                ) : null}
              </div>
            )}
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || isQuoting}
            className="hover:bg-[#101828]/90"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
