"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Download, Search, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember, useTeamStore } from "@/store/team-store";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { paySingleTeamMember, getTeamMembers } from "@/lib/team-service";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { useWalletStore } from "@/store/wallet-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  currencySymbol,
  formatPayrollMoney,
  isLocalPayrollCurrency,
  payrollCurrencyOptionsForCountry,
  type PayrollQuoteResponse,
} from "@/lib/local-currency-payroll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quotePayrollSalary } from "@/lib/team-service";
import { useDebounce } from "@/hooks/use-debounce";

interface OneTimePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FlowStep = "recipient" | "amount" | "review" | "verification" | "success";
type MemberFilter = "everyone" | "employees" | "contractors";
type PaymentType =
  | "Salary"
  | "Reimbursement"
  | "Commission"
  | "Advance"
  | "Other";

const PAYMENT_TYPES: PaymentType[] = [
  "Salary",
  "Reimbursement",
  "Commission",
  "Advance",
  "Other",
];

const NETWORK_FEE = 1;

const AVATAR_COLORS = [
  "bg-[#F79009] text-white",
  "bg-[#7A5AF8] text-white",
  "bg-[#EE46BC] text-white",
  "bg-[#12B76A] text-white",
  "bg-[#0E9384] text-white",
  "bg-[#0052FF] text-white",
];

