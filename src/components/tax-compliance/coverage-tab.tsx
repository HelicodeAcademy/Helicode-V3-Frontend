"use client";

import { Button } from "@/components/ui/button";
import { coverageMarkets } from "@/lib/tax-compliance-data";
import { StatusPill, stageLabel, stageToTone } from "@/components/tax-compliance/status-badge";

export function CoverageTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Country coverage — {coverageMarkets.length} requested markets
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Native statutory engine status per country.
          </p>
        </div>
        <Button size="sm">Request a country</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {coverageMarkets.map((market) => (
          <div key={market.code} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {market.flag} {market.name}
              </span>
            </div>
            <div className="mt-2">
              <StatusPill label={stageLabel(market.stage)} tone={stageToTone(market.stage)} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{market.detail}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">What &quot;Live&quot; means</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 font-medium text-emerald-400">Live</dt>
            <dd className="text-muted-foreground">
              Full native engine: PAYE bands, statutory deductions, filing calendar, authority-formatted
              returns and mandated payslips — maintained against current legislation with effective-dated
              versioning.
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 font-medium text-sky-400">In build</dt>
            <dd className="text-muted-foreground">
              Rules under development and legal review; payroll can run via a verified in-country partner
              in the meantime.
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 font-medium text-muted-foreground">Planned</dt>
            <dd className="text-muted-foreground">
              On the roadmap; register interest to prioritize.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
