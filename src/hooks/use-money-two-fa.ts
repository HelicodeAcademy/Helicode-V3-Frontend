"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resolveTwoFaSubmitError } from "@/lib/two-fa-service";
import { useTwoFaStore } from "@/store/two-fa-store";

export function useMoneyTwoFa(forTeam = false) {
  const router = useRouter();
  const codeRequired = useTwoFaStore((state) =>
    Boolean(state.status?.codeRequired),
  );
  const [requiredByError, setRequiredByError] = useState(false);
  const requireAuthenticator = codeRequired || requiredByError;

  useEffect(() => {
    if (codeRequired) setRequiredByError(true);
  }, [codeRequired]);

  const handleSubmitError = async (
    error: unknown,
    resendEmail: () => Promise<void>,
  ) => {
    const result = await resolveTwoFaSubmitError(error, resendEmail);
    if (result.requireCode) setRequiredByError(true);
    if (result.enrollmentRequired) {
      toast.error(result.message);
      router.push(
        forTeam
          ? "/team/dashboard/settings#two-fa"
          : "/dashboard/settings?tab=security",
      );
    }
    return result.message;
  };

  return { requireAuthenticator, handleSubmitError };
}
