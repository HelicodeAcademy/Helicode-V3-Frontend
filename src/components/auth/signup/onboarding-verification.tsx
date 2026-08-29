"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import toast from "react-hot-toast";

/**
 * Post email-verify screen: open TOS then identity verification links,
 * then continue to sign-in. Links come from verify-email (or retry later
 * via GET /kyc/status after login if they were missing).
 */
export function OnboardingVerification() {
  const router = useRouter();
  const { pendingVerification, setPendingVerification, resetSignupData } =
    useAuthStore();

  useEffect(() => {
    if (!pendingVerification) {
      router.replace("/login");
    }
  }, [pendingVerification, router]);

  const openLink = (link: string | null | undefined, label: string) => {
    if (!link) {
      toast.error(
        `${label} is not available yet. Please sign in and try again shortly.`,
      );
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleContinueToLogin = () => {
    resetSignupData();
    setPendingVerification(null);
    router.push("/login");
  };

  if (!pendingVerification) {
    return null;
  }

  const { tosLink, kycLink } = pendingVerification;
  const hasLinks = Boolean(tosLink || kycLink);

  return (
    <div className="max-w-md">
      <div className="mb-8">
        <h1 className="mb-3 text-[2rem] font-medium text-[#212121] leading-[145%]">
          Complete your verification
        </h1>
        <p className="text-sm text-[#444444] leading-[145%]">
          Accept the terms of service, then complete identity verification. This
          usually takes a few minutes.
          {/* Review can take up to a couple of
          days — you can sign in while it&apos;s pending. */}
        </p>
      </div>

      {!hasLinks && (
        <div className="mb-6 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">
            Verification links aren&apos;t ready yet. Sign in and we&apos;ll
            show them on your dashboard as soon as they&apos;re available.
          </p>
        </div>
      )}

      <div className="space-y-3 mb-8">
        <button
          type="button"
          onClick={() => openLink(tosLink, "Terms of service link")}
          className="w-full cursor-pointer flex items-start gap-3 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
        >
          <ExternalLink className="h-5 w-5 mt-0.5 shrink-0 text-[#0052FF]" />
          <span>
            <span className="block text-[#000000] font-medium">
              1. Accept terms of service
            </span>
            <span className="block text-sm text-[#667085] mt-1">
              Open and accept the terms to continue verification.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => openLink(kycLink, "Identity verification link")}
          className="w-full cursor-pointer flex items-start gap-3 p-4 border border-[#E4E7EC] rounded-[6px] hover:bg-gray-50 transition-colors text-left bg-[#F9FAFB]"
        >
          <ExternalLink className="h-5 w-5 mt-0.5 shrink-0 text-[#0052FF]" />
          <span>
            <span className="block text-[#000000] font-medium">
              2. Complete identity verification
            </span>
            <span className="block text-sm text-[#667085] mt-1">
              Verify your identity. You can resume later if you need to step
              away.
            </span>
          </span>
        </button>
      </div>

      <Button
        type="button"
        variant="primary"
        className="w-full sm:w-auto"
        onClick={handleContinueToLogin}
      >
        Continue to sign in
      </Button>
    </div>
  );
}
