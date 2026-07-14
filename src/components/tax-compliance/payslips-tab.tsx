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
import {
  overviewByCountry,
  payslipsByCountry,
  type CountryCode,
} from "@/lib/tax-compliance-data";
import { StatusPill } from "@/components/tax-compliance/status-badge";

export function PayslipsTab({ country }: { country: CountryCode }) {
  const rows = payslipsByCountry[country];
  const overview = overviewByCountry[country];

  return (
    <section className="rounded-xl border border-[#00000014] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-black">
            Mandated payslips
          </h2>
          <p className="mt-1 text-xs text-[#475367]">
            {overview.payslipsGenerated} of {overview.payslipsTotal} payslips
            generated for this pay period, in the format required by local law.
          </p>
        </div>
        {/* <button className="flex items-center gap-2 rounded-lg border border-[#00000014] bg-white px-3 py-2 text-sm text-[#0F112A] transition-all hover:bg-[#F9FAFB]"> */}
        <Button className="text-white">
          <Download className="size-3.5" />
          Download all (ZIP)
        </Button>
        {/* </button> */}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Employee
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Pay period
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase text-right">
              Net pay
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Status
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Reason
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-[#00000014]">
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-sm text-black/80 font-medium">
                {row.employee}
              </TableCell>
              <TableCell className="text-sm text-black/80 font-medium">
                {row.payPeriod}
              </TableCell>
              <TableCell className="text-right text-sm text-black/80 font-medium">
                {row.netPay}
              </TableCell>
              <TableCell>
                <StatusPill label={row.status} />
              </TableCell>
              <TableCell className="text-sm text-black/80 font-medium">
                {row.reason ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  disabled={row.status !== "Generated"}
                  className="text-white"
                >
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