function formatMoney(amount: number, currency?: string) {
  return formatPayrollMoney(amount, currency);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

function memberCurrency(member: TeamMember) {
  if (member.localCurrency) return member.localCurrency;
  const withCurrency = member as TeamMember & { currency?: string };
  return withCurrency.currency || "USD";
}

function memberDisplayAmount(member: TeamMember) {
  if (member.localAmount != null && member.localCurrency) {
    return String(member.localAmount);
  }
  return member.amount ? String(member.amount) : "";
}

function canPayMember(member: TeamMember) {
  return member.status === "Active";
}

function PayNowStepper({ step }: { step: FlowStep }) {
  const activeIndex =
    step === "recipient"
      ? 0
      : step === "amount"
        ? 1
        : step === "review"
          ? 2
          : 2;

  const items = [
    { label: "Recipient", index: 0 },
    { label: "Amount", index: 1 },
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
                  completed && "bg-[#21966F] text-white",
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
                  active || completed
                    ? "font-semibold text-[#0C1424]"
                    : "text-[#66748C]",
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

export function OneTimePaymentModal({
  open,
  onOpenChange,
}: OneTimePaymentModalProps) {
  const { members, setMembers } = useTeamStore();
  const { walletData } = useWalletStore();
  const [step, setStep] = useState<FlowStep>("recipient");
  const [filter, setFilter] = useState<MemberFilter>("everyone");
  const [searchInput, setSearchInput] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("Salary");
  const [amount, setAmount] = useState("");
  const [payCurrency, setPayCurrency] = useState("USD");
  const [note, setNote] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [payrollQuote, setPayrollQuote] = useState<PayrollQuoteResponse | null>(
    null,
  );
  const [paymentResult, setPaymentResult] = useState<Awaited<
    ReturnType<typeof paySingleTeamMember>
  > | null>(null);
  const [paidAt, setPaidAt] = useState<Date | null>(null);

  const resetState = useCallback(() => {
    setStep("recipient");
    setFilter("everyone");
    setSearchInput("");
    setSelectedMember(null);
    setPaymentType("Salary");
    setAmount("");
    setPayCurrency("USD");
    setNote("");
    setVerificationError("");
    setPayrollQuote(null);
    setPaymentResult(null);
    setPaidAt(null);
  }, []);

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const result = await getTeamMembers({ search: "", page: 1, limit: 100 });
      setMembers(result.data, result.total);
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
    void loadMembers();
  }, [open, loadMembers, resetState]);

  const visibleMembers = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    return members.filter((member) => {
      if (filter === "employees" && member.type !== "EMPLOYEE") return false;
      if (filter === "contractors" && member.type !== "CONTRACTOR")
        return false;
      if (!query) return true;
      const email = (member as TeamMember & { email?: string }).email ?? "";
      return (
        member.fullName.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
  }, [members, filter, searchInput]);

  const currencyOptions = payrollCurrencyOptionsForCountry(
    selectedMember?.country ?? "",
  );
  const debouncedAmount = useDebounce(amount, 400);
  const amountValue = Number(amount) || 0;
  const settlementAmount =
    isLocalPayrollCurrency(payCurrency) && payrollQuote
      ? payrollQuote.settlementAmount
      : amountValue;
  const totalDebited = settlementAmount + NETWORK_FEE;
  const balance = walletData?.balance ?? 0;
  const balanceAfter = Math.max(balance - totalDebited, 0);
  const selectedCurrency = payCurrency;
  const amountPrefix = currencySymbol(payCurrency);

  useEffect(() => {
    const parsed = Number(debouncedAmount);
    if (
      !selectedMember ||
      !isLocalPayrollCurrency(payCurrency) ||
      !debouncedAmount ||
      Number.isNaN(parsed) ||
      parsed <= 0
    ) {
      setPayrollQuote(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const quote = await quotePayrollSalary({
          country: selectedMember.country,
          currency: payCurrency,
          amount: parsed,
        });
        if (!cancelled) setPayrollQuote(quote);
      } catch {
        if (!cancelled) setPayrollQuote(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [debouncedAmount, payCurrency, selectedMember]);

  const continueFromRecipient = () => {
    if (!selectedMember || !canPayMember(selectedMember)) {
      toast.error("Select an active team member to pay.");
      return;
    }
    const nextCurrency = isLocalPayrollCurrency(memberCurrency(selectedMember))
      ? memberCurrency(selectedMember)
      : "USD";
    setPayCurrency(nextCurrency);
    setAmount(memberDisplayAmount(selectedMember));
    setStep("amount");
  };

  const continueFromAmount = () => {
    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setStep("review");
  };

  const requestCode = async () => {
    setIsSubmitting(true);
    try {
      await requestTransactionVerificationCode("COMPANY_PAY_NOW_MEMBER");
      toast.success("Verification code sent to your email!");
      setStep("verification");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification code",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCode = async () => {
    await requestTransactionVerificationCode("COMPANY_PAY_NOW_MEMBER");
    toast.success("Verification code sent to your email!");
  };

  const handleConfirmCode = async (code: string) => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    setVerificationError("");
    try {
      const result = await paySingleTeamMember(
        selectedMember.id,
        code,
        amountValue,
        isLocalPayrollCurrency(payCurrency) ? payCurrency : undefined,
      );
      setPaymentResult(result);
      setPaidAt(new Date());
      setStep("success");
    } catch (err: unknown) {
      setVerificationError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadReceipt = () => {
    if (!selectedMember || !paidAt) return;
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Payment receipt", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Amount: ${formatMoney(amountValue, payCurrency)}`, 20, 40);
    pdf.text(`Paid to: ${selectedMember.fullName}`, 20, 50);
    pdf.text(`Type: ${paymentType}`, 20, 60);
    pdf.text(`Date: ${format(paidAt, "MMM d, yyyy - HH:mm")}`, 20, 70);
    if (note) pdf.text(`Note: ${note}`, 20, 80);
    if (paymentResult) {
      pdf.text(
        `Reference: ${paymentResult.ledgerEntryId || paymentResult.runId}`,
        20,
        90,
      );
    }
    pdf.save(`receipt-${selectedMember.fullName.replace(/\s+/g, "-")}.pdf`);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-2xl p-0",
          step === "success" ? "sm:max-w-md" : "sm:max-w-150",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Pay now</DialogTitle>

        {step !== "verification" && step !== "success" && (
          <div className="border-b border-[#EAECF0] px-6 pt-6 pb-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#0C1424]">
                  Pay now
                </h2>
                <p className="mt-1 text-sm text-[#66748C]">
                  {step === "recipient"
                    ? "One-time payment"
                    : "One-time payment, sent today"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7] transition-colors hover:bg-[#E4E7EC]"
              >
                <X className="h-4 w-4 text-[#0C1424]" />
              </button>
            </div>
            <PayNowStepper step={step} />
          </div>
        )}

        {step === "recipient" && (
          <>
            <div className="space-y-4 px-6 py-5">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#66748C]" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, role or email"
                  className="h-11 rounded-xl border-[#E4E7EC] pl-9"
                />
              </div>

              <div className="inline-flex rounded-xl bg-[#F2F4F7] p-1 w-full justify-between">
                {(
                  [
                    ["everyone", "Everyone"],
                    ["employees", "Employees"],
                    ["contractors", "Contractors"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={cn(
                      "rounded-lg px-10 py-2 text-sm font-medium transition-colors",
                      filter === value
                        ? "bg-white text-[#0C1424] shadow-sm"
                        : "text-[#66748C]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="max-h-72 space-y-1 overflow-y-auto">
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
                    const payable = canPayMember(member);
                    const selected = selectedMember?.id === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        disabled={!payable}
                        onClick={() => setSelectedMember(member)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
                          selected && "bg-[#F5F8FF]",
                          !payable && "opacity-80",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-[#0052FF] bg-[#0052FF]"
                              : "border-[#D0D5DD] bg-white",
                          )}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
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
                        {payable ? (
                          <span className="text-sm text-[#66748C]">
                            {memberCurrency(member)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-xs font-medium text-[#9A5B00]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#9A5B00]" />
                            Can&apos;t pay yet
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#EAECF0] px-6 py-4">
              <p className="text-sm text-[#66748C]">
                {selectedMember ? "1 selected" : "0 selected"}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-[#66748C]"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!selectedMember || !canPayMember(selectedMember)}
                  className="bg-[#0052FF] text-white hover:bg-[#0041CC]"
                  onClick={continueFromRecipient}
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "amount" && selectedMember && (
          <>
            <div className="space-y-5 px-6 py-5">
              <div className="flex items-center gap-3 rounded-xl border border-[#EAECF0] px-4 py-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-[#F79009] text-xs font-semibold text-white">
                    {initials(selectedMember.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0C1424]">
                    {selectedMember.fullName}
                  </p>
                  <p className="text-sm text-[#66748C]">
                    {selectedMember.role}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#0052FF]"
                  onClick={() => setStep("recipient")}
                >
                  Change
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#0C1424]">
                  Payment type
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPaymentType(type)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        paymentType === type
                          ? "border-[#0052FF] text-[#0052FF]"
                          : "border-[#D0D5DD] text-[#0C1424]",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#0C1424]">
                    Amount
                  </p>
                  <div className="flex h-11 items-center rounded-xl border border-[#0052FF] px-3">
                    <span className="mr-1 shrink-0 text-sm text-[#0C1424]">
                      {amountPrefix || "$"}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      onWheel={(event) => event.currentTarget.blur()}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#0C1424] outline-none"
                    />
                    {currencyOptions.length > 1 ? (
                      <Select
                        value={payCurrency}
                        onValueChange={setPayCurrency}
                      >
                        <SelectTrigger className="h-8 w-auto shrink-0 border-0 bg-transparent px-1.5 text-sm font-medium text-[#66748C] shadow-none focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="shrink-0 text-sm text-[#66748C]">
                        {selectedCurrency}
                      </span>
                    )}
                  </div>
                  {isLocalPayrollCurrency(payCurrency) && payrollQuote && (
                    <p className="mt-2 text-xs text-[#66748C]">
                      Settles as{" "}
                      {formatMoney(
                        payrollQuote.settlementAmount,
                        payrollQuote.settlementCurrency,
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#0C1424]">
                    Pay from
                  </p>
                  <div className="flex h-11 items-center rounded-xl border border-[#D0D5DD] px-3 text-sm text-[#0C1424]">
                    <span className="truncate">
                      USD account · {formatMoney(balance)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#0C1424]">
                  Note{" "}
                  <span className="font-normal text-xs text-[#66748C]">
                    Optional
                  </span>
                </p>
                <Input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a note"
                  className="h-11 rounded-xl border-[#D0D5DD]"
                />
                <p className="mt-1.5 text-xs text-[#66748C]">
                  Shown on {firstName(selectedMember.fullName)}&apos;s receipt.
                </p>
              </div>

              <div className="space-y-2.5 rounded-xl bg-[#F9FAFB] px-4 py-3 text-sm border border-[#EDF1F7]">
                <div className="flex justify-between text-[#66748C]">
                  <span>Amount</span>
                  <span className="text-[#0C1424] font-semibold">
                    {formatMoney(amountValue, payCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-[#66748C] border-b pb-2">
                  <span>Fee</span>
                  <span className="text-[#0C1424] font-semibold">
                    {formatMoney(NETWORK_FEE)}
                  </span>
                </div>

                <div className="flex justify-between text-[#66748C]">
                  <span>{firstName(selectedMember.fullName)} receives</span>
                  <span className="text-[#0052FF] font-semibold">
                    {isLocalPayrollCurrency(payCurrency)
                      ? formatMoney(amountValue, payCurrency)
                      : formatMoney(amountValue)}
                  </span>
                </div>
                <div className="flex justify-between text-[#66748C]">
                  <span>Total debited from USD account</span>
                  <span className="text-[#0C1424] font-semibold">
                    {formatMoney(totalDebited)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EAECF0] px-6 py-4 bg-[#FBFCFE]">
              <Button
                type="button"
                variant="outline"
                className="border-[#D0D5DD] text-[#0C1424]"
                onClick={() => setStep("recipient")}
              >
                Back
              </Button>
              <Button
                type="button"
                className="bg-[#0052FF] text-white hover:bg-[#0041CC]"
                onClick={continueFromAmount}
              >
                Review payment
              </Button>
            </div>
          </>
        )}

        {step === "review" && selectedMember && (
          <>
            <div className="space-y-5 px-6 py-6">
              <div className="text-center">
                <p className="text-sm text-[#66748C]">You&apos;re sending</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-[#0C1424]">
                  {formatMoney(amountValue)}
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
                {[
                  ["Paid to", selectedMember.fullName],
                  ["Pay from", "USD account"],
                  ["Arrives", "Instantly"],
                  ["Note", note || "—"],
                  ["Network fee", formatMoney(NETWORK_FEE)],
                  ["Total debited", formatMoney(totalDebited)],
                  ["USD account after", formatMoney(balanceAfter)],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center justify-between gap-4 px-4 py-3 text-sm",
                      index === 3 && "border-b border-[#EAECF0]",
                    )}
                  >
                    <span className="text-[#66748C]">{label}</span>
                    <span
                      className={cn("text-right font-medium text-[#0C1424]")}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EAECF0] px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="border-[#D0D5DD] text-[#0C1424]"
                onClick={() => setStep("amount")}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                className="bg-[#0052FF] text-white hover:bg-[#0041CC]"
                onClick={() => void requestCode()}
              >
                <Send className="h-4 w-4" />
                Send {formatMoney(amountValue)}
              </Button>
            </div>
          </>
        )}

        {step === "verification" && (
          <div className="px-6 py-8">
            <EmailVerificationCodeStep
              onBack={() => setStep("review")}
              onConfirm={handleConfirmCode}
              isSubmitting={isSubmitting}
              error={verificationError}
              onResendCode={handleRequestCode}
              isResending={isResending}
            />
          </div>
        )}

        {step === "success" && selectedMember && (
          <div className="flex flex-col p-4">
            <Image
              src="/payroll/modal-illu.svg"
              alt="Success"
              width={480}
              height={220}
              className="w-full"
              priority
            />
            <div className="px-6 pt-5 pb-6 text-center">
              <h2 className="text-2xl font-semibold text-[#0C1424] text-center">
                {formatMoney(amountValue)} sent
              </h2>
              <p className="mt-2 text-sm text-[#66748C]">
                {selectedMember.fullName} received ${amountValue.toFixed(0)} in
                their Helicode wallet.
              </p>

              <div className="mt-5 space-y-3 rounded-xl bg-[#F9FAFB] px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#66748C]">Date</span>
                  <span className="font-medium text-[#0C1424]">
                    {paidAt ? format(paidAt, "MMM d, yyyy - HH:mm") : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66748C]">Type</span>
                  <span className="font-medium text-[#0C1424]">
                    {paymentType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66748C]">Reference</span>
                  <span className="font-medium text-[#0C1424]">
                    {paymentResult?.ledgerEntryId ||
                      paymentResult?.runId ||
                      "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-[#D0D5DD] text-[#0C1424]"
                  onClick={downloadReceipt}
                >
                  <Download className="h-4 w-4" />
                  Download receipt
                </Button>
                <Button
                  type="button"
                  className="h-10 bg-[#0052FF] text-white hover:bg-[#0041CC]"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
