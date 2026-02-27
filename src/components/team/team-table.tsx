"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

// Country flags mapping
const countryFlags: Record<string, string> = {
  Kenya: "🇰🇪",
  Singapore: "🇸🇬",
  Rwanda: "🇷🇼",
  "United States": "🇺🇸",
  Namibia: "🇳🇦",
  Ghana: "🇬🇭",
  "United Kingdom": "🇬🇧",
};

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  country: string;
  workerType: string;
  salary: string;
  dateJoined: string;
  status: string;
}

interface TeamTableProps {
  members: TeamMember[];
}

export function TeamTable({ members }: TeamTableProps) {
  return (
    <div className="border border-[#eaeaea] rounded-3xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9FAFB]">
            <TableHead className="text-[##344054] text-xs font-medium py-4 px-6 uppercase">
              Name
            </TableHead>
            <TableHead className="text-[##344054] text-xs font-medium py-4 uppercase">
              Country
            </TableHead>
            <TableHead className="text-[##344054] text-xs font-medium py-4 uppercase">
              Worker type
            </TableHead>
            <TableHead className="text-[##344054] text-xs font-medium py-4 uppercase">
              Salary
            </TableHead>
            <TableHead className="text-[##344054] text-xs font-medium py-4 uppercase">
              Date joined
            </TableHead>
            <TableHead className="text-[##344054] text-xs font-medium py-4 uppercase">
              Status
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {members.map((member) => (
            <TableRow key={member.id} className="border-b border-[#eaeaea]">
              <TableCell className="py-4.5! px-6!">
                <div>
                  <p className="font-medium text-sm text-[#101928]">
                    {member.name}
                  </p>
                  <p className="text-[#475367] text-xs">{member.role}</p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <span>{countryFlags[member.country] || "🏳️"}</span>
                  <span className="text-[#101928] text-sm font-medium">
                    {member.country}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-[#101928] text-sm font-medium">
                {member.workerType}
              </TableCell>
              <TableCell className="py-4 text-[#101928] text-sm font-medium">
                {member.salary}
              </TableCell>
              <TableCell className="py-4 text-[#101928] text-sm font-medium">
                {member.dateJoined}
              </TableCell>
              <TableCell className="py-4">
                <span className="border border-[#CAEFDC] bg-[#ECFDF3] px-2 py-1 text-xs text-[#12b76a] rounded-4xl">
                  {member.status}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-[#344054]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
