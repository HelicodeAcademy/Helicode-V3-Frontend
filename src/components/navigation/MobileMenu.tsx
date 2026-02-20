"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import Link from 'next/link';

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
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed right-0 top-0 z-50 h-full w-full bg-white md:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-4 py-4">
                            <span className="font-bold">Helicode</span>
                            <button onClick={onClose}>✕</button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-4 px-4 py-6">
                            {/* Product Accordion */}
                            <button
                                onClick={() => setProductOpen((prev) => !prev)}
                                className="flex items-center justify-between font-medium"
                            >
                                Product
                                {/* <motion.span
                                    animate={{ rotate: productOpen ? 180 : 0 }}
                                >
                                    ▼
                                </motion.span> */}
                            </button>

                            <AnimatePresence>
                                {productOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className="ml-4 flex flex-col gap-3 overflow-hidden text-sm"
                                    >
                                        <Link href="/product-one" onClick={onClose}>
                                            Product One
                                        </Link>
                                        <Link href="/product-two" onClick={onClose}>
                                            Product Two
                                        </Link>
                                        <Link href="/product-three" onClick={onClose}>
                                            Product Three
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Link href="/" onClick={onClose}>
                                About
                            </Link>

                            <Link href="/" onClick={onClose}>
                                Hire Talent
                            </Link>
                            <Link href="/" onClick={onClose}>
                                Learn
                            </Link>

                            <Link
                                href="/get-started"
                                onClick={onClose}
                                className="mt-4 rounded-md bg-black px-4 py-2 text-center text-white"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
