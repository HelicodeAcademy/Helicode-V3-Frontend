import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 md:px-8 pt-14 pb-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
          <div className="max-w-sm space-y-2">
            <p className="text-base font-semibold text-black">Helicode</p>
            <p className="text-sm text-[#939393]">
              Stablecoin payroll and global hiring infrastructure for teams
              across Africa and beyond.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Product</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/payroll"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  Payroll
                </Link>
                <Link
                  href="/about"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  About
                </Link>
                <Link
                  href="/signup"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  Get started
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Legal</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/privacy-policy"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms-of-use"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-black">Social</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="https://x.com/helicodexyz"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  Twitter
                </Link>
                <Link
                  href="https://t.me/helicodeacademy"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  Telegram
                </Link>
                <Link
                  href="https://www.linkedin.com/company/helicode"
                  className="text-[#939393] hover:text-black text-sm transition-colors duration-300"
                >
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#939393]">
          © {new Date().getFullYear()} Helicode. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
