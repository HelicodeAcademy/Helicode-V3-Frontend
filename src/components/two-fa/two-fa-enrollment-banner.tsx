"use client";

import Link from "next/link";
import { useTwoFaStore } from "@/store/two-fa-store";

export function TwoFaEnrollmentBanner({ forTeam = false }: { forTeam?: boolean }) {
  const status = useTwoFaStore((state) => state.status);

  if (!status?.available || !status.mustEnrollNow) return null;

  return (
    <div className="mx-6 mt-4 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318] sm:mx-8">
      Set up an authenticator app in Settings before you can send money.{" "}
      <Link
        href={
          forTeam
            ? "/team/dashboard/settings#two-fa"
            : "/dashboard/settings?tab=security"
        }
        className="font-medium underline"
      >
        Set up 2FA
      </Link>
    </div>
  );
}
