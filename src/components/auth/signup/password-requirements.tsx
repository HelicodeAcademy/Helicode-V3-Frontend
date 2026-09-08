"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const SIGNUP_PASSWORD_MIN_LENGTH = 10;

export function getSignupPasswordChecks(password: string) {
  return [
    {
      id: "length",
      label: `At least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`,
      met: password.length >= SIGNUP_PASSWORD_MIN_LENGTH,
    },
  ] as const;
}

export function isSignupPasswordValid(password: string) {
  return getSignupPasswordChecks(password).every((check) => check.met);
}

export function PasswordRequirements({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  const checks = getSignupPasswordChecks(password ?? "");

  return (
    <ul className={cn("mt-2 space-y-1.5", className)} aria-live="polite">
      {checks.map((check) => (
        <li
          key={check.id}
          className={cn(
            "flex items-center gap-2 text-xs",
            check.met ? "text-[#027A48]" : "text-[#667085]",
          )}
        >
          {check.met ? (
            <Check className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <Circle className="size-3.5 shrink-0" aria-hidden />
          )}
          <span>{check.label}</span>
        </li>
      ))}
    </ul>
  );
}
