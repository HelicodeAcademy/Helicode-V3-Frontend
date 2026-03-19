"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeamAuthStore } from "@/store/team/team-auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected Route component
// Wraps protected routes to esnsure user is authenticated
// Redirects to login if user is not authenticated
// Shows loading state while checking authentication status

export function TeamProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken, hasHydrated } = useTeamAuthStore();

  useEffect(() => {
    // Only check auth after Zustand has hydrated from localStorage
    if (!hasHydrated) return;

    // Redirect if user is not authenticated after hydration
    if (!isAuthenticated || !accessToken) {
      router.push("/team/login");
    }
  }, [hasHydrated, isAuthenticated, accessToken, router]);

  // Show loading state while store is being hydrated
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

  // User is authenticated, render children
  if (isAuthenticated && accessToken) {
    return <>{children}</>;
  }

  // User is not authenticated, show loading before redirect
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#0166f4]" />
        <p className="text-[#667085]">Redirecting...</p>
      </div>
    </div>
  );
}
