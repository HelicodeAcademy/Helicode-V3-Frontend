import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Helicode",
  description: "Create your Helicode account",
  openGraph: {
    title: "Sign Up - Helicode",
    description: "Create your Helicode account",
    url: "https://app.helicode.xyz/signup",
    siteName: "Helicode",
    images: [
      {
        url: "https://helicode.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "Helicode Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
