"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const handleResendEmail = () => {
    // TODO: Implement resend email logic with Zustand store
    router.push("/signup/company/details");
    console.log("Resending verification email...");
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left sidebar with logo */}
      <div className="w-full lg:basis-2/5 flex flex-col justify-start items-center p-8">
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

      <div className="w-full lg:basis-3/5 px-6 lg:px-12 py-8 bg-white flex flex-col">
        {/* Header Navigation */}
        <div className="flex justify-between items-center w-full">
          <button className="text-black font-normal flex items-center text-sm hover:text-primary transition-colors">
            <Image
              src="/signup/back-arrow.svg"
              alt="back-arrow"
              width={16}
              height={16}
            />
            Go back
          </button>
          <Link
            href="/login"
            className="font-medium hover:underline text-black text-sm"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#355587]">Login</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-138.75 mx-auto flex-1 flex items-center justify-center">
          <div>
            {/* Email Icon */}
            <div className="mb-4">
              <Image src="/signup/sms.svg" alt="sms" width={32} height={32} />
            </div>

            {/* Heading */}
            <h1 className="mb-2 text-[2rem] font-medium text-[#212121] leading-[145%]">
              Check your inbox and confirm your email address
            </h1>

            {/* Description */}
            <p className="mb-8 text-sm text-[#444444] leading-[145%]">
              A verification email has been sent to your inbox. Please verify
              <br /> your email to continue.
            </p>

            {/* Resend Button */}
            <Button
              onClick={handleResendEmail}
              variant={"primary"}
              className="w-27 bg-[#1C1C1C] hover:bg-[#212121] text-white rounded-lg transition-colors"
            >
              Resend email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
