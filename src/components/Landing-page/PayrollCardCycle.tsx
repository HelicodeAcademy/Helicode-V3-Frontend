"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import CeloLogo from "../../../public/landingpage/Celo.png"
import StellarLogo from "../../../public/landingpage/stellar.png"
import SolanaLogo from "../../../public/landingpage/Solana-Logo.png"
import image1 from "../../../public/landingpage/Payroll-img1.png"
import image2 from "../../../public/landingpage/Payroll-img2.png"
import Image, { StaticImageData } from "next/image";

type PayrollRow = {
    id: number;
    name: string;
    avatar: StaticImageData;
    currency: string;
    currencyIcon: string;
    // networkIcon: string;
    networkIcon: StaticImageData;
    salary: string;
    status: string;
};

type CardType = {
    id: number;
    bg: string;
    rows: PayrollRow[];
};

const cards: CardType[] = [
    {
        id: 1,
        bg: "bg-white",
        rows: [
            {
                id: 1,
                name: "John D.",
                avatar: image1,
                currency: "USDT",
                currencyIcon: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=024",
                // networkIcon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024",
                networkIcon: CeloLogo,
                salary: "$3,200",
                status: "Paid",
            },
            {
                id: 2,
                name: "Jane S.",
                avatar: image2,
                currency: "USDC",
                currencyIcon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024",
                networkIcon: StellarLogo,
                salary: "$1,800",
                status: "Paid",
            },
        ],
    },
    {
        id: 2,
        bg: "bg-white",
        rows: [
            {
                id: 3,
                name: "Mike J.",
                avatar: image1,
                currency: "USDT",
                currencyIcon: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=024",
                networkIcon: StellarLogo,
                salary: "$2,400",
                status: "Paid",
            },
            {
                id: 4,
                name: "Alice B.",
                avatar: image2,
                currency: "USDC",
                currencyIcon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024",
                networkIcon: SolanaLogo,
                salary: "$1,500",
                status: "Paid",
            },
        ],
    },
];

// const CYCLE_DURATION = 2500;
const CYCLE_DURATION = 5000;

const INTERVAL = 5000;


export default function PayrollCardCycle() {
    // const [activeIndex, setActiveIndex] = useState(0);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setActiveIndex((prev) => (prev + 1) % cards.length);
    //     }, CYCLE_DURATION);

    //     return () => clearInterval(interval);
    // }, []);

    // return (
    //     <div className="relative w-full w[320px] h[200px] min-h-50">
    //         <AnimatePresence initial={false}>
    //             {cards.map((card, index) => {
    //                 const isActive = index === activeIndex;

    //                 return (
    //                     <motion.div
    //                         key={card.id}
    //                         className={`absolute w-full h[140px] h-35 rounded-2xl text-white flex items-center justify-center text-lg font-semibold shadow-xl ${card.bg}`}
    //                         animate={{
    //                             // scale: isActive ? 1 : 0.92,
    //                             scale: isActive ? 1 : 0.7,
    //                             y: isActive ? 0 : 40,
    //                             zIndex: isActive ? 2 : 1,
    //                         }}
    //                         transition={{
    //                             duration: 0.5,
    //                             ease: "easeInOut",
    //                         }}
    //                     >
    //                         {card.title}
    //                     </motion.div>
    //                 );
    //             })}
    //         </AnimatePresence>
    //     </div>
    // );

    const [order, setOrder] = useState(cards);

    useEffect(() => {
        const interval = setInterval(() => {
            setOrder((prev) => {
                const newOrder = [...prev];
                const first = newOrder.shift()!;
                newOrder.push(first);
                return newOrder;
            });
        }, INTERVAL);

        return () => clearInterval(interval);
    }, []);

    // return (
    //     <div className="relative w-full w[320px] h[200px] min-h-50">
    //         {order.map((card, index) => {
    //             const isFront = index === 0;

    //             return (
    //                 <motion.div
    //                     key={card.id}
    //                     className={`absolute w-full h[140px] h-35 hfit rounded-2xl text-white flex items-center justify-center text-lg font-semibold shadow-xl ${card.bg}`}
    //                     animate={{
    //                         y: isFront ? 0 : 60,
    //                         scale: isFront ? 1 : 0.75,
    //                         zIndex: isFront ? 2 : 1,
    //                         opacity: isFront ? 1 : 0.9,
    //                     }}
    //                     transition={{
    //                         duration: 0.6,
    //                         ease: "easeInOut",
    //                     }}
    //                 >
    //                     {card.title}
    //                 </motion.div>
    //             );
    //         })}
    //     </div>
    // );

    return (
        <div className="relative w-full min-h-50">
            {order.map((card, index) => {
                const isFront = index === 0;

                return (
                    <motion.div
                        key={card.id}
                        className={`absolute w-full rounded-xl border border-[#E6E8EC] shadow-[0_4px_10px_-5px_rgba(0,0,0,0.10)] p-4 ${card.bg
                            } text-black`}
                        animate={{
                            y: isFront ? 0 : 60,
                            scale: isFront ? 1 : 0.75,
                            zIndex: isFront ? 2 : 1,
                            opacity: isFront ? 1 : 0.9,
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                        }}
                    >
                        {/* Payroll Table */}
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] text-xs font-semibold text-[#969696] capitalize">
                                <span>Name</span>
                                <span>Currency</span>
                                <span>Network</span>
                                <span>Salary</span>
                                <span>Status</span>
                            </div>

                            {/* Rows */}
                            {card.rows.map((row) => (
                                <div
                                    key={row.id}
                                    className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center"
                                >
                                    {/* Name */}
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={row.avatar}
                                            alt={row.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm font-medium">{row.name}</span>
                                    </div>

                                    {/* Currency */}
                                    <div className="flex items-center gap-1">
                                        <img
                                            src={row.currencyIcon}
                                            alt={row.currency}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-sm font-medium text-[#A3A8B2]">{row.currency}</span>
                                    </div>

                                    {/* Network */}
                                    <div>
                                        <Image
                                            src={row.networkIcon}
                                            alt="Network"
                                            width={50}
                                            height={15}
                                        // className="w-5 h-5"
                                        />
                                    </div>

                                    {/* Salary */}
                                    <span className="text-sm font-medium">{row.salary}</span>

                                    {/* Status */}
                                    {/* <span className="text-green-300 font-semibold text-sm">
                                        {row.status}
                                    </span> */}
                                    <div className="bg-[#E3ECFF] flex items-center gap-1 px-1.5 py-0.5 rounded-full w-fit">
                                        <span>
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="5" cy="5" r="4.7" stroke="#0052FF" strokeWidth="0.6" />
                                                <path d="M2.5625 5.375L3.65625 6.46875L6.9375 3.03125" stroke="#0052FF" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                        <span className="font-medium text-xs text-[#0052FF]">{row.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
