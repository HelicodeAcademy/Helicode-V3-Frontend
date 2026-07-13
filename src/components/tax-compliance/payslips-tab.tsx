"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { overviewByCountry, payslipsByCountry, type CountryCode } from "@/lib/tax-compliance-data";
import { StatusPill } from "@/components/tax-compliance/status-badge";

export function PayslipsTab({ country }: { country: CountryCode }) {
  const rows = payslipsByCountry[country];
  const overview = overviewByCountry[country];

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Mandated payslips</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {overview.payslipsGenerated} of {overview.payslipsTotal} payslips generated for this pay
            period, in the format required by local law.
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Download className="size-3.5" />
          Download all (ZIP)
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Employee</TableHead>
            <TableHead className="text-xs">Pay period</TableHead>
            <TableHead className="text-xs text-right">Net pay</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Reason</TableHead>
            <TableHead className="text-xs text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-sm text-foreground">{row.employee}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.payPeriod}</TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">{row.netPay}</TableCell>
              <TableCell>
                <StatusPill label={row.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.reason ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" disabled={row.status !== "Generated"}>
                  <Download className="size-3.5" />
                  {row.status === "Generated" ? "Download" : "Resolve"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
