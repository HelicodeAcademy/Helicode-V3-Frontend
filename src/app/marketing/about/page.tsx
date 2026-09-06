import type { Metadata } from "next";
import FooterCTA from "@/components/Landing-page/FooterCTA";
import Footer from "@/components/Landing-page/Footer";
import Navbar from "@/components/navigation/Navbar";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Helicode",
  description:
    "Helicode builds stablecoin payroll and global hiring infrastructure so companies can hire, manage, and pay African talent with modern financial rails.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <main>
        <div className="py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
            <div className="space-y-18">
              <div className="space-y-12">
                <p className="font-medium text-xl md:text-3xl">About Us</p>

                <div className="space-y-5">
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold">
                    Building the infrastructure for the new internet economy in
                    Africa
                  </h1>
                  <p className="text-xl">
                    Helicode is building products that make it easy for global
                    companies to hire, manage, and pay talent using modern
                    financial rails. We believe access to fast, reliable money
                    movement is foundational to economic freedom and innovation.
                  </p>
                </div>
              </div>

              <div className="space-y-13">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-3xl font-medium">Our Vision</h2>
                  <p className="text-xl">
                    One line of code at a time, we are connecting Africa to the
                    world. We&apos;re not just building products. We&apos;re
                    building economic rails for the next generation of global
                    work.
                  </p>
                </div>

                <div className="bg-[#0052FF] flex items-center justify-center p-14 rounded-[24px]">
                  <Image
                    src="/landingpage/about-illus.svg"
                    alt="Helicode about illustration"
                    width={640}
                    height={480}
                    loading="eager"
                    className="h-full w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl md:text-3xl font-medium">
                  Why We Believe in Stablecoins
                </h2>
                <p className="text-xl">
                  Stablecoins are the most powerful upgrade to global money
                  movement in decades. For the first time, value can move across
                  borders as fast as information without banks, delays, or
                  excessive fees. Stablecoins eliminate unnecessary
                  intermediaries and create a neutral, programmable layer for
                  global payments and payroll.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl md:text-3xl font-medium">Contact Us</h2>
                <p className="text-xl">
                  <a
                    href="mailto:fiyin@helicode.xyz"
                    className="text-[#0052FF] hover:underline"
                  >
                    fiyin@helicode.xyz
                  </a>
                </p>
              </div>
            </div>
          </div>
          <FooterCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
