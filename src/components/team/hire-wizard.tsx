"use client";

import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { format, lastDayOfMonth, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Search,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { getAllCountries, getFlagEmoji } from "@/lib/countries";
import { getLocalCurrencyForCountry } from "@/lib/local-currency-payroll";
import { addTeamMember } from "@/lib/team-service";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { PaymentFrequency } from "@/store/team-store";

const COUNTRIES = getAllCountries();

const FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "DAILY", label: "Daily" },
  { value: "HOURLY", label: "Hourly" },
];

type Kind = "employee" | "contractor";
type PaymentType = "fixed" | "hourly" | "milestone";

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function money(amount: string) {
  const value = Number.parseFloat(amount.replace(/,/g, ""));
  if (Number.isNaN(value)) return amount;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function displayDate(value: string) {
  if (!value) return "";
  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy");
}

export function HireWizard({ kind }: { kind: Kind }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const managerName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [contractorType, setContractorType] = useState<
    "Individual" | "Business"
  >("Individual");
  const [taxId, setTaxId] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [manager, setManager] = useState("");
  const [employment, setEmployment] = useState<"Full-time" | "Part-time">(
    "Full-time",
  );
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<PaymentFrequency>("MONTHLY");
  const [paymentType, setPaymentType] = useState<PaymentType>("fixed");
  const [scope, setScope] = useState("");
  const [contract, setContract] = useState<File | null>(null);
  const [generateAgreement, setGenerateAgreement] = useState(true);
  const [sendInvite, setSendInvite] = useState(true);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const title = kind === "employee" ? "Add an employee" : "Add a contractor";
  const steps =
    kind === "employee"
      ? ["Personal info", "Role & pay", "Review"]
      : ["Contractor info", "Contract & rate", "Review"];

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter((item) => item.name.toLowerCase().includes(query));
  }, [countrySearch]);

  const close = () => router.push("/dashboard/team");

  const frequencyLabel =
    FREQUENCIES.find((item) => item.value === frequency)?.label ?? "Monthly";

  const localCurrency = getLocalCurrencyForCountry(country);
  const payrollDate = startDate
    ? format(lastDayOfMonth(parseISO(startDate)), "MMM d, yyyy")
    : "";

  const rateLabel =
    kind === "employee"
      ? `$${money(amount)} / ${frequencyLabel.toLowerCase()}`
      : paymentType === "hourly"
        ? `$${money(amount)} / hour`
        : paymentType === "milestone"
          ? `$${money(amount)} / milestone`
          : `$${money(amount)} / month, fixed`;

  const canContinueStep1 =
    firstName.trim() &&
    lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    country;
  const canContinueStep2 = jobTitle.trim() && startDate && amount.trim();

  const submit = async () => {
    try {
      setIsSubmitting(true);
      await addTeamMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role: jobTitle.trim(),
        department: department.trim(),
        country,
        type: kind === "employee" ? "EMPLOYEE" : "CONTRACTOR",
        amount: amount.replace(/,/g, ""),
        startDate,
        frequency:
          kind === "contractor" && paymentType === "hourly"
            ? "HOURLY"
            : frequency,
        currency: "USD",
        contract: contract ?? undefined,
      });
      setSuccessOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add team member",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSuccessOpen(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setCountry("");
    setTaxId("");
    setJobTitle("");
    setDepartment("");
    setStartDate("");
    setEndDate("");
    setManager("");
    setEmployment("Full-time");
    setAmount("");
    setFrequency("MONTHLY");
    setPaymentType("fixed");
    setScope("");
    setContract(null);
    setGenerateAgreement(true);
    setSendInvite(true);
  };

  const maxContractBytes =
    kind === "employee" ? 2 * 1024 * 1024 : 10 * 1024 * 1024;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#EAECF0] px-6">
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={close} className="text-[#667085]">
            Team
          </button>
          <ChevronRight className="h-4 w-4 text-[#98A2B3]" />
          <span className="font-medium text-[#101828]">{title}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#667085]">
          <span>Step {step} of 3</span>
          <button type="button" aria-label="Close" onClick={close}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-230 gap-6 px-8 py-10">
          <aside className="w-64 shrink-0">
            <ol className="space-y-1">
              {steps.map((label, index) => {
                const number = index + 1;
                const done = step > number;
                const active = step === number;
                return (
                  <li key={label}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                        active
                          ? "bg-[#F4F4F5] font-medium text-[#101828]"
                          : done
                            ? "text-[#344054]"
                            : "text-[#71717A]",
                      )}
                    >
                      <StepMark done={done} active={active} />
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="w-full max-w-xl">
              {step === 1 && kind === "employee" && (
                <>
                  <h1 className="text-3xl font-semibold text-[#101828]">
                    Personal info
                  </h1>
                  <p className="mt-2 text-sm text-[#667085]">
                    Basic details for your new team member. We&apos;ll use their
                    email to send the invite.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <Field label="Legal first name">
                      <Input
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                    <Field label="Legal last name">
                      <Input
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                  </div>
                  <Field label="Email address" className="mt-4">
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 rounded-lg border-[#E4E7EC]"
                    />
                    <p className="mt-1.5 text-xs text-[#667085]">
                      Their Helicode invite goes here.
                    </p>
                  </Field>
                  <Field label="Country of residence" className="mt-4">
                    <CountryField
                      country={country}
                      open={countryOpen}
                      search={countrySearch}
                      countries={filteredCountries}
                      onOpenChange={setCountryOpen}
                      onSearch={setCountrySearch}
                      onSelect={setCountry}
                    />
                  </Field>
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      disabled={!canContinueStep1}
                      onClick={() => setStep(2)}
                      className="h-10 rounded-lg bg-[#101828] px-4 text-white hover:bg-[#101828]/90"
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {step === 1 && kind === "contractor" && (
                <>
                  <h1 className="text-3xl font-semibold text-[#101828]">
                    Contractor info
                  </h1>
                  <p className="mt-2 text-sm text-[#667085]">
                    Who you&apos;re working with. Contractors invoice you and
                    get paid on approval.
                  </p>
                  <Field label="Contractor type" className="mt-8">
                    <Segment
                      value={contractorType}
                      options={["Individual", "Business"]}
                      onChange={setContractorType}
                    />
                  </Field>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field label="Legal first name">
                      <Input
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                    <Field label="Legal last name">
                      <Input
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                  </div>
                  <Field label="Email" className="mt-4">
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 rounded-lg border-[#E4E7EC]"
                    />
                    <p className="mt-1.5 text-xs text-[#667085]">
                      We&apos;ll send the contract and invite here.
                    </p>
                  </Field>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field label="Country of residence">
                      <CountryField
                        country={country}
                        open={countryOpen}
                        search={countrySearch}
                        countries={filteredCountries}
                        onOpenChange={setCountryOpen}
                        onSearch={setCountrySearch}
                        onSelect={setCountry}
                      />
                    </Field>
                    <Field label="Tax ID / TIN (optional)">
                      <Input
                        value={taxId}
                        onChange={(event) => setTaxId(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      disabled={!canContinueStep1}
                      onClick={() => setStep(2)}
                      className="h-10 rounded-lg bg-[#101828] px-4 text-white hover:bg-[#101828]/90"
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && kind === "employee" && (
                <>
                  <h1 className="text-3xl font-semibold text-[#101828]">
                    Role & pay
                  </h1>
                  <p className="mt-2 text-sm text-[#667085]">
                    What {firstName || "they"} will do, and how much
                    they&apos;ll be paid each payroll run.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <Field label="Job title">
                      <Input
                        value={jobTitle}
                        onChange={(event) => setJobTitle(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                    <Field label="Department">
                      <Input
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                        className="h-11 rounded-lg border-[#E4E7EC]"
                      />
                    </Field>
                    <Field label="Start date">
                      <DateField value={startDate} onChange={setStartDate} />
                    </Field>
                    <Field label="Manager (optional)">
                      <Select value={manager} onValueChange={setManager}>
                        <SelectTrigger className="w-full h-11! rounded-lg border-[#E4E7EC]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {managerName ? (
                            <SelectItem value={managerName}>
                              {managerName}
                            </SelectItem>
                          ) : null}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Employment type" className="mt-4">
                    <Segment
                      value={employment}
                      options={["Full-time", "Part-time"]}
                      onChange={setEmployment}
                    />
                  </Field>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field label="Salary">
                      <div className="flex h-11 items-center rounded-lg border border-[#E4E7EC] px-3 focus-within:border-[#0052FF]">
                        <span className="text-sm text-[#667085]">USD</span>
                        <input
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="ml-2 w-full bg-transparent text-sm outline-none"
                        />
                      </div>
                    </Field>
                    <Field label="Pay frequency">
                      <Select
                        value={frequency}
                        onValueChange={(value) =>
                          setFrequency(value as PaymentFrequency)
                        }
                      >
                        <SelectTrigger className="h-11! w-full rounded-lg border-[#E4E7EC]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <ContractField
                    label="Contract (optional)"
                    hint="PDF or DOCX, up to 2 MB"
                    file={contract}
                    inputRef={fileRef}
                    onFile={(file) => {
                      if (file.size > maxContractBytes) {
                        toast.error("Contract must be 2 MB or smaller");
                        return;
                      }
                      setContract(file);
                    }}
                  />
                  <p className="mt-4 flex gap-2 rounded-xl bg-[#F9FAFB] px-4 py-3 text-sm text-[#667085]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {firstName || "They"} joins the Helicode Core payroll
                      schedule.
                      {payrollDate
                        ? ` First payroll: ${payrollDate} — paid in USD${
                            localCurrency
                              ? ` or converted to ${localCurrency} at the live rate`
                              : ""
                          }.`
                        : ""}
                    </span>
                  </p>
                  <WizardNav
                    onBack={() => setStep(1)}
                    onContinue={() => setStep(3)}
                    continueDisabled={!canContinueStep2}
                  />
                </>
              )}

              {step === 2 && kind === "contractor" && (
                <>
                  <h1 className="text-3xl font-semibold text-[#101828]">
                    Contract & rate
                  </h1>
                  <p className="mt-2 text-sm text-[#667085]">
                    Set the scope and how {firstName || "they"} gets paid.
                  </p>
                  <Field label="Role" className="mt-8">
                    <Input
                      value={jobTitle}
                      onChange={(event) => setJobTitle(event.target.value)}
                      className="h-11 rounded-lg border-[#E4E7EC]"
                    />
                  </Field>
                  <Field label="Scope of work" className="mt-4">
                    <textarea
                      value={scope}
                      onChange={(event) => setScope(event.target.value)}
                      className="min-h-24 w-full rounded-lg border border-[#E4E7EC] px-3 py-2 text-sm outline-none focus:border-[#0052FF]"
                    />
                  </Field>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field label="Start date">
                      <DateField value={startDate} onChange={setStartDate} />
                    </Field>
                    <Field label="End date (optional)">
                      <DateField
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Ongoing"
                      />
                    </Field>
                  </div>
                  <Field label="Payment type" className="mt-4">
                    <Segment
                      value={
                        paymentType === "fixed"
                          ? "Fixed monthly"
                          : paymentType === "hourly"
                            ? "Hourly"
                            : "Per milestone"
                      }
                      options={["Fixed monthly", "Hourly", "Per milestone"]}
                      onChange={(value) =>
                        setPaymentType(
                          value === "Hourly"
                            ? "hourly"
                            : value === "Per milestone"
                              ? "milestone"
                              : "fixed",
                        )
                      }
                    />
                  </Field>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Field label="Rate">
                      <div className="flex h-11 items-center rounded-lg border border-[#E4E7EC] px-3 focus-within:border-[#0052FF]">
                        <span className="text-sm text-[#667085]">USD</span>
                        <input
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          className="ml-2 w-full bg-transparent text-sm outline-none"
                        />
                      </div>
                    </Field>
                    <Field label="Invoice cycle">
                      <Select
                        value={frequency}
                        onValueChange={(value) =>
                          setFrequency(value as PaymentFrequency)
                        }
                      >
                        <SelectTrigger className="h-11 w-full rounded-lg border-[#E4E7EC]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <ContractField
                    label="Contract (optional)"
                    hint="PDF or DOCX, up to 10 MB"
                    file={contract}
                    inputRef={fileRef}
                    onFile={(file) => {
                      if (file.size > maxContractBytes) {
                        toast.error("Contract must be 10 MB or smaller");
                        return;
                      }
                      setContract(file);
                    }}
                  />
                  <p className="mt-2 text-xs text-[#667085]">
                    Skip this to use Helicode&apos;s contractor agreement
                    template at review.
                  </p>
                  <p className="mt-4 flex gap-2 rounded-xl bg-[#F9FAFB] px-4 py-3 text-sm text-[#667085]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {firstName || "They"} submits an invoice{" "}
                      {frequency === "WEEKLY"
                        ? "each week"
                        : frequency === "DAILY"
                          ? "each day"
                          : frequency === "HOURLY"
                            ? "each hour"
                            : "each month"}
                      . Once you approve it, they&apos;re paid from your wallet
                      — usually within minutes.
                    </span>
                  </p>
                  <WizardNav
                    onBack={() => setStep(1)}
                    onContinue={() => setStep(3)}
                    continueDisabled={!canContinueStep2}
                  />
                </>
              )}

              {step === 3 && kind === "employee" && (
                <>
                  <h1 className="text-3xl font-semibold text-[#101828]">
                    Review & invite
                  </h1>
                  <p className="mt-2 text-sm text-[#667085]">
                    Check everything looks right. {firstName} gets an email
                    invite as soon as you confirm.
                  </p>
                  <ReviewCard
                    title="Personal info"
                    onEdit={() => setStep(1)}
                    rows={[
                      ["Name", `${firstName} ${lastName}`],
                      ["Personal email", email],
                      ["Country", country],
                    ]}
                  />
                  <ReviewCard
                    title="Role & pay"
                    onEdit={() => setStep(2)}
                    rows={[
                      ["Job title", jobTitle],
                      ["Start date", displayDate(startDate)],
                      ["Employment", employment],
                      ["Salary", rateLabel],
                      ["Contract", contract ? contract.name : "Not uploaded"],
                    ]}
                  />
                  <label className="mt-4 flex items-start gap-2 text-sm text-[#101828]">
                    <input
                      type="checkbox"
                      checked={sendInvite}
                      onChange={(event) => setSendInvite(event.target.checked)}
                      className="mt-0.5 accent-[#111113]"
                    />
                    <span className="font-medium">
                      Send invite email now
                      <span className="mt-0.5 block text-xs text-[#71717A]">
                        {firstName} will get a link to set up their account and
                        payout.
                      </span>
                    </span>
                  </label>
                  <WizardNav
                    onBack={() => setStep(2)}
                    onContinue={() => void submit()}
                    continueLabel={isSubmitting ? "Adding..." : "Add employee"}
                    continueDisabled={isSubmitting}
                  />
                </>
              )}

              {step === 3 && kind === "contractor" && (
                <>
                  <h1 className="text-3xl font-semibold text-[#101828]">
                    Review & send
                  </h1>
                  <p className="mt-2 text-sm text-[#667085]">
                    {firstName} gets the contract to sign and an invite to
                    Helicode.
                  </p>
                  <ReviewCard
                    title="Contractor info"
                    onEdit={() => setStep(1)}
                    rows={[
                      ["Name", `${firstName} ${lastName} · ${contractorType}`],
                      ["Email", email],
                      ["Country", country],
                    ]}
                  />
                  <ReviewCard
                    title="Contract & rate"
                    onEdit={() => setStep(2)}
                    rows={[
                      ["Role", jobTitle],
                      [
                        "Start date",
                        `${displayDate(startDate)}${endDate ? ` · ${displayDate(endDate)}` : " · Ongoing"}`,
                      ],
                      ["Rate", rateLabel],
                      ["Invoice cycle", `${frequencyLabel}, paid on approval`],
                      ["Contract", contract ? contract.name : "Not uploaded"],
                    ]}
                  />
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#EAECF0] px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[#101828]">
                        Generate contractor agreement
                      </p>
                      <p className="text-xs text-[#667085]">
                        Helicode template, sent for e-signature with the invite
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={generateAgreement}
                      onClick={() => setGenerateAgreement((value) => !value)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        generateAgreement ? "bg-[#101828]" : "bg-[#E4E7EC]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                          generateAgreement ? "left-5" : "left-0.5",
                        )}
                      />
                    </button>
                  </div>
                  <label className="mt-4 flex items-start gap-2 text-sm text-[#101828]">
                    <input
                      type="checkbox"
                      checked={sendInvite}
                      onChange={(event) => setSendInvite(event.target.checked)}
                      className="mt-0.5 accent-[#111113]"
                    />
                    <span>
                      Send invite email now
                      <span className="mt-0.5 block text-xs text-[#667085]">
                        {firstName} will get a link to sign and set up payouts.
                      </span>
                    </span>
                  </label>
                  <WizardNav
                    onBack={() => setStep(2)}
                    onContinue={() => void submit()}
                    continueLabel={
                      isSubmitting ? "Adding..." : "Add contractor"
                    }
                    continueDisabled={isSubmitting}
                  />
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-110">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute top-4 right-4 text-[#98A2B3]"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF3]">
            <Check className="h-6 w-6 text-[#12B76A]" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-[#101828]">
            {firstName} {lastName} has been added
          </DialogTitle>
          <p className="text-center text-sm text-[#667085]">
            {kind === "employee"
              ? `We've sent an invite to ${email}. They'll show as Invited on your Team page until they accept.`
              : generateAgreement
                ? `The contractor agreement and invite are on their way to ${email}.`
                : `An invite is on its way to ${email}.`}
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-[#EAECF0] px-3 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F7] text-xs font-semibold text-[#344054]">
              {initials(firstName, lastName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#101828]">
                {firstName} {lastName}
              </span>
              <span className="block text-xs text-[#667085]">
                {kind === "employee"
                  ? `${jobTitle} · ${employment} · $${money(amount)}${
                      frequency === "WEEKLY"
                        ? "/wk"
                        : frequency === "DAILY"
                          ? "/day"
                          : frequency === "HOURLY"
                            ? "/hr"
                            : "/mo"
                    }`
                  : paymentType === "hourly"
                    ? `${jobTitle} · $${money(amount)}/hr`
                    : paymentType === "milestone"
                      ? `${jobTitle} · $${money(amount)} / milestone`
                      : `${jobTitle} · $${money(amount)}/mo fixed`}
              </span>
            </span>
            <span className="rounded-full bg-[#FFF6ED] px-2 py-0.5 text-xs font-medium text-[#F79009]">
              Invited
            </span>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] px-4 py-3">
            <p className="text-sm font-medium text-[#101828]">
              What happens next
            </p>
            <ol className="mt-3 space-y-2 text-sm text-[#344054]">
              {kind === "employee" ? (
                <>
                  <li>
                    1. {firstName} accepts the invite and verifies their ID
                  </li>
                  <li>
                    2. {firstName} adds their bank or mobile money details for
                    payouts
                  </li>
                  <li>
                    3. {firstName} is included in your next payroll run
                    {payrollDate ? ` on ${payrollDate}` : ""}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    1. {firstName} signs the agreement and verifies their ID
                  </li>
                  <li>
                    2. {firstName} adds their payout details — bank, mobile
                    money or USD
                  </li>
                  <li>
                    3. {firstName} submits their first invoice for you to
                    approve
                  </li>
                </>
              )}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="h-11 rounded-lg border-[#D0D5DD]"
            >
              Add another
            </Button>
            <Button
              type="button"
              onClick={close}
              className="h-11 rounded-lg bg-[#101828] text-white hover:bg-[#101828]/90"
            >
              Go to Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepMark({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M14.667 7.387v.613a6.667 6.667 0 1 1-3.954-6.093"
          stroke="#12B76A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.667 2.667 8 9.34 6 7.34"
          stroke="#12B76A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (active) {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#101828]">
        <span className="h-2 w-2 rounded-full bg-[#101828]" />
      </span>
    );
  }

  return (
    <span className="h-4 w-4 shrink-0 rounded-full border border-[#D0D5DD]" />
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-[#344054]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-lg bg-[#F2F4F7] p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "h-9 rounded-md text-sm font-medium",
            value === option
              ? "bg-white text-[#101828] shadow-sm"
              : "text-[#667085]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function CountryField({
  country,
  open,
  search,
  countries,
  onOpenChange,
  onSearch,
  onSelect,
}: {
  country: string;
  open: boolean;
  search: string;
  countries: { code: string; name: string }[];
  onOpenChange: (open: boolean) => void;
  onSearch: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-lg border border-[#E4E7EC] bg-white px-3 text-sm text-[#101828]"
        >
          <span className="flex items-center gap-2 truncate">
            {country ? (
              <>
                <span>{getFlagEmoji(country)}</span>
                {country}
              </>
            ) : (
              <span className="text-[#98A2B3]">Select</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-[#667085]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <div className="border-b border-[#E4E7EC] p-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <Input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search country..."
              className="h-9 pl-8"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {countries.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                onSelect(item.name);
                onOpenChange(false);
                onSearch("");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[#F9FAFB]"
            >
              <span>{getFlagEmoji(item.name)}</span>
              {item.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DateField({
  value,
  onChange,
  placeholder = "Select",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-lg border border-[#E4E7EC] bg-white px-3 text-sm"
        >
          <span className={value ? "text-[#101828]" : "text-[#98A2B3]"}>
            {value ? displayDate(value) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-[#667085]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}

function ContractField({
  label,
  hint,
  file,
  inputRef,
  onFile,
}: {
  label: string;
  hint: string;
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-sm font-medium text-[#344054]">{label}</p>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#D0D5DD] px-4 py-3">
        <div className="flex items-center gap-3">
          <Upload className="h-4 w-4 text-[#667085]" />
          <span>
            <span className="block text-sm font-medium text-[#101828]">
              {file ? file.name : "Upload a signed contract"}
            </span>
            <span className="block text-xs text-[#667085]">{hint}</span>
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="h-9 rounded-lg border-[#D0D5DD]"
        >
          Browse
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (next) onFile(next);
        }}
      />
    </div>
  );
}

function ReviewCard({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-[#EAECF0]">
      <div className="flex items-center justify-between bg-[#F9FAFB] px-4 py-3">
        <p className="text-sm font-medium text-[#101828]">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-[#0052FF]"
        >
          Edit
        </button>
      </div>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[160px_1fr] gap-3 border-t border-[#F2F4F7] px-4 py-3 text-sm"
        >
          <span className="text-[#667085]">{label}</span>
          <span className="flex items-center gap-2 font-medium text-[#101828]">
            {(label === "Country" || label === "Country of residence") &&
            value ? (
              <span>{getFlagEmoji(value.split(" · ")[0])}</span>
            ) : null}
            {value}
          </span>
        </div>
      ))}
    </section>
  );
}

function WizardNav({
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
}: {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="h-10 rounded-lg border-[#D0D5DD] px-4"
      >
        Back
      </Button>
      <Button
        type="button"
        disabled={continueDisabled}
        onClick={onContinue}
        className="h-10 rounded-lg bg-[#101828] px-4 text-white hover:bg-[#101828]/90"
      >
        {continueLabel}
      </Button>
    </div>
  );
}
