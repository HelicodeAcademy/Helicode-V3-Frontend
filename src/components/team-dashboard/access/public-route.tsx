"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeamAuthStore } from "@/store/team/team-auth-store";

interface PublicRouteProps {
  children: React.ReactNode;
}

// Public Route Component
// Used for auth pages
// Redirects to dashboard if user is authenticated

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useTeamAuthStore();

  useEffect(() => {
    // If the user is already authenticated, redirect to dashboard or company selection
    if (isAuthenticated) {
      const { companies } = useTeamAuthStore.getState();

      if (companies.length === 1) {
        router.push("/team/dashboard");
      } else {
        router.push("/team/select-company");
      }
    }
  }, [isAuthenticated, router]);

  //   Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#0166f4]" />
          <p className="text-[#667085]">Loading...</p>
        </div>
      </div>
    );
  }

  //   Shows nothing if user is authenticated (this will redirect to dashboard)
  if (isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
