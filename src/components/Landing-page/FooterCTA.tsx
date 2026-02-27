import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";

export default function FooterCTA() {
  return (
    <section className="w-full flex lg:px-4 py-12 pb-0 md:py-16 md:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div
          className="grid w-full rounded-2xl bg-[#0052FF] grid-cols-[24px_auto_24px] lg:grid-cols-[52px_auto_52px]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(225, 225, 225, 0.2) 0.5px, transparent 1.5px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="flex flex-col">
            <div className="relative h-8 md:h-11">
              <div className="border-[#598FFF] size-5 shrink-0 flex items-center justify-center rounded-full border bg-[#0052FF] absolute -bottom-2.5 -right-2.5">
                <div className="border-[#598FFF] border size-3/5 rounded-full"></div>
              </div>
            </div>

            <div
              className="border-y-[0.5px] flex grow"
              style={
                {
                  "--background-border": "#ffffff",
                  borderStyle: "dashed",
                  borderImageSource:
                    "repeating-linear-gradient(to right, transparent 0px, transparent 4px, color-mix(in srgb, var(--background) 56%, transparent) 4px, color-mix(in srgb, var(--background) 56%, transparent) 12px)",
                  borderImageSlice: 1,
                } as React.CSSProperties
              }
            ></div>

            <div className="relative h-8 md:h-12">
              <div className="border-[#598FFF] shrink-0 size-5 flex items-center justify-center rounded-full border bg-[#0052FF] absolute -top-2.5 -right-2.5">
                <div className="border-[#598FFF] border size-3/5 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Middle content */}
          <div
            className="border-x-[0.5px]"
            style={
              {
                "--background-border": "#ffffff",
                borderStyle: "dashed",
                borderImageSource:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 4px, color-mix(in srgb, var(--background) 56%, transparent) 4px, color-mix(in srgb, var(--background) 56%, transparent) 12px)",
                borderImageSlice: 1,
              } as React.CSSProperties
            }
          >
            <div className="h-8 md:h-11"></div>

            <div
              className="border-y-[0.5px] flex grow flex-col"
              style={
                {
                  "--background-border": "#ffffff",
                  borderStyle: "dashed",
                  borderImageSource:
                    "repeating-linear-gradient(to right, transparent 0px, transparent 4px, color-mix(in srgb, var(--background) 56%, transparent) 4px, color-mix(in srgb, var(--background) 56%, transparent) 12px)",
                  borderImageSlice: 1,
                } as React.CSSProperties
              }
            >
              <div className="flex gap-10 lg:gap-5 flex-col-reverse md:flex-rowmd:items-start text-white p-6 sm:p6 lg:flex-row lg:items-center lg:justify-evenly lg:p-10">
                <div className="flex grow flex-col gap-10 max-w-139">
                  <div className="space-y-3">
                    <h2 className="font-semibold text-balancewhitespace-pre-line text-3xl sm:text-[40px]">
                      Start hiring and paying without borders.
                    </h2>
                    <p className="text-base font-normal">
                      Run compliant payroll in minutes, not days.
                    </p>
                  </div>

                  <Button className="w-fit bg-white hover:bg-white/90 text-[#0F112A] rounded-sm font-medium text-sm py-2 px-3.5">
                    Join waitlist
                  </Button>
                </div>
                <div className="relative shrink-0 size-24lg:size-32 bg-amber300">
                  <Image
                    src="/landingpage/CTA-illus.svg"
                    alt="CTA-Illustration"
                    width={400}
                    height={270}
                    loading="eager"
                    className="h-full w-full"
                  />
                  {/* <img alt="Tasks Automated Counter Icon" loading="lazy" decoding="async" data-nimg="fill" class="object-contain opacity-80" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="/images/landing/gumloop-deconstructed-logo.svg"> */}
                </div>
              </div>
            </div>

            <div className="h-8 md:h-12"></div>
          </div>

          <div className="flex flex-col">
            <div className="relative h-8 md:h-11">
              <div className="border-[#598FFF] size-5 shrink-0 flex items-center justify-center rounded-full border bg-[#0052FF] absolute -bottom-2.5 -left-2.5">
                <div className="border-[#598FFF] border size-3/5 rounded-full"></div>
              </div>
            </div>

            <div
              className="border-y-[0.5px] flex grow"
              style={
                {
                  "--background-border": "#ffffff",
                  borderStyle: "dashed",
                  borderImageSource:
                    "repeating-linear-gradient(to right, transparent 0px, transparent 4px, color-mix(in srgb, var(--background) 56%, transparent) 4px, color-mix(in srgb, var(--background) 56%, transparent) 12px)",
                  borderImageSlice: 1,
                } as React.CSSProperties
              }
            ></div>

            <div className="relative h-8 md:h-12">
              <div className="border-[#598FFF] shrink-0 size-5 flex items-center justify-center rounded-full border bg-[#0052FF] absolute -top-2.5 -left-2.5">
                <div className="border-[#598FFF] border size-3/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
