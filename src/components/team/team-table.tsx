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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { TeamMember } from "@/store/team-store";
import { revokeTeamMember } from "@/lib/team-service";
import { toast } from "react-hot-toast";
import { getFlagEmoji } from "@/lib/countries";
import { EditTeamMemberModal } from "./edit-team-member-modal";
import { PayTeamMemberModal } from "./pay-team-member-modal";

// Country flags mapping
// const countryFlags: Record<string, string> = {
//   Kenya: "🇰🇪",
//   Singapore: "🇸🇬",
//   Rwanda: "🇷🇼",
//   "United States": "🇺🇸",
//   Namibia: "🇳🇦",
//   Ghana: "🇬🇭",
//   "United Kingdom": "🇬🇧",
//   Nigeria: "🇳🇬",
//   "South Africa": "🇿🇦",
// };

interface TeamTableProps {
  members: TeamMember[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRevoked: () => void;
  isLoading?: boolean;
}

function SkeletonRow() {
  return (
    <TableRow className="border-b border-[#eaeaea]">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i} className="py-4.5! px-6!">
          <div className="h-4 bg-[#f0f0f0] rounded animate-pulse w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function TeamTable({
  members,
  currentPage,
  totalPages,
  onPageChange,
  onRevoked,
  isLoading,
}: TeamTableProps) {
  const [revokeTarget, setRevokeTarget] = useState<TeamMember | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [payTarget, setPayTarget] = useState<TeamMember | null>(null);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      await revokeTeamMember(revokeTarget.id);
      toast.success(`${revokeTarget.fullName} has been removed from the team.`);
      onRevoked();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove team member.",
      );
    } finally {
      setIsRevoking(false);
      setRevokeTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#eaeaea] rounded-3xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
              <TableHead className="text-[#344054] text-xs font-medium py-4 px-6 uppercase">
                Name
              </TableHead>
              <TableHead className="text-[#344054] text-xs font-medium py-4 uppercase">
                Country
              </TableHead>
              <TableHead className="text-[#344054] text-xs font-medium py-4 uppercase">
                Worker type
              </TableHead>
              <TableHead className="text-[#344054] text-xs font-medium py-4 uppercase">
                Salary
              </TableHead>
              <TableHead className="text-[#344054] text-xs font-medium py-4 uppercase">
                Date joined
              </TableHead>
              <TableHead className="text-[#344054] text-xs font-medium py-4 uppercase">
                Status
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-16 text-center text-[#667085] text-sm"
                >
                  No team members found.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-b border-[#eaeaea] last:border-0"
                >
                  <TableCell className="py-4.5! px-6!">
                    <div>
                      <p className="font-medium text-sm text-[#101928]">
                        {member.fullName}
                      </p>
                      <p className="text-[#475367] text-xs capitalize">
                        {/* {member.type.charAt(0) +
                          member.type.slice(1).toLowerCase()} */}
                        {member.role}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span>{getFlagEmoji(member.country)}</span>
                      {/* <span>{countryFlags[member.country] ?? "🏳️"}</span> */}
                      <span className="text-[#101928] text-sm font-medium">
                        {member.country}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-[#101928] text-sm font-medium capitalize">
                    {member.type.charAt(0) + member.type.slice(1).toLowerCase()}
                  </TableCell>
                  <TableCell className="py-4 text-[#101928] text-sm font-medium">
                    ${member.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 text-[#101928] text-sm font-medium">
                    {new Date(member.dateJoined).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`border px-2 py-1 text-xs rounded-4xl ${member.status === "Active" ? "border-[#CAEFDC] bg-[#ECFDF3] text-[#12b76a]" : member.status === "Pending" ? "bg-[#FFEFE2] text-[#EE7D1F] border border-[#E5D7CB]" : "border-[#F0D0D0] bg-[#FDECEC] text-[#D32828]"}`}
                    >
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
                        <DropdownMenuItem onClick={() => setEditTarget(member)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPayTarget(member)}
                          disabled={member.status !== "Active"}
                          className="disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Pay
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setRevokeTarget(member)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-[#344054] font-medium">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-[#d1d5db]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-[#d1d5db]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      <EditTeamMemberModal
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        member={editTarget}
        onSuccess={onRevoked}
      />

      {/* Pay Team Member Modal */}
      <PayTeamMemberModal
        open={!!payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        member={payTarget}
      />

      {/* Revoke Confirmation Dialog */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[#101928]">
                {revokeTarget?.fullName}
              </span>{" "}
              from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRevoking ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
