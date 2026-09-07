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
import { cn } from "@/lib/utils";
import { CompanyOfframpBankModal } from "./company-offramp-bank-modal";
import { CompanyOfframpKycModal } from "./company-offramp-kyc-modal";
import { CompanyOfframpViewBankModal } from "./company-offramp-view-bank-modal";

interface CompanyOfframpSettingsSectionProps {
  companyDetails: CompanyDetailsResponse | null;
  onRefresh?: () => void;
}

function StatusBadge({ ready }: { ready: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
        ready ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FBEEDA] text-[#9A5B00]",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          ready ? "bg-[#12B76A]" : "bg-[#9A5B00]",
        )}
      />
      {ready ? "Ready" : "Not set up"}
    </span>
  );
}

function CompletedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E4F4EC] px-2 py-0.5 text-xs font-medium text-[#0B7A55]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0B7A55]" />
      Completed
    </span>
  );
}

function StepNumber({ number, active }: { number: number; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[11px]",
        active
          ? "bg-[#0052FF] text-white"
          : "bg-none text-[#667085] border border-[#E2E7F0]",
      )}
    >
      {number}
    </span>
  );
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

  const completedSteps =
    Number(offrampKycComplete) + Number(bankPayoutComplete);
  const isReady = completedSteps === 2;
  const progressPercent = (completedSteps / 2) * 100;

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-[#98A2B3]">
          Withdrawals
        </h3>

        <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-lg font-bold text-[#0C1424]">
              Withdraw to a local bank account
            </h4>
            <StatusBadge ready={isReady} />
          </div>

          <p className="mt-2 text-sm leading-relaxed text-[#66748C]">
            Convert your USD balance to naira, cedis, shillings and 22 other
            African currencies, paid into your company bank or mobile money
            account.
          </p>

          <div className="mt-5 flex items-center gap-3 w-1/2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F2F4F7]">
              <div
                className="h-full rounded-full bg-[#0052FF] transition-all duration-300"
                style={{
                  width: `${Math.max(progressPercent, completedSteps === 0 ? 2 : progressPercent)}%`,
                }}
              />
            </div>
            <p className="shrink-0 text-sm text-[#667085]">
              {completedSteps} of 2 done
            </p>
          </div>

          <hr className="my-5 border-[#EDF1F7]" />

          <div className="mt-6 space-y-5">
            {/* Step 1 — Verify identity */}
            <div className="flex items-start gap-4">
              <StepNumber number={1} active={!offrampKycComplete} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-base font-bold text-[#0C1424]">
                      Verify your identity
                    </p>
                    <p className="text-sm leading-relaxed text-[#66748C]">
                      The account holder needs to verify their identity with a
                      government issued ID. It only takes about 1 minute.
                    </p>
                    {offrampKycComplete && <CompletedBadge />}
                  </div>

                  {canWrite && (
                    <Button
                      type="button"
                      onClick={() => setKycModalOpen(true)}
                      variant={offrampKycComplete ? "outline" : "default"}
                      className={cn(
                        "h-9 shrink-0 px-4 text-sm font-medium",
                        offrampKycComplete
                          ? "rounded-full border border-[#E2E7F0] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                          : "rounded-full bg-[#0052FF] text-white hover:bg-[#0041CC]",
                      )}
                    >
                      {offrampKycComplete
                        ? "Update verification"
                        : "Start verification"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-5 border-[#EDF1F7]" />

            {/* Step 2 — Add payout account */}
            <div className="flex items-start gap-3">
              <StepNumber
                number={2}
                active={offrampKycComplete && !bankPayoutComplete}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div
                    className={cn(
                      "min-w-0 space-y-1.5",
                      !offrampKycComplete && "opacity-50",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        offrampKycComplete
                          ? "text-[#101828]"
                          : "text-[#98A2B3]",
                      )}
                    >
                      Add a payout account
                    </p>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        offrampKycComplete
                          ? "text-[#667085]"
                          : "text-[#98A2B3]",
                      )}
                    >
                      Where the money lands, a company bank account or mobile
                      money wallet.
                    </p>
                    {bankPayoutComplete && <CompletedBadge />}
                  </div>

                  {canWrite && (
                    <Button
                      type="button"
                      onClick={() => {
                        if (bankPayoutComplete) {
                          setViewBankModalOpen(true);
                          return;
                        }
                        if (!offrampKycComplete) return;
                        setBankModalOpen(true);
                      }}
                      disabled={!offrampKycComplete && !bankPayoutComplete}
                      variant={
                        bankPayoutComplete || !offrampKycComplete
                          ? "outline"
                          : "default"
                      }
                      className={cn(
                        "h-9 shrink-0 px-4 text-sm font-medium",
                        bankPayoutComplete
                          ? "rounded-full border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                          : offrampKycComplete
                            ? "rounded-full bg-[#0052FF] text-white hover:bg-[#0041CC]"
                            : "rounded-full border border-[#D0D5DD] bg-transparent text-[#98A2B3] shadow-none hover:bg-transparent disabled:opacity-100",
                      )}
                    >
                      {bankPayoutComplete ? "View account" : "Add account"}
                    </Button>
                  )}

                  {!canWrite && bankPayoutComplete && (
                    <Button
                      type="button"
                      onClick={() => setViewBankModalOpen(true)}
                      variant="outline"
                      className="h-9 shrink-0 rounded-lg border-[#D0D5DD] bg-white px-4 text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
                    >
                      View account
                    </Button>
                  )}
                </div>
              </div>
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
