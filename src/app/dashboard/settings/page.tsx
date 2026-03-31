'use client';

import { useContext, useEffect, useState } from 'react';
import { PageTitleContext } from '../layout';
import { SettingsCard } from '@/components/settings/settings-card';
import { Button } from '@/components/ui/button';
import { ChangePasswordModal } from '@/components/settings/change-password-modal';
import { ModifyPinModal } from '@/components/settings/modify-pin-modal';
import { changePassword } from '@/lib/auth-service';
import { setWalletPin } from '@/lib/wallet-service';
import { useWalletStore } from '@/store/wallet-store';

const settingsData = [
  {
    id: 'company_name',
    label: 'Company Name',
    value: 'Helicode',
    isEditable: true,
  },
  {
    id: 'payroll_settings',
    label: 'Payroll Settings',
    value: 'Monthly',
    isEditable: true,
  },
  {
    id: 'admin_name',
    label: 'Admin Name',
    value: 'Aaron Goh',
    isEditable: true,
  },
  {
    id: 'title',
    label: 'Title',
    value: 'COO',
    isEditable: false,
  },
  {
    id: 'status',
    label: 'Status',
    value: 'Active',
    isStatus: true,
    isEditable: false,
  },
  {
    id: 'currency',
    label: 'Currency',
    value: 'USD',
    isEditable: false,
  },
];

export default function SettingsPage() {
  const { setTitle } = useContext(PageTitleContext);
  const [changePasswordOpen, setChangePasswordOpen] = useState<boolean>(false);
  const [createPinOpen, setCreatePinOpen] = useState<boolean>(false);
  const hasPin = useWalletStore((state) => state.hasPin);

  useEffect(() => {
    setTitle('Settings');
  }, [setTitle]);

  const handleEdit = (settingId: string) => {
    console.log(`Edit ${settingId}`);
  };

  return (
    <div className="py-4 px-8 space-y-6 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-228 mx-20 py-14">
        {settingsData.map((setting) => (
          <SettingsCard
            key={setting.id}
            label={setting.label}
            value={setting.value}
            isEditable={setting.isEditable}
            isStatus={setting.isStatus}
            onEdit={() => handleEdit(setting.id)}
          />
        ))}
        <SettingsCard label="Security">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#475367]">Password</p>
              <Button
                onClick={() => setChangePasswordOpen(!changePasswordOpen)}
                className="bg-[#E9E9E9] text-[#363636] hover:bg-[#d1d5db] text-sm w-18.25 h-9"
              >
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-[#475367]">Pin</p>
              <Button
                onClick={() => setCreatePinOpen(!createPinOpen)}
                className="bg-[#E9E9E9] text-[#363636] text-sm hover:bg-[#d1d5db] w-16.25 h-9"
              >
                {hasPin ? 'Change' : 'Set up'}
              </Button>
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onSubmitPassword={changePassword}
      />
      <ModifyPinModal
        open={createPinOpen}
        onOpenChange={setCreatePinOpen}
        hasPin={hasPin}
        onSubmitPin={setWalletPin}
      />
    </div>
  );
}
