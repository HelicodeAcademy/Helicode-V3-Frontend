"use client";

import { KYCForm } from "@/components/dashboard-home/kyc/kyc-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useContext } from "react";
import { PageTitleContext } from "../layout";
import { Toaster } from "react-hot-toast";

export default function SetupAccountPage() {
  const router = useRouter();
  const onKYCSuccess = () => {
    router.push("/dashboard");
  };

  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Set up account");
  }, [setTitle]);

  return (
    <div className="p-6 md:p-10 max-w-140 mx-auto">
      <div className="mb-8">
        <h1 className="text-[2rem] font-bold text-[#212121] mb-2">
          Finish setting up your account
        </h1>
        <p className="text-[#444444] text-sm leading-[100%]">
          This is needed for taxes, security, and compliance. Make sure these
          details match your company&apos;s legal documents.
        </p>
      </div>

      <KYCForm onSuccess={onKYCSuccess} />

      <Toaster position="top-right" />
    </div>
  );
}
