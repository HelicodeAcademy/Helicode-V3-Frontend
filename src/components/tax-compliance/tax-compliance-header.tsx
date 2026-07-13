"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  countries,
  overviewByCountry,
  payPeriods,
  type CountryCode,
} from "@/lib/tax-compliance-data";
import { cn } from "@/lib/utils";

export function TaxComplianceHeader({
  country,
  onCountryChange,
  payPeriod,
  onPayPeriodChange,
  onOpenCoverage,
}: {
  country: CountryCode;
  onCountryChange: (value: CountryCode) => void;
  payPeriod: string;
  onPayPeriodChange: (value: string) => void;
  onOpenCoverage: () => void;
}) {
  const overview = overviewByCountry[country];
  const isAttention =
    overview.status === "attention" || overview.status === "critical";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-black">
          Tax &amp; Compliance
        </h1>
        <p className="mt-1 text-sm text-[#475367]">
          Statutory rules, deductions, filings and mandated payslips for every
          country you pay in.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              Country
            </span>
            <Select
              value={country}
              onValueChange={(v) => onCountryChange(v as CountryCode)}
            >
              <SelectTrigger className="w-44 border-[#00000014] h-8! text-sm rounded-lg font-medium text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="mr-1">{c.flag}</span>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-bold">
              Pay period
            </span>
            <Select value={payPeriod} onValueChange={onPayPeriodChange}>
              <SelectTrigger className="w-48 border-[#00000014] h-8! text-sm rounded-lg font-medium text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {payPeriods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onOpenCoverage}
            className="border! border-[#0052FF]! text-[#0052FF]"
          >
            {/* <Globe2 className="size-4" /> */}
            Country coverage
          </Button>
          <Button className="bg-[#0052FF] text-white hover:bg-[#0052FF]/90">
            {/* <ShieldCheck className="size-4" /> */}
            Run compliance check
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Compliance status">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-2xl font-bold",
                isAttention ? "text-amber-500" : "text-emerald-400",
              )}
            >
              {isAttention ? "Needs attention" : "All clear"}
            </span>
          </div>
          <p className="mt-1 text-xs text-amber-400">
            {overview.exceptionsCount} exceptions blocking payroll close
          </p>
        </SummaryCard>

        <SummaryCard label="Statutory liability — Jul">
          <span className="text-2xl font-bold text-black">
            {overview.statutoryLiabilityLabel}
          </span>
          <p className="mt-1 text-xs text-black font-medium">
            PAYE, pension, NHF, NSITF, ITF
          </p>
        </SummaryCard>

        <SummaryCard label="Filings due ≤ 14 days">
          <span className="text-2xl font-bold text-black">
            {overview.filingsDueCount}
          </span>
          <p className="mt-1 text-xs text-red-700">{overview.filingsDueNote}</p>
        </SummaryCard>

        <SummaryCard label="Payslips generated">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-black">
              {overview.payslipsGenerated}
            </span>
            <span className="text-sm text-black font-semibold">
              / {overview.payslipsTotal}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${Math.round(
                  (overview.payslipsGenerated / overview.payslipsTotal) * 100,
                )}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-black font-medium">
            {overview.payslipsPending} pending employee TIN
          </p>
        </SummaryCard>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#00000014] bg-white p-4">
      <p className="text-xs text-[#475367] font-medium">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
