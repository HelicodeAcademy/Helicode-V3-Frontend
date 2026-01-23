"use client";

import { useContext, useEffect } from "react";
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
import { TeamTable, type TeamMember } from "@/components/team/team-table";

// Sample team data
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "Kenya",
    workerType: "Contractor",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 2,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "Singapore",
    workerType: "Contractor",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 3,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "Rwanda",
    workerType: "Employee",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 4,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "United States",
    workerType: "Contractor",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 5,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "Rwanda",
    workerType: "Contractor",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 6,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "Namibia",
    workerType: "Employee",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 7,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "Ghana",
    workerType: "Contractor",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
  {
    id: 8,
    name: "Vandross Idiake",
    role: "Software Engineer",
    country: "United Kingdom",
    workerType: "Contractor",
    dateJoined: "Dec 4th 2025",
    status: "Active",
  },
];

export default function TeamPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Team");
  }, [setTitle]);

  return (
    <div className="px-8 py-8">
      {/* Filters and Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-101">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
          <Input
            placeholder=""
            className="pl-10 h-11 border-[#E4E7EC] rounded-3xl"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select>
            <SelectTrigger className="w-34 h-11! rounded-3xl text-[#0F112A]! text-sm font-medium border-[#E4E7EC] bg-[#f9fafb]">
              <SelectValue placeholder="Worker type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-24.25 h-11! border-[#E4E7EC] text-[#0F112A]! text-sm font-medium rounded-3xl bg-[#f9fafb]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
      <TeamTable members={teamMembers} />
    </div>
  );
}
