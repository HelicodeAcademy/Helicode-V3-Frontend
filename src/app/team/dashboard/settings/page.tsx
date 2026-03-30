'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { TeamPageTitleContext } from '../layout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChangePasswordModal } from '@/components/settings/change-password-modal';
import { ModifyPinModal } from '@/components/settings/modify-pin-modal';
import { useWalletStore } from '@/store/wallet-store';
import { useTeamKYCStore } from '@/store/team/team-kyc-store';
import { changeTeamPassword, getTeamMe } from '@/lib/team/team-auth-service';
import { setWalletPin as setTeamWalletPin } from '@/lib/team/team-transaction-service';
import toast from 'react-hot-toast';
import { KYCIcon } from '@/components/icons/icons';

export default function TeamSettingsPage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [modifyPinOpen, setModifyPinOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasPin = useWalletStore((state) => state.hasPin);
  const { teamMember, setTeamMember } = useTeamKYCStore();

  useEffect(() => {
    setTitle('Settings');
  }, [setTitle]);

  useEffect(() => {
    if (teamMember) return;

    const fetchTeamMember = async () => {
      try {
        setIsLoading(true);
        const data = await getTeamMe();
        setTeamMember(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch team data';
        toast.error(errorMessage);
        console.error('Team settings fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMember();
  }, [setTeamMember, teamMember]);

  const fullName = useMemo(() => {
    if (!teamMember) return 'Team member';
    return `${teamMember.firstName} ${teamMember.lastName}`.trim();
  }, [teamMember]);

  const initials = useMemo(() => {
    const firstInitial = teamMember?.firstName?.charAt(0) ?? '';
    const lastInitial = teamMember?.lastName?.charAt(0) ?? '';
    return `${firstInitial}${lastInitial}` || 'TM';
  }, [teamMember]);

  const isVerified = Boolean(teamMember?.kycStatus);

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
                {isLoading ? 'Loading...' : fullName}
              </p>
              <Badge
                className={
                  isVerified
                    ? 'border-[#CAEFDC] bg-[#ECFDF3] text-[#12B76A]'
                    : 'border-[#E5D7CB] bg-[#FFEFE2] text-[#EE7D1F]'
                }
                variant="outline"
              >
                {isVerified ? (
                  <div className="flex items-center space-x-1">
                    <KYCIcon />
                    <span>KYC completed</span>
                  </div>
                ) : (
                  'Not verified'
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
              <Button className="h-9 min-w-18 bg-[#E9E9E9] text-sm text-[#363636] hover:bg-[#d1d5db]">
                View
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#475367]">Pin</p>
              <Button
                onClick={() => setModifyPinOpen(true)}
                className="h-9 min-w-16 bg-[#E9E9E9] text-sm text-[#363636] hover:bg-[#d1d5db]"
              >
                {hasPin ? 'Change' : 'Set up'}
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
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onSubmitPassword={changeTeamPassword}
      />
      <ModifyPinModal
        open={modifyPinOpen}
        onOpenChange={setModifyPinOpen}
        hasPin={hasPin}
        onSubmitPin={setTeamWalletPin}
      />
    </div>
  );
}
