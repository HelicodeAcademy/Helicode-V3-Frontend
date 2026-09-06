import type { Metadata } from "next";

export const SITE_URL = "https://helicode.xyz";
export const SITE_NAME = "Helicode";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const DEFAULT_DESCRIPTION =
  "Helicode is stablecoin payroll and global hiring infrastructure for teams across Africa and beyond. Hire, onboard, run payroll, and pay talent instantly in USDC or local currency.";

export const DEFAULT_KEYWORDS = [
  "stablecoin payroll",
  "crypto payroll",
  "USDC payroll",
  "global payroll Africa",
  "payroll for remote teams",
  "hire African talent",
  "cross-border payroll",
  "contractor payroll",
  "global hiring platform",
  "Helicode",
];

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Stablecoin payroll for global teams`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description: DEFAULT_DESCRIPTION,
    email: "fiyin@helicode.xyz",
    sameAs: [
      "https://x.com/helicodexyz",
      "https://www.linkedin.com/company/helicode",
      "https://t.me/helicodeacademy",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "fiyin@helicode.xyz",
      contactType: "customer support",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Stablecoin payroll",
      "Global hiring and onboarding",
      "Contractor and employee payments",
      "Cross-border compliance",
      "USDC and local currency payouts",
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
