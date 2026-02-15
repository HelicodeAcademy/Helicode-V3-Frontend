import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <footer className="mx-auto max-w-7xl px-4 md:px-8 pt-14 pb-12 bg-red300">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                <div className="flex items-center gap-4 lg:gap-6">
                    <Link href="/" className="text-[#939393] hover:text-black text-sm lg:text-base font-medium transition-colors duration-300">Privacy</Link>
                    <Link href="/" className="text-[#939393] hover:text-black text-sm lg:text-base font-medium transition-colors duration-300">Terms & Conditions</Link>
                    <Link href="/" className="text-[#939393] hover:text-black text-sm lg:text-base font-medium transition-colors duration-300">Contact Us</Link>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                    <Link href="/" className="text-[#939393] hover:text-black text-sm lg:text-base font-medium transition-colors duration-300">Twitter</Link>
                    <Link href="/" className="text-[#939393] hover:text-black text-sm lg:text-base font-medium transition-colors duration-300">Telegram</Link>
                    <Link href="/" className="text-[#939393] hover:text-black text-sm lg:text-base font-medium transition-colors duration-300">LinkedIn</Link>
                </div>
            </div>
        </footer>
    )
}
