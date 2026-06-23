import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const helveticaNeue = localFont({
  src: [
    {
      path: "../../public/font/Helvetica/HelveticaNeue-Light.otf",
      weight: "400",
      style: "normal",
    },

    {
      path: "../../public/font/Helvetica/HelveticaNeue-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Helvetica/HelveticaNeue-Bold.otf",
      weight: "700",
      style: "500",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Helicode",
  description: "Stablecoin payroll for global teams",
  openGraph: {
    title: "Helicode",
    description: "Stablecoin payroll for global teams",
    url: "https://helicode.xyz",
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
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${helveticaNeue.variable} font-sans antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5RKZ24R4XG"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5RKZ24R4XG');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
