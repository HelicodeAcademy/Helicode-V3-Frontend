import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/Landing-page/Hero";
import SupporterLogos from "@/components/Landing-page/SupporterLogos";
import ImageFadeSection from "@/components/Landing-page/ImageFadeSection";
import Features from "@/components/Landing-page/Features";
import Testimonial from "@/components/Landing-page/Testimonial";
import HowItWorks from "@/components/Landing-page/HowItWorks";
import FooterCTA from "@/components/Landing-page/FooterCTA";
import Footer from "@/components/Landing-page/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stablecoin Payroll & Global Hiring",
  description:
    "Helicode is the all-in-one platform for global hiring and stablecoin payroll. Hire talent across Africa, run compliant payroll, and pay teams instantly in USDC or local currency.",
  path: "/",
});

export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <SupporterLogos />
        <ImageFadeSection />
        <Features />
        <HowItWorks />
        <Testimonial />
        <FooterCTA />
      </main>
      <Footer />
    </div>
  );
}
