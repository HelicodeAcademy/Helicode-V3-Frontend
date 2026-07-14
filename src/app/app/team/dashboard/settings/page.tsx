"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { TeamPageTitleContext } from "../layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChangePasswordModal } from "@/components/settings/change-password-modal";
import { ModifyPinModal } from "@/components/settings/modify-pin-modal";
import { useTeamKYCStore } from "@/store/team/team-kyc-store";
import { changeTeamPassword, getTeamMe } from "@/lib/team/team-auth-service";
import { setWalletPin as setTeamWalletPin } from "@/lib/team/team-transaction-service";
import toast from "react-hot-toast";
import { KYCIcon } from "@/components/icons/icons";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { BankDetailsModal } from "@/components/settings/bank-details-modal";
import { Edit2 } from "lucide-react";
import { TeamKYCModal } from "@/components/team-dashboard/kyc/team-kyc-modal";

export default function TeamSettingsPage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [modifyPinOpen, setModifyPinOpen] = useState(false);
  const [viewBankDetailsOpen, setViewBankDetailsOpen] = useState(false);
  const [updateKycModalOpen, setUpdateKycModalOpen] = useState(false);
  const [updateBankModalOpen, setUpdateBankModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { teamMember, setTeamMember } = useTeamKYCStore();
  const { hasPin: teamHasPin } = useTeamAuthStore();

  useEffect(() => {
    setTitle("Settings");
    fetchTeamMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTitle]);

  const fetchTeamMember = async () => {
    try {
      setIsLoading(true);
      const data = await getTeamMe();
      setTeamMember(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch team data";
      toast.error(errorMessage);
      console.error("Team settings fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fullName = useMemo(() => {
    if (!teamMember) return "Team member";
    return `${teamMember.firstName} ${teamMember.lastName}`.trim();
  }, [teamMember]);

  const initials = useMemo(() => {
    const firstInitial = teamMember?.firstName?.charAt(0) ?? "";
    const lastInitial = teamMember?.lastName?.charAt(0) ?? "";
    return `${firstInitial}${lastInitial}` || "TM";
  }, [teamMember]);

  const isVerified = Boolean(teamMember?.kycStatus);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 border-4 border-[#0084FD] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6 sm:py-10">
        <div className="rounded-lg border border-[#eaeaea] bg-white p-6">
          <h2 className="mb-6 text-[20px] font-medium text-[#000000]">
            Profile
          </h2>

          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 rounded-full">
              <AvatarFallback className="bg-[#EFF4FF] text-base font-semibold text-[#0052FF]">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center space-x-4">
              <p className="text-base font-medium text-[#344054]">
                {teamMember && fullName}
              </p>
              <Badge
                className={
                  isVerified
                    ? "border-[#CAEFDC] bg-[#ECFDF3] text-[#12B76A]"
                    : "border-[#E5D7CB] bg-[#FFEFE2] text-[#EE7D1F]"
                }
                variant="outline"
              >
                {isVerified ? (
                  <div className="flex items-center space-x-1">
                    <KYCIcon />
                    <span>KYC completed</span>
                  </div>
                ) : (
                  "Not verified"
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#eaeaea] bg-white p-6">
          <h2 className="mb-6 text-[20px] font-medium text-[#000000]">
            Account
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#475367]">
                Bank payouts
              </p>
              <Button
                onClick={() => setViewBankDetailsOpen(true)}
                className="h-9 min-w-18 bg-[#E9E9E9] text-sm text-[#363636] hover:bg-[#d1d5db]"
              >
                View
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#475367]">Pin</p>
              <Button
                onClick={() => setModifyPinOpen(true)}
                className="h-9 min-w-16 bg-[#E9E9E9] text-sm text-[#363636] hover:bg-[#d1d5db]"
              >
                {teamHasPin ? "Change" : "Set up"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#475367]">Password</p>
              <Button
                onClick={() => setChangePasswordOpen(true)}
                className="h-9 min-w-18 bg-[#E9E9E9] text-sm text-[#363636] hover:bg-[#d1d5db]"
              >
                Change
              </Button>
            </div>

            {/* KYC */}
            <div className="bg-white border border-[#eaeaea] rounded-lg p-6">
              <div className="flex items-start flex-wrap space-y-4 justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#101828] mb-2">
                    KYC Information
                  </h2>
                  <p className="text-sm text-[#667085] mb-4">
                    Update your Know Your Customer information
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#667085]">Status:</span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          teamMember?.kycStatus
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : "bg-[#FEF3C7] text-[#92400E]"
                        }`}
                      >
                        {teamMember?.kycStatus ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setUpdateKycModalOpen(true)}
                  className="bg-[#0084FD] text-white hover:bg-[#0084FD]/90"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Update KYC
                </Button>
              </div>
            </div>

            {/* Bank details */}
            <div className="bg-white border border-[#eaeaea] rounded-lg p-6">
              <div className="flex items-start flex-wrap space-y-4 justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#101828] mb-2">
                    Bank Details
                  </h2>
                  <p className="text-sm text-[#667085] mb-4">
                    Update your bank account and payout information
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#667085]">Status:</span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          teamMember?.bankPayoutStatus
                            ? "bg-[#ECFDF5] text-[#065F46]"
                            : "bg-[#FEF3C7] text-[#92400E]"
                        }`}
                      >
                        {teamMember?.bankPayoutStatus
                          ? "Configured"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setUpdateBankModalOpen(true)}
                  disabled={!teamMember?.kycStatus}
                  className="bg-[#0084FD] text-white hover:bg-[#0084FD]/90 disabled:opacity-50"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Update Bank Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BankDetailsModal
        open={viewBankDetailsOpen}
        onOpenChange={setViewBankDetailsOpen}
      />

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onSubmitPassword={changeTeamPassword}
      />
      <ModifyPinModal
        open={modifyPinOpen}
        onOpenChange={setModifyPinOpen}
        hasPin={teamHasPin}
        onSubmitPin={setTeamWalletPin}
      />

      {/* Update KYC Modal */}
      <TeamKYCModal
        open={updateKycModalOpen}
        onOpenChange={setUpdateKycModalOpen}
        onSuccess={() => {
          fetchTeamMember();
          toast.success("KYC updated successfully!");
        }}
      />

      {/* Update Bank Details Modal */}
      <TeamBankDetailsUpdateModal
        open={updateBankModalOpen}
        onOpenChange={setUpdateBankModalOpen}
        onSuccess={() => {
          fetchTeamMember();
          toast.success("Bank details updated successfully!");
        }}
      />
    </div>
  );
}

function TeamBankDetailsUpdateModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  return (
    <TeamBankDetailsModalWithoutVerification
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
}

// Reuse the existing modal but skip verification
// import { TeamBankDetailsForm } from '@/components/team/team-bank-details-form'
import { TeamBankDetailsForm } from "@/components/team-dashboard/kyc/team-bank-details-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function TeamBankDetailsModalWithoutVerification({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#101828]">
            Update Bank Details
          </DialogTitle>
          <DialogDescription className="text-[#667085] mt-2">
            Update your bank account details for payout processing.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <TeamBankDetailsForm
            onSuccess={() => {
              onSuccess?.();
              onOpenChange(false);
            }}
          />
        </div>

        <p className="text-xs text-[#667085] mt-4 text-center">
          Your bank details are encrypted and stored securely.
        </p>
      </DialogContent>
    </Dialog>
  );
}
