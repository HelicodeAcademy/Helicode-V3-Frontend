import Link from "next/link";
import { TalentSignupForm } from "@/components/signup/talent-signup-form";
import Image from "next/image";

export default function TalentSignupPage() {
  return (
    <div className="min-h-screen flex items-stretch md:flex-row flex-col">
      {/* Left Sidebar - Hidden on mobile, visible on lg and up */}
      <div className="w-full lg:basis-2/5 flex flex-col justify-start items-center p-4.5">
        <div className="relative w-full h-full rounded-b-2xl overflow-hidden">
          {/* Illustrator wrapper with requested background, rounding and padding */}
          <div className="relative bg-[#F4F5F7] rounded-2xl p-1.5 w-full h-full">
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
                className="object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right content area */}
      <div className="w-full lg:basis-3/5 flex flex-col px-6 lg:px-12 py-8 md:py-12">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/signup"
            className="text-sm flex items-center text-[#000000] hover:text-[#101828] transition-colors"
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
            href="/login"
            className="font-medium hover:underline text-black text-sm"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#355587]">Login</span>
          </Link>
        </div>

        {/* Form Container - Centered with max width */}
        <div className="flex-1 flex items-center justify-center">
          <TalentSignupForm />
        </div>
      </div>
    </div>
  );
}
