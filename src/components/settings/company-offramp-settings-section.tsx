"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CompanyDetailsResponse } from "@/lib/company-details";
import {
  getCompanyBankPayoutStatus,
  getCompanyOfframpKycStatus,
  isCompanyFiatOfframpEnabled,
} from "@/lib/company-offramp-service";
import { hasCompanyAdminPermission } from "@/lib/permissions";
import { CompanyOfframpBankModal } from "./company-offramp-bank-modal";
import { CompanyOfframpKycModal } from "./company-offramp-kyc-modal";
import { CompanyOfframpViewBankModal } from "./company-offramp-view-bank-modal";

interface CompanyOfframpSettingsSectionProps {
  companyDetails: CompanyDetailsResponse | null;
  onRefresh?: () => void;
}

export function CompanyOfframpSettingsSection({
  companyDetails,
  onRefresh,
}: CompanyOfframpSettingsSectionProps) {
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [viewBankModalOpen, setViewBankModalOpen] = useState(false);

  if (!isCompanyFiatOfframpEnabled(companyDetails)) {
    return null;
  }

  const offrampKycComplete = getCompanyOfframpKycStatus(companyDetails);
  const bankPayoutComplete = getCompanyBankPayoutStatus(companyDetails);
  const canWrite = hasCompanyAdminPermission("COMPANY_WITHDRAWAL", "WRITE");
  const canRead = hasCompanyAdminPermission("COMPANY_WITHDRAWAL", "READ");

  if (!canRead) {
    return null;
  }

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-[#737373]">
          Local payouts
        </h3>

        <div className="rounded-md border border-[#EAEAEA] bg-white p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-[#101828]">
                Payout KYC
              </p>
              <p className="text-sm text-[#667085] mt-1">
                Identity details required for local bank withdrawals.
              </p>
              <span
                className={`inline-flex mt-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                  offrampKycComplete
                    ? "bg-[#ECFDF3] text-[#027A48]"
                    : "bg-[#FFF3E8] text-[#FF7700]"
                }`}
              >
                {offrampKycComplete ? "Completed" : "Not completed"}
              </span>
            </div>
            {canWrite && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setKycModalOpen(true)}
                className="rounded-full h-9 px-4 border-[#D0D5DD] text-[#344054] shrink-0"
              >
                {offrampKycComplete ? "Update KYC" : "Complete KYC"}
              </Button>
            )}
          </div>

          <hr className="border-[#F2F2F2]" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-[#101828]">
                Bank details
              </p>
              <p className="text-sm text-[#667085] mt-1">
                Bank or mobile money account for local withdrawals.
              </p>
              <span
                className={`inline-flex mt-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                  bankPayoutComplete
                    ? "bg-[#ECFDF3] text-[#027A48]"
                    : "bg-[#FFF3E8] text-[#FF7700]"
                }`}
              >
                {bankPayoutComplete ? "Configured" : "Not configured"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {bankPayoutComplete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewBankModalOpen(true)}
                  className="rounded-full h-9 px-4 border-[#D0D5DD] text-[#344054]"
                >
                  View details
                </Button>
              )}
              {canWrite && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBankModalOpen(true)}
                  disabled={!offrampKycComplete}
                  title={
                    offrampKycComplete
                      ? undefined
                      : "Complete payout KYC before adding bank details"
                  }
                  className="rounded-full h-9 px-4 border-[#D0D5DD] text-[#344054] disabled:opacity-50"
                >
                  {bankPayoutComplete ? "Update bank" : "Add bank details"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <CompanyOfframpKycModal
        open={kycModalOpen}
        onOpenChange={setKycModalOpen}
        onSuccess={handleSuccess}
      />

      <CompanyOfframpBankModal
        open={bankModalOpen}
        onOpenChange={setBankModalOpen}
        onSuccess={handleSuccess}
      />

      <CompanyOfframpViewBankModal
        open={viewBankModalOpen}
        onOpenChange={setViewBankModalOpen}
      />
    </>
  );
}
