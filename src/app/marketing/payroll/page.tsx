import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/Landing-page/Footer";
import FooterCTA from "@/components/Landing-page/FooterCTA";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Stablecoin Payroll for Global Teams",
  description:
    "Run global payroll with Helicode. Pay employees and contractors across Africa instantly in USDC or local currency. Lower FX costs, faster payouts, and compliant workforce operations.",
  path: "/payroll",
  keywords: [
    "stablecoin payroll",
    "crypto payroll",
    "USDC payroll",
    "global payroll",
    "payroll Africa",
    "cross-border payroll",
    "contractor payroll",
    "remote team payroll",
    "Helicode payroll",
  ],
});

const BENEFITS = [
  {
    title: "Instant cross-border payroll",
    description:
      "Pay your team in minutes with stablecoins instead of waiting days for traditional bank rails and FX settlements.",
  },
  {
    title: "USDC or local currency payouts",
    description:
      "Fund payroll in digital dollars and let talent receive USDC or cash out to local bank and mobile money accounts.",
  },
  {
    title: "Hire and pay from one platform",
    description:
      "Onboard employees and contractors, manage contracts, and run payroll without juggling multiple tools.",
  },
  {
    title: "Built for Africa and global teams",
    description:
      "Support distributed workforces with payroll infrastructure designed for African markets and international employers.",
  },
];

const STEPS = [
  {
    title: "Hire or import your team",
    description:
      "Add employees and contractors, or bring an existing team onto Helicode.",
  },
  {
    title: "Fund your company wallet",
    description:
      "Deposit stablecoins or fiat into your Helicode wallet ready for payroll.",
  },
  {
    title: "Run payroll and pay instantly",
    description:
      "Schedule or run payroll once, then track every payment from a single dashboard.",
  },
];

export default function PayrollPage() {
  return (
    <div>
      <Navbar />
      <main>
        <section className="border-b bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              <p className="text-sm font-medium uppercase tracking-wide text-[#0052FF]">
                Stablecoin payroll
              </p>
              <h1 className="text-4xl font-bold leading-tight text-black sm:text-5xl md:text-6xl">
                Global payroll built for stablecoins and African markets
              </h1>
              <p className="text-lg text-[#717171]">
                Helicode helps companies hire talent and run payroll across
                borders with USDC. Pay teams faster, cut FX friction, and manage
                workforce operations from one platform.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
                <Button asChild variant="surface">
                  <Link href="https://calendly.com/fiyin-helicode/30min">
                    Book a demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-10">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Why companies choose Helicode payroll
              </h2>
              <p className="text-lg text-[#697282]">
                Traditional payroll tools were not designed for stablecoin
                rails or distributed African workforces. Helicode is.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-2xl border border-[#E6E8EC] bg-white p-6 md:p-8 space-y-3"
                >
                  <h3 className="text-xl font-semibold text-[#0B1524]">
                    {benefit.title}
                  </h3>
                  <p className="text-[#697282] leading-relaxed">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-10">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-bold sm:text-4xl">
                How Helicode payroll works
              </h2>
              <p className="text-lg text-[#697282]">
                Launch payroll in three steps without setting up complex
                banking stacks in every country.
              </p>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-[#E6E8EC] bg-white p-6 md:p-8 space-y-3"
                >
                  <p className="text-sm font-semibold text-[#0052FF]">
                    Step {index + 1}
                  </p>
                  <h3 className="text-xl font-semibold text-[#0B1524]">
                    {step.title}
                  </h3>
                  <p className="text-[#697282] leading-relaxed">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Stablecoin payroll for remote and global teams
              </h2>
              <p className="text-lg text-[#697282] leading-relaxed">
                Whether you are paying contractors in Nigeria, engineers in
                Kenya, or a distributed team across Africa and beyond, Helicode
                gives you a single payroll workflow. Fund once, pay instantly,
                and keep hiring, compliance, and payouts connected.
              </p>
              <p className="text-lg text-[#697282] leading-relaxed">
                Looking for crypto payroll, USDC payroll, or a modern
                alternative to slow cross-border bank transfers? Helicode is
                built for that use case.
              </p>
            </div>
          </div>
        </section>

        <FooterCTA />
      </main>
      <Footer />
    </div>
  );
}
