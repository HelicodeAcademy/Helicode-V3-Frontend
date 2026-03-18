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
  const { isAuthenticated, accessToken, companies } = useTeamAuthStore();

  useEffect(() => {
    // Only redirect if user is authenticated
    if (isAuthenticated && accessToken) {
      console.log(companies);
      if (companies.length > 1) {
        router.push("/team/select-company");
      } else {
        router.push("/team/dashboard");
      }
    }
  }, [isAuthenticated, accessToken, companies, router]);

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
