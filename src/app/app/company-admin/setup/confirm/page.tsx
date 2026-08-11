"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { CompanyAdminSetupForm } from "@/components/auth/company-admin/company-admin-setup-form";
import onboardingIllustration from "../../../../../../public/signup/Onboarding-Illustration.png";

export default function CompanyAdminSetupConfirmPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white">
      <div className="w-full lg:basis-2/5 flex flex-col justify-start items-center">
        <div className="relative w-full h-full overflow-hidden min-h-48 lg:min-h-screen">
          <div className="absolute left-6 top-9 z-10">
            <Image
              src="/signup/logo.svg"
              alt="Helicode Logo"
              width={110}
              height={24}
            />
          </div>
          <Image
            src={onboardingIllustration}
            alt="Illustrator"
            fill
            className="object-cover"
            placeholder="blur"
            priority
          />
        </div>
      </div>

      <div className="w-full lg:basis-3/5 px-6 lg:px-12 py-8 bg-white flex flex-col">
        <div className="flex justify-end items-center w-full">
          <Link
            href="/company-admin/login"
            className="font-medium hover:underline text-black text-sm"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#0052FF]">Login</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto flex-1 flex items-center justify-center py-8">
          <Suspense
            fallback={
              <p className="text-sm text-[#667085]">Loading setup form...</p>
            }
          >
            <CompanyAdminSetupForm />
          </Suspense>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
