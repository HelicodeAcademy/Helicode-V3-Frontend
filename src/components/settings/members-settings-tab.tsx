"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { InviteMemberModal } from "@/components/settings/invite-member-modal";
import {
  CompanyAdmin,
  listCompanyAdmins,
  removeCompanyAdmin,
  resendCompanyAdminInvite,
} from "@/lib/company-admins-service";
import { CompanyDetailsResponse } from "@/lib/company-details";
import { Loader2, MoreVertical, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { UserRoundCheckIcon } from "@/components/icons/user-round-check-icon";

interface MembersSettingsTabProps {
  companyDetails: CompanyDetailsResponse | null;
}

type MemberRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  permission: string;
  isEmployer: boolean;
};

function statusLabel(status: string) {
  if (status === "ACTIVE" || status === "Active") return "Active";
  if (status === "PENDING" || status === "Pending") return "Pending";
  if (status === "DISABLED") return "Disabled";
  return status;
}

function permissionLabel(admin: CompanyAdmin): string {
  const writeActions =
    admin.permissions?.filter((p) => p.access === "WRITE") ?? [];
  if (writeActions.length >= 3) return "Admin";
  if (writeActions.length > 0) return "Admin";
  return "Admin";
}

export function MembersSettingsTab({
  companyDetails,
}: MembersSettingsTabProps) {
  const [admins, setAdmins] = useState<CompanyAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<CompanyAdmin | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listCompanyAdmins({ page: 1, limit: 50 });
      setAdmins(result.data ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load members",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  const rows: MemberRow[] = useMemo(() => {
    const employerRow: MemberRow | null = companyDetails
      ? {
          id: companyDetails.employer.id,
          name: `${companyDetails.employer.firstName} ${companyDetails.employer.lastName}`.trim(),
          email: companyDetails.employer.email,
          role: companyDetails.employer.role || "Owner",
          status: "Active",
          permission: "Super admin",
          isEmployer: true,
        }
      : null;

    const adminRows: MemberRow[] = admins.map((admin) => ({
      id: admin.id,
      name: `${admin.firstName} ${admin.lastName}`.trim() || admin.email,
      email: admin.email,
      role: "Admin",
      status: statusLabel(admin.status),
      permission: permissionLabel(admin),
      isEmployer: false,
    }));

    // Avoid duplicating employer if they somehow appear in admins list
    const filtered = adminRows.filter(
      (row) =>
        !employerRow ||
        row.email.toLowerCase() !== employerRow.email.toLowerCase(),
    );

    return employerRow ? [employerRow, ...filtered] : filtered;
  }, [admins, companyDetails]);

  const handleResend = async (admin: CompanyAdmin) => {
    setResendingId(admin.id);
    try {
      await resendCompanyAdminInvite(admin.id);
      toast.success("Invite resent");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend invite",
      );
    } finally {
      setResendingId(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setIsRemoving(true);
    try {
      await removeCompanyAdmin(removeTarget.id);
      toast.success("Member removed");
      setRemoveTarget(null);
      await fetchAdmins();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "—";

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h3 className="text-xs font-medium uppercase tracking-wide text-[#737373] mt-10">
        Members
      </h3>

      <div className="rounded-md border border-[#EAEAEA] bg-white overflow-hidden">
        <div className="p-4 sm:p-5">
          <Button
            type="button"
            onClick={() => setInviteOpen(true)}
            // className="bg-[#363636] hover:bg-[#101828]/90 text-white gap-2 rounded-lg h-10"
          >
            <Plus className="h-4 w-4" />
            Invite members
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB] border-b border-[#E4E7EC]">
              <TableHead className="text-[#667085] text-xs font-medium px-6 py-3">
                Member
              </TableHead>
              <TableHead className="text-[#667085] text-xs font-medium py-3">
                Role
              </TableHead>
              <TableHead className="text-[#667085] text-xs font-medium py-3">
                Status
              </TableHead>
              <TableHead className="text-[#667085] text-xs font-medium py-3">
                Permission
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j} className="px-6 py-4">
                      <div className="h-4 w-3/4 bg-[#F2F4F7] rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-[#667085]"
                >
                  No members yet. Invite someone to get started.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const admin = admins.find((a) => a.id === row.id);
                return (
                  <TableRow
                    key={row.id}
                    className="border-b border-[#E4E7EC] last:border-b-0"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#FFED94] text-[#8F3E19] text-sm font-bold">
                            {getInitials(row.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-[#101828]">
                            {row.name}
                          </p>
                          <p className="text-xs text-[#667085]">{row.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm font-semibold text-[#101828]">
                        {row.role}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.status === "Active"
                            ? "bg-[#ECFDF3] text-[#027A48]"
                            : row.status === "Pending"
                              ? "bg-[#FFF6ED] text-[#C4320A]"
                              : "bg-[#F2F4F7] text-[#475467]"
                        }`}
                      >
                        <UserRoundCheckIcon
                          className="h-3.5 w-3.5"
                          color={
                            row.status === "Active"
                              ? "#12B76A"
                              : row.status === "Pending"
                                ? "#F79009"
                                : "#667085"
                          }
                        />
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm font-semibold text-[#101828]">
                        {row.permission}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-4">
                      {!row.isEmployer && admin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#667085]"
                            >
                              {resendingId === admin.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {admin.status !== "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() => handleResend(admin)}
                              >
                                Resend invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-[#B42318]"
                              onClick={() => setRemoveTarget(admin)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={fetchAdmins}
      />

      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `This will remove ${removeTarget.firstName} ${removeTarget.lastName} (${removeTarget.email}) from your company admins.`
                : "This will remove the member from your company admins."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-[#B42318] hover:bg-[#912018]"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
