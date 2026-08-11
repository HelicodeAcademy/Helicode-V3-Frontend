"use client";

import Link from "next/link";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { PublicRoute } from "@/components/auth/access/public-route";
import { CompanyAdminLoginForm } from "@/components/auth/company-admin/company-admin-login-form";
import onboardingIllustration from "../../../../../public/signup/Onboarding-Illustration.png";

export default function CompanyAdminLoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen flex items-stretch md:flex-row flex-col">
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

        <div className="w-full lg:basis-3/5 flex flex-col px-6 lg:px-12 py-8 md:py-12">
          <div className="flex items-center justify-between gap-4 w-full">
            <Link
              href="/company-admin/setup/confirm"
              className="text-[13px] mb-4 md:text-sm text-[#000000] flex items-center hover:text-[#101828] transition-colors"
            >
              <Image
                src="/signup/back-arrow.svg"
                alt="back-arrow"
                width={16}
                height={16}
              />
              Complete setup
            </Link>
            <Link
              href="/login"
              className="font-medium hover:underline text-black text-[13px] md:text-sm"
            >
              Employer login
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <CompanyAdminLoginForm />
          </div>
        </div>

        <Toaster position="top-right" />
      </div>
    </PublicRoute>
  );
}
