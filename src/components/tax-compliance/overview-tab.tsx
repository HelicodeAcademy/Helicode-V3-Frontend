"use client";

import { CalendarDays, ArrowRight, Divide } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  exceptionsByCountry,
  liabilityByCountry,
  upcomingDeadlines,
  type CountryCode,
} from "@/lib/tax-compliance-data";
import { StatusPill } from "@/components/tax-compliance/status-badge";

export function OverviewTab({ country }: { country: CountryCode }) {
  const exceptions = exceptionsByCountry[country];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-[#00000014] py-5">
        <div className="mb-4 flex items-center space-x-2 border-b border-[#00000014] pb-3 px-5">
          <h2 className="text-sm font-semibold text-black">
            Compliance exceptions
          </h2>
          <span className="text-xs text-[#475367]">
            Must be resolved before payroll close
          </span>
        </div>
        <ul className="space-y-3 px-2">
          {exceptions.map((exception) => (
            <li
              key={exception.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                    exception.severity === "critical"
                      ? "bg-red-700"
                      : exception.severity === "warning"
                        ? "bg-amber-500"
                        : "bg-sky-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-black">
                    {exception.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#475367]">
                    {exception.description}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-none shadow-none text-[#0052FF] hover:bg-[#0052FF1A]"
              >
                {exception.action}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-[#00000014] py-5">
        <div className="flex items-center justify-between border-b border-[#00000014] pb-3 px-5">
          <h2 className="text-sm font-semibold text-black">
            Upcoming statutory deadlines
          </h2>
          <button className="text-xs text-[#0052FF] font-bold flex items-center gap-1.5">
            View calendarss <ArrowRight size={16} />
          </button>
        </div>

        {/* Upcoming statutory deadlines */}

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 px-5 border-b border-[#00000014]">
              <TableHead className="text-xs text-black/70 uppercase px-5">
                Obligation
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase">
                Country
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase">
                Due
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#00000014]">
            {upcomingDeadlines.map((deadline) => (
              <TableRow key={deadline.id} className="font-medium">
                <TableCell className="px-5 py-4 text-sm text-black/80">
                  {deadline.obligation}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-black/80">
                  {deadline.country}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-black/80">
                  {deadline.due}
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <StatusPill label={deadline.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border border-[#00000014] lg:col-span-2">
        <div className="flex items-center space-x-2 p-5">
          <h2 className="text-sm font-semibold text-black">
            Statutory liability by country — July 2026 (projected)
          </h2>
          <span className="text-xs text-[#475367]">
            Recalculates with each payroll close and rate change
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-t border-b border-[#00000014]">
              <TableHead className="text-xs text-black/70 uppercase px-5">
                Country
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                Employees
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                PAYE
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                PENSION / SOCIAL SECURITY
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                Other statutory
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                Employer cost
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase text-right px-5">
                Total remittance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#00000014]">
            {liabilityByCountry.map((row) => (
              <TableRow key={row.country}>
                <TableCell className="text-sm text-black/80 font-medium px-5">
                  {row.countryName}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80 font-medium px-5">
                  {row.employees}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80 font-medium px-5">
                  {row.paye}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80 font-medium px-5">
                  {row.socialSecurity}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80 font-medium px-5">
                  {row.otherStatutory}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80 font-medium px-5">
                  {row.employerCost}
                </TableCell>
                <TableCell className="text-right text-sm font-bold text-black px-5">
                  {row.totalRemittance}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
