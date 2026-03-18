"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { TeamPublicRoute } from "@/components/team-dashboard/access/public-route";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { Button } from "@/components/ui/button";

export default function SelectCompany() {
  const router = useRouter();

  const {
    companies,
    selectedCompanyId,
    setSelectedCompany,
    isAuthenticated,
    accessToken,
  } = useTeamAuthStore();

  useEffect(() => {
    // If not autehticated or no companies, redirect to login
    if (!isAuthenticated || !accessToken) {
      router.push("/team/login");
      return;
    }

    // If only one company, auto-select and redirect
    if (companies.length === 1) {
      setSelectedCompany(companies[0].companyId);
      router.push("/team/dashboard");
      return;
    }

    // If no companies, redirect to login
    if (companies.length === 0) {
      router.push("/team/login");
      return;
    }
  }, [companies, isAuthenticated, accessToken, router, setSelectedCompany]);

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    router.push("/team/dashboard");
  };

  const handleLogout = () => {
    const { clearTeamLoginData } = useTeamAuthStore.getState();
    clearTeamLoginData();
    router.push("/team/login");
  };

  return (
    <TeamPublicRoute>
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
        {/* Right content area */}
        <div className="w-full lg:basis-3/5 flex flex-col px-6 lg:px-12 py-8 md:py-12">
          {/* Top navigation */}
          <div className="flex items-center justify-between w-full"></div>

          {/* Form */}
          <div className="w-full max-w-154 mx-auto flex-1 flex items-center justify-center">
            <div>
              {/* Header */}
              <div className="">
                <h1 className="text-[2rem] text-black font-medium leading-[145%]">
                  Select a Company
                </h1>
                <p className="text-[#0F112A] text-sm">
                  You have access to multiple companies. Select one to continue.
                </p>
              </div>

              {/* Companies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {companies.map((company) => (
                  <button
                    key={company.companyId}
                    onClick={() => handleSelectCompany(company.companyId)}
                    className={`relative overflow-hidden rounded-lg border-2 p-6 transition-all ${
                      selectedCompanyId === company.companyId
                        ? "border-[#0166f4] bg-[#eff4ff]"
                        : "border-[#e5e7eb] bg-white hover:border-[#0166f4] hover:bg-[#f9fafb]"
                    }`}
                  >
                    {/* Company Avatar */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-[#0166f4] flex items-center justify-center text-white font-bold text-sm">
                        {company.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-[#101828]">
                          {company.companyName}
                        </h3>
                        <p className="text-xs text-[#667085] mt-1">
                          Status:{" "}
                          <span className="text-[#219d53]">
                            {company.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Check Icon for Selected */}
                    {selectedCompanyId === company.companyId && (
                      <div className="absolute top-4 right-4">
                        <div className="h-5 w-5 rounded-full bg-[#0166f4] flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() =>
                    handleSelectCompany(
                      selectedCompanyId || companies[0]?.companyId || "",
                    )
                  }
                  disabled={!selectedCompanyId}
                  className=""
                >
                  Continue
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-[#d0d5dd]"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Toaster position="top-right" />
      </div>
    </TeamPublicRoute>
  );
}
