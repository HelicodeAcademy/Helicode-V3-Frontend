"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionsFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  workerType: string;
  onWorkerTypeChange: (type: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
}

export function TransactionsFilters({
  searchTerm,
  onSearchChange,
  workerType,
  onWorkerTypeChange,
  status,
  onStatusChange,
}: TransactionsFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-5 px-6">
      <Input
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 max-w-101 border-[#E4E7EC]"
      />

      <Select value={workerType} onValueChange={onWorkerTypeChange}>
        <SelectTrigger className="w-33.5 text-[#0F112A]! font-medium border-[#E4E7EC]">
          <SelectValue placeholder="Worker type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Workers</SelectItem>
          <SelectItem value="contractor">Contractor</SelectItem>
          <SelectItem value="employee">Employee</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-33.5 text-[#0F112A]! font-medium border-[#E4E7EC]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      <Button className="ml-auto text-white">Download Report</Button>
    </div>
  );
}
