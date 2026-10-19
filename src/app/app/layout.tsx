import type { Metadata } from "next";
// import { AppThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <AppThemeToggle /> */}
      {children}
    </>
  );
}
