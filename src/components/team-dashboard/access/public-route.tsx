"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
// import { useTeamAuth } from "@/hooks/useTeamAuth";

interface PublicRouteProps {
  children: React.ReactNode;
}

// Public Route Component
// Used for team auth pages
// Redirects to dashboard if user is authenticated

export function TeamPublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  // const { isAuthenticated, isLoading } = useTeamAuth();
  const { isAuthenticated, accessToken, companies, hasHydrated } =
    useTeamAuthStore();
  const companyCount = companies.length;

  useEffect(() => {
    if (!hasHydrated) return;

    // Only redirect if user is authenticated
    if (isAuthenticated && accessToken) {
      if (companyCount > 1) {
        router.replace("/team/select-company");
      } else {
        router.replace("/team/dashboard");
      }
    }
  }, [isAuthenticated, accessToken, router, hasHydrated, companyCount]);

  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#0166f4]" />
          <p className="text-[#667085]">Loading...</p>
        </div>
      </div>
    );
  }

  //   Loading state
  if (isAuthenticated && accessToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#0166f4]" />
          <p className="text-[#667085]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
