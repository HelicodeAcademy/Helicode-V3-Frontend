import { AcceptInviteForm } from "@/components/team-dashboard/auth/aacept-invite";
import Image from "next/image";
import { Toaster } from "react-hot-toast";

export default function AcceptInvite() {
  return (
    <div className="h-screen flex items-stretch md:flex-row flex-col">
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
      {/* Right content area */}
      <div className="w-full lg:basis-3/5 flex flex-col px-6 lg:px-12 py-8 md:py-12">
        {/* Form */}
        <div className="flex items-center justify-center h-screen">
          <AcceptInviteForm />
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
