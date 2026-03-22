"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected Route component
// Wraps protected routes to esnsure user is authenticated
// Redirects to login if user is not authenticated
// Shows loading state while checking authentication status

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    // only redirect if it has finished loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [ hasHydrated, isAuthenticated, isLoading, router,]);

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

  //   Shows nothing if user is not authenticated (this will redirect to login page)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
