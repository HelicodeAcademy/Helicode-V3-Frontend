"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  variablePayByCountry,
  type CountryCode,
} from "@/lib/tax-compliance-data";
import { StatusPill } from "@/components/tax-compliance/status-badge";

export function VariablePayTab({ country }: { country: CountryCode }) {
  const [search, setSearch] = useState("");
  const items = variablePayByCountry[country];

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.employee.toLowerCase().includes(q) ||
        item.element.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#00000014]">
        <div className="flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex space-x-2 items-center">
            <h2 className="text-sm font-semibold text-black">
              Variable pay inputs — July 2026
            </h2>

            <p className="text-xs text-[#475367]">
              Bonuses, overtime, commissions, arrears. All items taxed per
              country rules.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="h-8 w-52 border-[#00000014] pl-8 text-sm text-black placeholder:text-muted-foreground"
              />
            </div>
            <Button
              size="sm"
              className="border-[#00000014]! text-sm bg-white border"
            >
              <Upload className="size-3.5" />
              Import CSV
            </Button>
            <Button
              size="sm"
              variant={"primary"}
              className="text-sm text-white"
            >
              <Plus className="size-3.5" />
              Add item
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 px-5 border-b border-t border-[#00000014]">
              <TableHead className="text-xs text-black/70 uppercase px-5">
                Employee
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase px-5">
                Country
              </TableHead>
              <TableHead className="text-xs text-black/70 uppercase px-5">
                Element
              </TableHead>
              <TableHead className="text-xs text-black/70 text-right uppercase px-5">
                Amount
              </TableHead>
              <TableHead className="text-xs text-black/70 text-right uppercase px-5">
                Taxable
              </TableHead>
              <TableHead className="text-xs text-black/70 text-right uppercase px-5">
                Tax Impact
              </TableHead>
              <TableHead className="text-xs text-black/70 text-right px-5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#00000014]">
            {filtered.map((item) => (
              <TableRow key={item.id} className="font-medium">
                <TableCell className="text-sm text-black/70 font-medium px-5 py-4">
                  {item.employee}
                </TableCell>
                <TableCell className="text-sm text-black/70 font-medium px-5">
                  Nigeria
                </TableCell>
                <TableCell className="text-sm text-black/70 px-5">
                  {item.element}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-black/70 px-5">
                  {item.amount}
                </TableCell>
                <TableCell className="text-right text-sm text-black/70 px-5">
                  {item.taxable ? "Taxable" : "Non-taxable"}
                </TableCell>

                <TableCell className="text-right text-sm text-black/70 px-5">
                  +#178, 500 PAYE
                </TableCell>
                <TableCell className="text-right">
                  <StatusPill label={item.status} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-sm text-black/70"
                >
                  No matching variable pay items.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="flex items-center justify-between rounded-xl border border-[#00000014] p-5">
        <div>
          <h2 className="text-sm font-semibold text-black">
            Salary rate changes
          </h2>
          <p className="mt-1 text-xs text-[#475367]">
            Effective-dated, and deductions recalculate automatically.
            Mid-period prorated.
          </p>
        </div>
        <Button size="sm" className="text-white">
          <Plus className="size-3.5" />
          New rate change
        </Button>
      </section>
    </div>
  );
}
