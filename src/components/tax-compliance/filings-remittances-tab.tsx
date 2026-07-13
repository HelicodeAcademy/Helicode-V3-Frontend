"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { filings } from "@/lib/tax-compliance-data";
import { StatusPill } from "@/components/tax-compliance/status-badge";

const countryFilters = [
  "All countries",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Ghana",
];
const statusFilters = [
  "All statuses",
  "Overdue",
  "Due today",
  "Filed",
  "Scheduled",
];

const countryNameMap: Record<string, string> = {
  NG: "Nigeria",
  KE: "Kenya",
  ZA: "South Africa",
  GH: "Ghana",
};

export function FilingsRemittancesTab() {
  const [countryFilter, setCountryFilter] = useState(countryFilters[0]);
  const [statusFilter, setStatusFilter] = useState(statusFilters[0]);

  const filtered = useMemo(() => {
    return filings.filter((filing) => {
      const countryMatch =
        countryFilter === "All countries" ||
        countryNameMap[filing.country] === countryFilter;
      const statusMatch =
        statusFilter === "All statuses" || filing.status === statusFilter;
      return countryMatch && statusMatch;
    });
  }, [countryFilter, statusFilter]);

  return (
    <section className="rounded-xl border border-[#00000014]">
      <div className="flex flex-wrap items-center gap-3 p-5">
        <h2 className="text-sm font-semibold text-black">
          Statutory filings &amp; remittances
        </h2>
        <p className="text-xs text-[#475367]">
          Deadlines generated from each country&apos;s legislation
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 px-5">
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="h-8 w-40 border-[#00000014] text-sm rounded-lg font-medium text-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryFilters.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs border-[#00000014] rounded-lg font-medium text-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Obligation
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Country
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Authority
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Due date
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase text-right">
              Amount
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase">
              Status
            </TableHead>
            <TableHead className="text-xs text-black/80 font-medium uppercase text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-[#00000014]">
          {filtered.map((filing) => (
            <TableRow key={filing.id}>
              <TableCell className="text-sm text-black/80 font-medium">
                {filing.obligation}
              </TableCell>
              <TableCell className="text-sm text-black/80 font-medium">
                {filing.country}
              </TableCell>
              <TableCell className="text-sm text-black/80 font-medium">
                {filing.authority}
              </TableCell>
              <TableCell className="text-sm text-black/80 font-medium">
                {filing.dueDate}
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-foreground">
                {filing.amount}
              </TableCell>
              <TableCell>
                <StatusPill label={filing.status} />
              </TableCell>
              <TableCell className="text-right">
                <button className="text-blue-900 font-medium">
                  {filing.actionLabel}
                </button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-center text-sm text-black/80 font-medium"
              >
                No filings match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
