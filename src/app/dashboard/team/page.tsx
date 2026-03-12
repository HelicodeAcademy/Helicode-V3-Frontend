"use client";

import { useContext, useEffect, useCallback, useState } from "react";
import { PageTitleContext } from "../layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Send } from "lucide-react";
import Link from "next/link";
// import { TeamTable, type TeamMember } from "@/components/team/team-table";
import { TeamTable } from "@/components/team/team-table";
import { useTeamStore } from "@/store/team-store";
import { getTeamMembers } from "@/lib/team-service";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks/use-debounce";

const ITEMS_PER_PAGE = 10;

export default function TeamPage() {
  const { setTitle } = useContext(PageTitleContext);
  const {
    members,
    totalCount,
    filters,
    isLoading,
    setMembers,
    setFilters,
    setIsLoading,
    setError,
  } = useTeamStore();

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  useEffect(() => {
    setTitle("Team");
  }, [setTitle]);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTeamMembers(filters);
      setMembers(result.data, result.total);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load team members.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, setMembers, setIsLoading, setError]);

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Sync debounced search into filters (resets to page 1)
  useEffect(() => {
    setFilters({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, setFilters]);

  return (
    <div className="px-8 py-8">
      {/* Filters and Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-101">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-11 border-[#E4E7EC] rounded-3xl"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select
            // value={filters.type || "all"}
            value={filters.type || ""}
            onValueChange={(val) =>
              setFilters({
                // type: val === "all" ? "" : (val as "CONTRACTOR" | "EMPLOYEE"),
                type: val === "" ? "" : (val as "CONTRACTOR" | "EMPLOYEE"),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-34 h-11! rounded-3xl text-[#0F112A]! text-sm font-medium border-[#E4E7EC] bg-[#f9fafb]">
              <SelectValue placeholder="Worker type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
              <SelectItem value="CONTRACTOR">Contractor</SelectItem>
            </SelectContent>
          </Select>

          <Select
            // value={filters.status || "all"}
            value={filters.status || ""}
            onValueChange={(val) =>
              setFilters({
                // status: val === "all" ? "" : (val as "Active" | "Inactive"),
                status: val === "" ? "" : (val as "Active" | "Inactive"),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-24.25 h-11! border-[#E4E7EC] text-[#0F112A]! text-sm font-medium rounded-3xl bg-[#f9fafb]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1"></div>

        {/* Add New Hire Button */}
        <Button
          asChild
          variant={"primary"}
          className="hover:bg-[#101828]/90  gap-2"
        >
          <Link href="/dashboard/team/add">
            <Send className="h-4 w-4" />
            Add new hire
          </Link>
        </Button>
      </div>

      {/* Team Table */}
      <TeamTable
        members={members}
        currentPage={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => setFilters({ page })}
        onRevoked={fetchMembers}
        isLoading={isLoading}
      />
    </div>
  );
}
