"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxComplianceHeader } from "@/components/tax-compliance/tax-compliance-header";
import { OverviewTab } from "@/components/tax-compliance/overview-tab";
import { StatutoryRulesTab } from "@/components/tax-compliance/statutory-rules-tab";
import { VariablePayTab } from "@/components/tax-compliance/variable-pay-tab";
import { FilingsRemittancesTab } from "@/components/tax-compliance/filings-remittances-tab";
import { ReportsTab } from "@/components/tax-compliance/reports-tab";
import { PayslipsTab } from "@/components/tax-compliance/payslips-tab";
import { CoverageTab } from "@/components/tax-compliance/coverage-tab";
import {
  overviewByCountry,
  payPeriods,
  type CountryCode,
} from "@/lib/tax-compliance-data";

const TAB_ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "statutory-rules", label: "Statutory Rules" },
  { value: "variable-pay", label: "Variable Pay & Rate Changes" },
  { value: "filings", label: "Filings & Remittances" },
  { value: "reports", label: "Reports" },
  { value: "payslips", label: "Payslips" },
  { value: "coverage", label: "Coverage" },
] as const;

export function TaxCompliance() {
  const [country, setCountry] = useState<CountryCode>("NG");
  const [payPeriod, setPayPeriod] = useState(payPeriods[payPeriods.length - 1]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const exceptionsCount = overviewByCountry[country].exceptionsCount;

  return (
    <div className="dark min-h-screen bg-white px-6 py-8 text-foreground sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <TaxComplianceHeader
          country={country}
          onCountryChange={setCountry}
          payPeriod={payPeriod}
          onPayPeriodChange={setPayPeriod}
          onOpenCoverage={() => setActiveTab("coverage")}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-[#00000014] w-full">
            {TAB_ITEMS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-black/70"
              >
                {tab.label}
                {tab.value === "overview" && exceptionsCount > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-semibold text-red-600 p">
                    {exceptionsCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="pt-4">
            <OverviewTab country={country} />
          </TabsContent>
          <TabsContent value="statutory-rules" className="pt-4">
            <StatutoryRulesTab country={country} />
          </TabsContent>
          <TabsContent value="variable-pay" className="pt-4">
            <VariablePayTab country={country} />
          </TabsContent>
          <TabsContent value="filings" className="pt-4">
            <FilingsRemittancesTab />
          </TabsContent>
          <TabsContent value="reports" className="pt-4">
            <ReportsTab country={country} />
          </TabsContent>
          <TabsContent value="payslips" className="pt-4">
            <PayslipsTab country={country} />
          </TabsContent>
          <TabsContent value="coverage" className="pt-4">
            <CoverageTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
