"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { TwoFaBackupCodes } from "@/components/settings/two-fa-backup-codes";
import { TwoFaSetupModal } from "@/components/settings/two-fa-setup-modal";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { requestTeamTransactionVerificationCode } from "@/lib/team/transaction-verification-service";
import {
  disableTwoFa,
  enableTwoFa,
  replaceTwoFaBackupCodes,
  resolveTwoFaSubmitError,
} from "@/lib/two-fa-service";
import { useTwoFaStore } from "@/store/two-fa-store";
import toast from "react-hot-toast";

type Challenge = "enable" | "disable" | "backup" | null;

export function TwoFaSettings({ forTeam = false }: { forTeam?: boolean }) {
  const { status, isLoading, fetchStatus, setStatus } = useTwoFaStore();
  const [setupOpen, setSetupOpen] = useState(false);
  const [challenge, setChallenge] = useState<Challenge>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchStatus(forTeam);
  }, [fetchStatus, forTeam]);

  useEffect(() => {
    if (!status?.available) return;
    if (window.location.hash !== "#two-fa") return;
    requestAnimationFrame(() => {
      document.getElementById("two-fa")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [status?.available]);

  if (isLoading && !status) {
    return (
      <div className="h-24 animate-pulse rounded-2xl border border-[#E4E7EC] bg-[#F2F4F7]" />
    );
  }

  if (!status?.available) return null;

  const subject =
    challenge === "disable"
      ? "DISABLE_2FA"
      : challenge === "enable"
        ? "ENABLE_2FA"
        : "BACKUP_CODES_2FA";

  const requestEmail = async () => {
    if (forTeam) {
      await requestTeamTransactionVerificationCode(subject);
    } else {
      await requestTransactionVerificationCode(subject);
    }
    toast.success("Verification code sent to your email!");
  };

  const openChallenge = async (next: Challenge) => {
    setError("");
    try {
      if (forTeam) {
        await requestTeamTransactionVerificationCode(
          next === "disable"
            ? "DISABLE_2FA"
            : next === "enable"
              ? "ENABLE_2FA"
              : "BACKUP_CODES_2FA",
        );
      } else {
        await requestTransactionVerificationCode(
          next === "disable"
            ? "DISABLE_2FA"
            : next === "enable"
              ? "ENABLE_2FA"
              : "BACKUP_CODES_2FA",
        );
      }
      setChallenge(next);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    }
  };

  const handleChallenge = async (
    verificationCode: string,
    code2fa?: string,
  ) => {
    if (!challenge || !code2fa) return;
    setIsSubmitting(true);
    setError("");
    try {
      const payload = { code2fa, verificationCode };
      if (challenge === "disable") {
        const next = await disableTwoFa(forTeam, payload);
        setStatus(next);
        toast.success("Authenticator app turned off");
        setChallenge(null);
      } else if (challenge === "enable") {
        const next = await enableTwoFa(forTeam, payload);
        setStatus(next);
        toast.success("Authenticator app turned on");
        setChallenge(null);
      } else {
        const codes = await replaceTwoFaBackupCodes(forTeam, payload);
        setBackupCodes(codes);
        await fetchStatus(forTeam);
      }
    } catch (err) {
      const result = await resolveTwoFaSubmitError(err, requestEmail);
      setError(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel = !status.enrolled
    ? "Not set up"
    : status.enabled
      ? "On"
      : "Off";

  return (
    <div
      id="two-fa"
      className="rounded-2xl border border-[#E4E7EC] bg-white p-4 sm:p-5 mb-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#101828]">
            Authenticator app
          </p>
          <p className="mt-0.5 text-sm text-[#667085]">
            Protect withdrawals, transfers and payroll with an authenticator
            code as well as the emailed code.
          </p>
          <p className="mt-2 text-xs font-medium text-[#344054]">
            Status: {statusLabel}
            {status.enrolled
              ? ` · ${status.backupCodesRemaining} backup codes left`
              : ""}
          </p>
        </div>
        {!status.enrolled ? (
          <Button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="h-9 shrink-0 rounded-full px-4"
          >
            Set up
          </Button>
        ) : null}
      </div>

      {status.enrolled ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {status.enabled ? (
            <Button
              type="button"
              variant="outline"
              disabled={!status.canDisable}
              onClick={() => void openChallenge("disable")}
              className="h-9 rounded-full border-[#D0D5DD] px-4 text-[#344054]"
            >
              Turn off
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => void openChallenge("enable")}
              className="h-9 rounded-full border-[#D0D5DD] px-4 text-[#344054]"
            >
              Turn on
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setSetupOpen(true)}
            className="h-9 rounded-full border-[#D0D5DD] px-4 text-[#344054]"
          >
            New device
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void openChallenge("backup")}
            className="h-9 rounded-full border-[#D0D5DD] px-4 text-[#344054]"
          >
            Replace backup codes
          </Button>
        </div>
      ) : null}

      {!status.canDisable && status.enabled ? (
        <p className="mt-3 text-xs text-[#667085]">
          2FA is required for this company, so it can&apos;t be turned off.
        </p>
      ) : null}

      <TwoFaSetupModal
        open={setupOpen}
        onOpenChange={setSetupOpen}
        forTeam={forTeam}
        enrolled={status.enrolled}
        onComplete={() => void fetchStatus(forTeam)}
      />

      <Dialog
        open={challenge !== null && backupCodes.length === 0}
        onOpenChange={(open) => {
          if (!open) {
            setChallenge(null);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <EmailVerificationCodeStep
            onBack={() => setChallenge(null)}
            onConfirm={(verificationCode, code2fa) =>
              void handleChallenge(verificationCode, code2fa)
            }
            isSubmitting={isSubmitting}
            error={error}
            onResendCode={requestEmail}
            requireAuthenticator
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={backupCodes.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setBackupCodes([]);
            setChallenge(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-semibold text-[#101828]">
            Save your backup codes
          </DialogTitle>
          <TwoFaBackupCodes
            codes={backupCodes}
            onDone={() => {
              setBackupCodes([]);
              setChallenge(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
