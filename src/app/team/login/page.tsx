"use client";

import Link from "next/link";

import { PublicRoute } from "@/components/auth/access/public-route";
import { Toaster } from "react-hot-toast";
import { TeamLoginForm } from "@/components/team-page/auth/talent-login-form";
import Image from "next/image";

export default function TeamLoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen flex items-stretch md:flex-row flex-col">
        {/* Left sidebar with logo */}
        <div className="w-full lg:basis-2/5 flex flex-col justify-start items-center">
          <div className="relative w-full h-full overflow-hidden">
            {/* Illustrator wrapper with requested background, rounding and padding */}
            <div className="relative w-full h-full">
              {/* Logo positioned inside the illustrator on the left */}
              <div className="absolute left-6 top-9 z-10">
                <Image
                  src="/signup/logo.svg"
                  alt="Helicode Logo"
                  width={110}
                  height={24}
                />
              </div>

              <div className="relative w-full h-full">
                <Image
                  src="/signup/Onboarding-Illustration.svg"
                  alt="Illustrator"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full lg:basis-3/5 flex flex-col px-6 lg:px-12 py-8 md:py-12">
          {/* Top navigation */}
          <div className="flex items-center justify-between w-full">
            <Link
              href="/signup"
              className="text-sm text-[#000000] flex items-center hover:text-[#101828] transition-colors"
            >
              <Image
                src="/signup/back-arrow.svg"
                alt="back-arrow"
                width={16}
                height={16}
              />
              Go back
            </Link>
            <Link
              href="/signup"
              className="font-medium hover:underline text-black text-sm"
            >
              Don&apos;t have an account?{" "}
              <span className="font-bold text-[#355587]">Sign up</span>
            </Link>
          </div>

          {/* Form */}
          <div className="flex-1 flex items-center justify-center">
            <TeamLoginForm />
          </div>
        </div>

        <Toaster position="top-right" />
      </div>
    </PublicRoute>
  );
}
