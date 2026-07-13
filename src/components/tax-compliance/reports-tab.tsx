"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
} from "lucide-react";
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
  reconciliationByCountry,
  type CountryCode,
} from "@/lib/tax-compliance-data";

export function ReportsTab({ country }: { country: CountryCode }) {
  const countryName =
    countries.find((c) => c.code === country)?.name ?? country;
  const rows = reconciliationByCountry[country];
  // const netPayRow = rows.find((r) => r.component === "Net pay");

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#00000014]">
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-black">
            Payroll reconciliation — June vs July 2026 ({countryName})
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border border-[#00000014]! text-black"
            >
              <FileSpreadsheet className="size-3.5" />
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border border-[#00000014]! text-black"
            >
              <Download className="size-3.5" />
              PDF
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-black/80 font-medium uppercase">
                Company
              </TableHead>
              <TableHead className="text-xs  text-black/80 font-medium uppercase">
                Jun 2026
              </TableHead>
              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                Jul 2026
              </TableHead>

              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                Variance
              </TableHead>
              <TableHead className="text-xs text-right text-black/80 font-medium uppercase">
                %
              </TableHead>
              <TableHead className="text-xs text-black/80 font-medium uppercase">
                Driver
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#00000017]">
            {rows.map((row) => (
              <TableRow
                key={row.component}
                className={
                  row.component === "Net pay" ? "font-medium" : undefined
                }
              >
                <TableCell className="text-sm font-medium text-black/80">
                  {row.component}
                </TableCell>
                <TableCell className="text-sm font-medium text-black/80">
                  {row.prevPeriod}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-black/80">
                  {row.currentPeriod}
                </TableCell>

                <TableCell className="text-right text-sm">
                  <span
                    className={`inline-flex items-center gap-1 ${
                      row.varianceDirection === "up"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {row.varianceDirection === "up" ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                    {row.variance}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">
                  <span
                    className={`inline-flex items-center gap-1 ${
                      row.varianceDirection === "up"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {row.varianceDirection === "up" ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                    {row.variance}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.comment || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
