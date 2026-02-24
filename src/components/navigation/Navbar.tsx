"use client";

import Link from "next/link";
import { useState } from "react";
// import { motion, AnimatePresence } from 'motion/react';
import AnimatedLogo from "./AnimatedLogo";
import ProductMegaMenu from "./ProductMegaMenu";
import { Button } from "../ui/button";
import MobileMenu from "./MobileMenu";



export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xs select-none">
                <div className="max-w-7xl mx-auto">
                    <div className="relative flex items-center justify-between h-17 px-4 md:px-8">
                        <div className="shrink-0">
                            <Link href="/">
                                <AnimatedLogo className="h6wauto text-[#434343] hover:text-black transition-colors" />
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-8 wfull h-full justifycenter">
                            <ProductMegaMenu />

                            <Link href="/about" className="px2 text-black/70 font-normal hover:text-black transition-colors">
                                About
                            </Link>

                            <Link href="/" className="px2 text-black/70 font-normal hover:text-black transition-colors">
                                Hire Talent
                            </Link>
                            <Link href="/" className="px2 text-black/70 font-normal hover:text-black transition-colors">
                                Train Talent
                            </Link>
                        </div>
                        <div className="hidden lg:flex items-center h-full gap-3">
                            <Button
                                className="cursorpointer text-[#363636] bg-[#E9E9E9]hover:bg-[#E9E9E9]/90 bg-transparent hover:bg-transparent rounded-[6px]"
                            >
                                Book a Demo
                            </Button>
                            <Button
                                variant="primary"
                                className="py-2 px-3 text-white hover:bg-[#101828]/70 rounded-[6px]"
                            >
                                Join waitlist
                            </Button>
                        </div>

                        <div className="lg:hidden">
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="p-2 rounded-md text-gray-700 hover:text-black focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </header>
            {/* Mobile Drawer */}
            <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </>
    )
}
