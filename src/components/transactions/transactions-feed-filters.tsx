"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionsFeedView } from "@/lib/transactions-feed-service";

interface TransactionsFeedFiltersProps {
  view: TransactionsFeedView;
  onViewChange: (view: TransactionsFeedView) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  workerType: string;
  onWorkerTypeChange: (workerType: string) => void;
}

export function TransactionsFeedFilters({
  view,
  onViewChange,
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  workerType,
  onWorkerTypeChange,
}: TransactionsFeedFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="inline-flex w-fit rounded-lg border border-[#E4E7EC] bg-[#F1F2F3] p-1">
        <button
          type="button"
          onClick={() => onViewChange("company")}
          className={`rounded-md px-4 py-2 text-sm transition-colors ${
            view === "company"
              ? "bg-white text-[#0F112A] font-bold shadow-sm"
              : "text-[#0F112A] font-medium hover:text-[#0F112A]"
          }`}
        >
          Company
        </button>
        <button
          type="button"
          onClick={() => onViewChange("people")}
          className={`rounded-md px-4 py-2 text-sm transition-colors ${
            view === "people"
              ? "bg-white text-[#0F112A] font-bold shadow-sm"
              : "text-[#0F112A] font-medium hover:text-[#0F112A]"
          }`}
        >
          People
        </button>
      </div>

      <div className="flex-1"></div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 border-[#E4E7EC] pl-9 placeholder:text-[#7E7E81]"
        />
      </div>

      {view === "people" && (
        <Select value={workerType} onValueChange={onWorkerTypeChange}>
          <SelectTrigger className="h-10 w-full border-[#E4E7EC] font-medium text-[#0F112A] lg:w-40">
            <SelectValue placeholder="Worker type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workers</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
          </SelectContent>
        </Select>
      )}

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-10 w-full border-[#E4E7EC] font-medium text-[#0F112A] lg:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status</SelectItem>
          {view === "company" ? (
            <>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
