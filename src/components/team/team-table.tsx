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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { TeamMember } from "@/store/team-store";
import { revokeTeamMember, resendTeamMemberInvite } from "@/lib/team-service";
import { toast } from "react-hot-toast";
import { getFlagEmoji } from "@/lib/countries";
import { EditTeamMemberModal } from "./edit-team-member-modal";
import { PayTeamMemberModal } from "./pay-team-member-modal";

export type TeamSortKey =
  | "name"
  | "type"
  | "country"
  | "pay"
  | "start"
  | "status";

interface TeamTableProps {
  members: TeamMember[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRevoked: () => void;
  isLoading?: boolean;
  sortKey?: TeamSortKey | null;
  sortDir?: "asc" | "desc";
  onSort?: (key: TeamSortKey) => void;
}

const AVATAR_COLORS = [
  "bg-[#FCE7F3] text-[#9D174D]",
  "bg-[#FFEDD5] text-[#9A3412]",
  "bg-[#E0E7FF] text-[#3730A3]",
  "bg-[#EDE9FE] text-[#6D28D9]",
  "bg-[#DBEAFE] text-[#1D4ED8]",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase();
}

function SkeletonRow() {
  return (
    <TableRow className="border-b border-[#EAECF0]">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i} className="py-4 px-4">
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#F2F4F7]" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function TeamTable({
  members,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onRevoked,
  isLoading,
  onSort,
}: TeamTableProps) {
  const [revokeTarget, setRevokeTarget] = useState<TeamMember | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [payTarget, setPayTarget] = useState<TeamMember | null>(null);
  const [resendTargetId, setResendTargetId] = useState<string | null>(null);

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

  const handleResendInvite = async (member: TeamMember) => {
    setResendTargetId(member.id);

    try {
      const message = await resendTeamMemberInvite(member.id);
      toast.success(message || `Invite resent successfully.`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invite.",
      );
    } finally {
      setResendTargetId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#EAECF0] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#EAECF0] hover:bg-transparent">
              {(
                [
                  ["name", "Name"],
                  ["type", "Type"],
                  ["country", "Country"],
                  ["pay", "Pay / month"],
                  ["start", "Start date"],
                  ["status", "Status"],
                ] as const
              ).map(([key, label]) => (
                <TableHead
                  key={key}
                  className="px-4 py-3 text-xs font-medium text-[#667085]"
                >
                  <button
                    type="button"
                    onClick={() => onSort?.(key)}
                    className="inline-flex items-center gap-1"
                  >
                    {label}
                    <ChevronsUpDown className="h-3.5 w-3.5 text-[#98A2B3]" />
                  </button>
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : members.length === 0
                ? null
                : members.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-b border-[#EAECF0] last:border-0"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${AVATAR_COLORS[member.fullName.length % AVATAR_COLORS.length]}`}
                          >
                            {initials(member.fullName)}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-[#101828]">
                              {member.fullName}
                            </span>
                            <span className="block text-xs text-[#667085]">
                              {member.role}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="rounded-full bg-[#EFF4FF] px-2 py-0.5 text-xs font-medium text-[#0052FF]">
                          {member.type === "EMPLOYEE"
                            ? "Employee"
                            : "Contractor"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2 text-sm text-[#101828]">
                          <span>{getFlagEmoji(member.country)}</span>
                          {member.country}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-[#101828]">
                        {member.localAmount != null && member.localCurrency
                          ? `${member.localAmount.toLocaleString()} ${member.localCurrency}`
                          : `$${Number(member.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-[#101828]">
                        {member.dateJoined
                          ? new Date(member.dateJoined).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : ""}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${member.status === "Active" || member.status === "Invite Accepted" ? "bg-[#ECFDF3] text-[#12B76A]" : member.status === "Pending" ? "bg-[#FFFAEB] text-[#F79009]" : "bg-[#FEF3F2] text-[#F04438]"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${member.status === "Active" || member.status === "Invite Accepted" ? "bg-[#12B76A]" : member.status === "Pending" ? "bg-[#F79009]" : "bg-[#F04438]"}`}
                          />
                          {member.status === "Pending"
                            ? "Invited"
                            : member.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4 text-[#344054]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditTarget(member)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendInvite(member)}
                              disabled={member.status === "Active"}
                              className="disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {resendTargetId === member.id
                                ? "Resending..."
                                : "Resend"}
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
                  ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-4 py-3 text-sm text-[#667085]">
          <p>
            {members.length === 0
              ? `Showing 0 of ${totalCount} members`
              : `Showing ${(currentPage - 1) * pageSize + 1}–${
                  (currentPage - 1) * pageSize + members.length
                } of ${totalCount} members`}
          </p>
          <div className="flex items-center gap-3">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center overflow-hidden rounded-lg border border-[#E4E7EC]">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-8 w-8 items-center justify-center disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-8 w-8 items-center justify-center border-l border-[#E4E7EC] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
