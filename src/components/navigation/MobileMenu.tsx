"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { WaitlistButton } from "../waitlist/WaitlistModal";
import { ChevronDown } from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import { HireTalentButton } from "../Landing-page/HireTalentModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: Props) {
  const [productOpen, setProductOpen] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 z-50 h-full w-full bg-white md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-17 border-b px-4 py-4">
              <div className="shrink-0">
                <Link href="/">
                  <AnimatedLogo className="h6wauto text-[#434343] hover:text-black transition-colors" />
                </Link>
              </div>
              <button onClick={onClose}>✕</button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 px-4 py-6">
              {/* Product Accordion */}
              <button
                onClick={() => setProductOpen((prev) => !prev)}
                className="flex items-center justify-between fontmedium"
              >
                Products
                <motion.span
                  animate={{ rotate: productOpen ? 180 : 0 }}
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>

              <AnimatePresence>
                {productOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="ml-4 flex flex-col gap-3 overflow-hidden text-sm"
                  >
                    <Link href="#" onClick={onClose}>
                      Onboarding
                    </Link>
                    <Link href="#" onClick={onClose}>
                      Recruitment
                    </Link>
                    <Link href="#" onClick={onClose}>
                      Payroll
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link href="/about" onClick={onClose}>
                About
              </Link>

              <HireTalentButton variant="ghost" className="w-fit h-fit p-0! hover:bg-transparent cursor-pointer text-base text-black/70hover:text-black font-normal " scheduleCallUrl="https://calendly.com/fiyin-helicode/30min">
                Hire Talent
              </HireTalentButton>

              <a href="https://learn.helicode.xyz/" onClick={onClose}>
                Train Talent
              </a>


              <div className="mt-4 flex flex-col gap-4">
                <Button
                  asChild
                  variant="ghost"
                  // variant="link"
                  size="lg"
                >
                  <Link target="_blank" href="https://calendly.com/fiyin-helicode/30min">
                    Book a Demo
                  </Link>
                </Button>

                <WaitlistButton
                  variant="primary"
                  scheduleCallUrl="https://calendly.com/fiyin-helicode/30min"
                  className="px-4 py-2"
                >
                  Join Waitlist
                </WaitlistButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
