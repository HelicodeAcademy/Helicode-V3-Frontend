import React from "react";
import { Button } from "../ui/button";
import { WaitlistButton } from "../waitlist/WaitlistModal";
import Link from "next/link";

export default function Hero() {
    return (
        <section
            id="hero"
            className="w-full border-b bg-white py-24 md:py-34     flexitems-centerjustify-center"
            style={{
                backgroundImage:
                    'radial-gradient(rgba(0, 0, 0, 0.1) 0.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col gap-10 justify-center items-center text-center max-w-4xl mx-auto">
                    <div className='space-y-4'>
                        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-black leadingtight">
                            Global hiring and payroll built on stablecoins.
                        </h1>
                        <p className="max-w-xlmx-auto text-lg  text-[#717171] font-normal">
                            The all-in-one infrastructure for global hiring, payroll, compliance, and workforce operations.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <WaitlistButton
                            variant="primary"
                            scheduleCallUrl="https://calendly.com/fiyinodebunmi/30min"
                        >
                            Join Waitlist
                        </WaitlistButton>

                        <Button asChild variant="surface" size="default">
                            <Link href="https://calendly.com/fiyinodebunmi/30min">
                                Book a Demo
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
