import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Helicode",
  description: "Create your Helicode account",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
