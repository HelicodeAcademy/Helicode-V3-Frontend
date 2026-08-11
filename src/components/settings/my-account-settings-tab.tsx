"use client";

import { CompanyDetailsResponse } from "@/lib/company-details";

interface MyAccountSettingsTabProps {
  companyDetails: CompanyDetailsResponse | null;
}

export function MyAccountSettingsTab({
  companyDetails,
}: MyAccountSettingsTabProps) {
  const adminName = companyDetails
    ? `${companyDetails.employer.firstName} ${companyDetails.employer.lastName}`.trim()
    : "—";
  const adminEmail = companyDetails?.employer.email ?? "—";

  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-10">
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-[#737373] mb-4">
          Name
        </h3>

        <div className="rounded-md border border-[#EAEAEA] bg-white p-6 sm:p-5">
          <h3 className="font-medium text-base text-[#101828] mb-6">Profile</h3>
          <div className="bg-[#F9F9F9] rounded-md p-4 sm:p-5 space-y-4">
            <div className="flex flex-col *:gap-4 ">
              <p className="text-sm font-medium text-[#939393]">Name</p>
              <p className="text-sm font-semibold text-[#101828]">
                {adminName || "—"}
              </p>
            </div>
            <div className="flex flex-col ">
              <p className="text-sm font-medium text-[#939393]">Email</p>
              <p className="text-sm font-semibold text-[#101828] break-all">
                {adminEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
