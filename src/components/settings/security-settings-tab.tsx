"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChangePasswordModal } from "@/components/settings/change-password-modal";
import { changePassword } from "@/lib/auth-service";

export function SecuritySettingsTab() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wide text-[#737373] mt-10 mb-4">
          Security
        </h3>
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#101828]">Password</p>
              <p className="text-sm text-[#667085] mt-0.5">
                Change the password you use to sign in
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setChangePasswordOpen(true)}
              className="rounded-full h-9 px-4 border-[#D0D5DD] text-[#344054] shrink-0"
            >
              Change password
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onSubmitPassword={changePassword}
      />
    </div>
  );
}
