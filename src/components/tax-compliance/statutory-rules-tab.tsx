"use client";

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
  countries,
  payeBandsByCountry,
  statutoryDeductionsByCountry,
  type CountryCode,
} from "@/lib/tax-compliance-data";
import { StatusPill } from "@/components/tax-compliance/status-badge";

export function StatutoryRulesTab({ country }: { country: CountryCode }) {
  const countryName =
    countries.find((c) => c.code === country)?.name ?? country;
  const bands = payeBandsByCountry[country];
  const deductions = statutoryDeductionsByCountry[country];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#00000014] p-5">
        <div className="mb-4 flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-black">
            Income tax (PAYE) bands — {countryName}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#475367]">
              SARS tax tables · 2026/27 year of assessment · applied
              automatically
            </span>
            <Button size="sm" variant="ghost" className="text-xs">
              Version history
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-black/80 font-medium uppercase">
                Taxable income (annual)
              </TableHead>
              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                Rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bands.map((band) => (
              <TableRow key={band.band}>
                <TableCell className="text-sm text-black/80">
                  {band.band}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-black">
                  {band.rate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded-xl border border-[#00000014] p-5">
        <div className="mb-4 flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-black">
            Statutory deductions &amp; contributions — {countryName}
          </h2>
          <span className="text-xs text-[#475367]">
            Applied automatically to every payroll run
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-black/80 font-medium uppercase">
                Deduction
              </TableHead>
              <TableHead className="text-xs text-black/80 font-medium uppercase">
                Legal basis
              </TableHead>
              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                Employer
              </TableHead>
              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                Employee
              </TableHead>
              <TableHead className="text-xs text-black/80 font-medium uppercase">
                Basis
              </TableHead>
              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((deduction) => (
              <TableRow key={deduction.deduction}>
                <TableCell className="text-sm font-medium text-black/80">
                  {deduction.deduction}
                </TableCell>
                <TableCell className="text-sm text-black/80">
                  {deduction.legalBasis}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80">
                  {deduction.employer}
                </TableCell>
                <TableCell className="text-right text-sm text-black/80">
                  {deduction.employee}
                </TableCell>
                <TableCell className="text-sm text-black/80">
                  {deduction.basis}
                </TableCell>
                <TableCell className="text-right">
                  <StatusPill label={deduction.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
