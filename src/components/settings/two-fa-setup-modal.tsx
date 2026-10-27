"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmailVerificationCodeStep } from "@/components/ui/email-verification-code-step";
import { TwoFaBackupCodes } from "@/components/settings/two-fa-backup-codes";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import { requestTeamTransactionVerificationCode } from "@/lib/team/transaction-verification-service";
import {
  confirmTwoFaSetup,
  startTwoFaSetup,
  type TwoFaSetupResponse,
} from "@/lib/two-fa-service";
import { resolveTwoFaSubmitError } from "@/lib/two-fa-service";
import toast from "react-hot-toast";

type SetupStep = "reauth" | "scan" | "confirm" | "backup";

export function TwoFaSetupModal({
  open,
  onOpenChange,
  forTeam,
  enrolled,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forTeam: boolean;
  enrolled: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<SetupStep>(enrolled ? "reauth" : "scan");
  const [setup, setSetup] = useState<TwoFaSetupResponse | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(enrolled ? "reauth" : "scan");
    setSetup(null);
    setBackupCodes([]);
    setError("");
    setStarted(false);
    if (!enrolled) {
      void beginSetup();
    } else {
      void requestEmail().catch((err) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to send verification code",
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enrolled]);

  const requestEmail = async () => {
    if (forTeam) {
      await requestTeamTransactionVerificationCode("SETUP_2FA");
    } else {
      await requestTransactionVerificationCode("SETUP_2FA");
    }
    toast.success("Verification code sent to your email!");
  };

  const close = () => {
    setStep(enrolled ? "reauth" : "scan");
    setSetup(null);
    setBackupCodes([]);
    setError("");
    setStarted(!enrolled);
    onOpenChange(false);
  };

  const beginSetup = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const next = await startTwoFaSetup(forTeam);
      setSetup(next);
      setStarted(true);
      setStep("scan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start 2FA setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReauth = async (verificationCode: string, code2fa?: string) => {
    if (!code2fa) return;
    setIsSubmitting(true);
    setError("");
    try {
      const next = await startTwoFaSetup(forTeam, {
        code2fa,
        verificationCode,
      });
      setSetup(next);
      setStarted(true);
      setStep("scan");
    } catch (err) {
      const result = await resolveTwoFaSubmitError(err, requestEmail);
      setError(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToConfirm = async () => {
    setIsSubmitting(true);
    try {
      await requestEmail();
      setStep("confirm");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send verification code",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (verificationCode: string, code?: string) => {
    if (!code) return;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await confirmTwoFaSetup(forTeam, {
        code,
        verificationCode,
      });
      setBackupCodes(result.backupCodes);
      setStep("backup");
    } catch (err) {
      const result = await resolveTwoFaSubmitError(err, requestEmail);
      setError(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {step === "reauth" && (
          <EmailVerificationCodeStep
            onBack={close}
            onConfirm={(verificationCode, code2fa) =>
              void handleReauth(verificationCode, code2fa)
            }
            isSubmitting={isSubmitting}
            error={error}
            onResendCode={requestEmail}
            requireAuthenticator
          />
        )}

        {step === "scan" && (
          <div className="space-y-4">
            <DialogTitle className="text-xl font-semibold text-[#101828]">
              Set up authenticator app
            </DialogTitle>
            <p className="text-sm text-[#667085]">
              Scan this QR code with Google Authenticator, Authy, 1Password, or
              any other authenticator app.
            </p>
            {!started ? (
              isSubmitting ? (
                <p className="text-sm text-[#667085]">Generating QR code...</p>
              ) : (
                <Button type="button" onClick={() => void beginSetup()}>
                  Generate QR code
                </Button>
              )
            ) : (
              <>
                {setup?.qrSvg?.startsWith("<svg") ? (
                  <div
                    className="mx-auto w-48 [&_svg]:h-full [&_svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: setup.qrSvg }}
                  />
                ) : null}
                <div>
                  <p className="text-sm font-medium text-[#344054]">
                    Can&apos;t scan? Enter this key
                  </p>
                  <p className="mt-1 break-all rounded-lg bg-[#F9FAFB] px-3 py-2 font-mono text-sm text-[#101828]">
                    {setup?.secret}
                  </p>
                </div>
                <p className="text-xs text-[#667085]">
                  This setup expires in {setup?.expiresInMinutes ?? 10} minutes.
                </p>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void goToConfirm()}
                    disabled={isSubmitting || !setup}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "confirm" && (
          <EmailVerificationCodeStep
            onBack={() => setStep("scan")}
            onConfirm={(verificationCode, code) =>
              void handleConfirm(verificationCode, code)
            }
            isSubmitting={isSubmitting}
            error={error}
            onResendCode={requestEmail}
            requireAuthenticator
          />
        )}

        {step === "backup" && (
          <div>
            <DialogTitle className="mb-3 text-xl font-semibold text-[#101828]">
              Save your backup codes
            </DialogTitle>
            <TwoFaBackupCodes
              codes={backupCodes}
              onDone={() => {
                onComplete();
                close();
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
