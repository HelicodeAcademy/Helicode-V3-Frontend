"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { VerifyEmailForm } from "@/components/auth/signup/verify-email-form";
import { useAuthStore } from "@/store/auth-store";
import { Toaster } from "react-hot-toast";
import onboardingIllustration from "../../../../../public/signup/Onboarding-Illustration.png";

export default function VerifyEmailPage() {
  const { setCurrentStep } = useAuthStore();
  const router = useRouter();

  const goBack = () => {
    setCurrentStep("product");
    router.back();
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
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
        {/* Header Navigation */}
        <div className="flex justify-between items-center w-full">
          <button
            onClick={goBack}
            className="text-black font-normal flex items-center text-sm hover:text-primary transition-colors"
          >
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
            <span className="font-bold text-[#0052FF]">Login</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-138.75 mx-auto flex-1 flex items-center justify-center">
          <VerifyEmailForm />
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
