"use client";

import { useContext, useEffect, useEffectEvent, useState } from "react";
import { PageTitleContext } from "../layout";
import { SettingsCard } from "@/components/settings/settings-card";
import { Button } from "@/components/ui/button";
import { ChangePasswordModal } from "@/components/settings/change-password-modal";
import { ModifyPinModal } from "@/components/settings/modify-pin-modal";
import { changePassword } from "@/lib/auth-service";
import { setWalletPin } from "@/lib/wallet-service";
import { useWalletStore } from "@/store/wallet-store";
import {
  CompanyDetailsResponse,
  getCompanyDetails,
} from "@/lib/company-details";
import toast from "react-hot-toast";
import {
  formatKycStatusLabel,
  isKycFullyApproved,
  useKYCStore,
} from "@/store/kyc-store";
import { getKYCStatus } from "@/lib/kyc-service";

interface SettingsItem {
  id: string;
  label: string;
  value: string;
  isEditable?: boolean;
  isStatus?: boolean;
}

export default function SettingsPage() {
  const { setTitle } = useContext(PageTitleContext);
  const [changePasswordOpen, setChangePasswordOpen] = useState<boolean>(false);
  const [createPinOpen, setCreatePinOpen] = useState<boolean>(false);
  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetailsResponse | null>(null);
  const hasPin = useWalletStore((state) => state.hasPin);
  const { kycStatus, setKYCStatus } = useKYCStore();

  const fetchCompanyDetails = useEffectEvent(async () => {
    try {
      const data = await getCompanyDetails();
      setCompanyDetails(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch company details";
      toast.error(errorMessage);
      console.error("Failed to fetch company details", error);
    }
  });

  const fetchKyc = useEffectEvent(async () => {
    try {
      const status = await getKYCStatus();
      setKYCStatus(status);
    } catch (error) {
      console.error("Failed to fetch KYC status", error);
    }
  });

  useEffect(() => {
    setTitle("Settings");
    fetchCompanyDetails();
    fetchKyc();
  }, [setTitle]);

  const companyKyc = companyDetails?.kyc;
  const fullyApproved =
    isKycFullyApproved(kycStatus) ||
    (companyKyc?.bridgeKycStatus === "approved" &&
      companyKyc?.bridgeTosStatus === "approved");

  const statusValue = fullyApproved
    ? "Verified"
    : formatKycStatusLabel(
        kycStatus?.kycStatus ?? companyKyc?.bridgeKycStatus,
      );

  const settingsData: SettingsItem[] = [
    {
      id: "company_name",
      label: "Company Name",
      value: companyDetails?.name ?? "N/A",
      isEditable: false,
    },
    {
      id: "payroll_settings",
      label: "Payroll Settings",
      value: "Monthly",
      isEditable: false,
    },
    {
      id: "admin_name",
      label: "Admin Name",
      value: companyDetails
        ? `${companyDetails.employer.firstName} ${companyDetails.employer.lastName}`.trim()
        : "N/A",
      isEditable: false,
    },
    {
      id: "title",
      label: "Title",
      value: companyDetails?.employer.role ?? "N/A",
      isEditable: false,
    },
    {
      id: "status",
      label: "Status",
      value: statusValue,
      isStatus: true,
      isEditable: false,
    },
    {
      id: "currency",
      label: "Currency",
      value: companyDetails?.invoiceCurrency ?? "N/A",
      isEditable: false,
    },
  ];

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
                {hasPin ? "Change" : "Set up"}
              </Button>
            </div>
          </div>
        </SettingsCard>
      </div>

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
