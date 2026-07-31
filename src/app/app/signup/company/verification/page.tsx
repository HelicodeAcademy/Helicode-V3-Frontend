"use client";
import Link from "next/link";
import Image from "next/image";
import { OnboardingVerification } from "@/components/auth/signup/onboarding-verification";
import { Toaster } from "react-hot-toast";
import onboardingIllustration from "../../../../../../public/signup/Onboarding-Illustration.png";

export default function CompanyVerificationPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="w-full lg:basis-2/5 flex flex-col justify-start items-center">
        <div className="relative w-full h-full overflow-hidden">
          <div className="relative w-full h-full">
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
                src={onboardingIllustration}
                alt="Illustrator"
                fill
                className="object-cover"
                placeholder="blur"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:basis-3/5 px-6 lg:px-12 py-8 bg-white flex flex-col">
        <div className="flex justify-end items-center w-full">
          <Link
            href="/login"
            className="font-medium hover:underline text-black text-sm"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#0052FF]">Login</span>
          </Link>
        </div>

        <div className="w-full max-w-138.75 mx-auto flex-1 flex items-center justify-center">
          <OnboardingVerification />
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
