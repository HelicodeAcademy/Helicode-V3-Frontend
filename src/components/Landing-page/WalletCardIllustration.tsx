"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// const cards = [
//     {
//         id: "stablecoin",
//         label: "STABLECOIN",
//         bg: "bg-[#2563FF]",
//         textColor: "text-white",
//         amount: "$120,000",
//     },
//     {
//         id: "fiat",
//         label: "FIAT",
//         bg: "bg-[#E8EEFF]",
//         textColor: "text-[#1a2a6c]",
//         amount: "$85,400",
//     },
//     {
//         id: "crypto",
//         label: "CRYPTO",
//         bg: "bg-[#1a1a2e]",
//         textColor: "text-white",
//         amount: "$34,600",
//     },
// ];

interface Card {
    id: string;
    label: string;
    sublabel: string;
    topBg: string;
    topText: string;
    subBg: string;
    subText: string;
    balance: string;
    plusGlow: string;
}

const CARDS: Card[] = [
    {
        id: "stablecoin",
        label: "STABLECOIN",
        sublabel: "FIAT",
        topBg: "#0052FF",
        topText: "#ffffff",
        subBg: "#E3ECFF",
        subText: "#0052FF",
        balance: "$120,000",
        plusGlow: "rgba(38, 112, 255, 0.45)",
    },
    {
        id: "fiat",
        label: "FIAT",
        sublabel: "CRYPTO",
        topBg: "#E3ECFF",
        topText: "#0052FF",
        subBg: "#EEF3FF",
        subText: "#0052FF",
        balance: "$84,500",
        plusGlow: "rgba(38, 112, 255, 0.3)",
    },
    // {
    //     id: "crypto",
    //     label: "CRYPTO",
    //     sublabel: "STABLECOIN",
    //     topBg: "#0A0F2C",
    //     topText: "#6E9DF2",
    //     subBg: "#121830",
    //     subText: "#6E9DF2",
    //     balance: "$37,210",
    //     plusGlow: "rgba(110, 157, 242, 0.4)",
    // },
];

// Animation variant
const slotVariants = {
    enter: (dir: number) => ({
        // y: dir > 0 ? -100 : 100,
        y: dir > 0 ? 100 : -100,
        opacity: 0,
    }),
    center: {
        y: 0,
        opacity: 1,
    },
    exit: (dir: number) => ({
        // y: dir > 0 ? 100 : -100,
        y: dir > 0 ? -100 : 100,
        opacity: 0,
    }),
};

const balanceVariants = {
    enter: (dir: number) => ({ y: dir > 0 ? -14 : 14, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? 14 : -14, opacity: 0 }),
};

export default function WalletCardIllustration() {
    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState<1 | -1>(1);
    const [locked, setLocked] = useState(false);

    const current = CARDS[idx];

    const goNext = useCallback(() => {
        if (locked) return;
        setLocked(true);
        setDir(1);
        setIdx((p) => (p + 1) % CARDS.length);
        setTimeout(() => setLocked(false), 550);
    }, [locked]);

    const goPrev = useCallback(() => {
        if (locked) return;
        setLocked(true);
        setDir(-1);
        setIdx((p) => (p - 1 + CARDS.length) % CARDS.length);
        setTimeout(() => setLocked(false), 550);
    }, [locked]);

    // Auto-cycle every 3s
    useEffect(() => {
        const id = setInterval(goNext, 3000);
        return () => clearInterval(id);
    }, [goNext]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div
                style={{
                    position: "relative",
                    width: 340,
                    height: 270,
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                }}
            >
                {/* ── Stacked shadow cards behind ── */}
                {/* Card 3 — furthest back, #D8D8D8 */}
                <div
                    style={{
                        position: "absolute",
                        // top: 12,
                        top: "15%",
                        // bottom: -10,
                        left: 40,
                        right: 40,
                        height: 260,
                        borderRadius: 28,
                        background: "#D8D8D8",
                        // background: "#0052FF",
                        border: "1.3px solid white",
                        zIndex: 0,
                        // scale: 0.8
                    }}
                />

                {/* Card 2 — middle, #E6E8EC */}
                <div
                    style={{
                        position: "absolute",
                        // top: 6,
                        top: "5%",
                        // bottom: -13,
                        left: 20,
                        right: 20,
                        height: 272,
                        borderRadius: 29,
                        background: "#E6E8EC",
                        // background: "#E3ECFF",
                        border: "1.3px solid white",
                        zIndex: 1,
                    }}
                />

                {/* ── Main foreground card ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 30,
                        background: "#ffffff",
                        boxShadow:
                            "0 0 0 2.5px #E7EFFF, 0 0 0 3px #0052FF33, inset 0 0 0 0.5px #0052FF",
                        zIndex: 2,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        padding: "20px"
                    }}
                >

                    <div
                        style={{
                            position: "relative",
                            height: 148,
                            flexShrink: 0,
                            overflow: "hidden",
                        }}
                    >
                        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
                            <motion.div
                                key={current.id + "-slots"}
                                custom={dir}
                                variants={slotVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 32,
                                    mass: 0.9,
                                }}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* Primary slot — active card */}
                                <div
                                    style={{
                                        height: 84,
                                        flexShrink: 0,
                                        background: current.topBg,
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: 24,
                                        paddingRight: 24,
                                        borderRadius: '20px 20px 0px 0px'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: current.topText,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                        }}
                                    >
                                        {current.label}
                                    </span>
                                </div>

                                {/* Secondary slot — next card peek */}
                                <div
                                    style={{
                                        flex: 1,
                                        background: current.subBg,
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: 24,
                                        paddingRight: 24,
                                        boxShadow: "inset 0 3px 8px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: current.subText,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                            opacity: 0.9,
                                        }}
                                    >
                                        {current.sublabel}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* BOTTOM: Balance section */}
                    <div
                        style={{
                            flex: 1,
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            padding: "0 24px 22px 24px",
                        }}
                    >
                        {/* ── Plus / Add button ── */}
                        <motion.button
                            onClick={goNext}
                            whileHover={{ scale: 1.09 }}
                            whileTap={{ scale: 0.91 }}
                            transition={{ type: "spring", stiffness: 450, damping: 22 }}
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                border: "none",
                                cursor: "pointer",
                                background:
                                    "linear-gradient(180deg, #2670FF 0%, #387BFC 18%, #508AF8 45%, #6195F4 72%, #6B9BF3 88%, #6E9DF2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: `0 6px 22px ${current.plusGlow}`,
                                outline: "none",
                            }}
                            aria-label="Next card"
                        >
                            {/* Cross icon matching SVG's path exactly */}
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                aria-hidden="true"
                            >
                                {/* Vertical bar */}
                                <path
                                    d="M9 2V16"
                                    stroke="white"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                                {/* Horizontal bar */}
                                <path
                                    d="M2 9H16"
                                    stroke="white"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </motion.button>

                        {/* ── Balance display ── */}
                        <div style={{ textAlign: "right" }}>
                            <div style={{ overflow: "hidden", position: "relative" }}>
                                <AnimatePresence custom={dir} mode="popLayout" initial={false}>
                                    <motion.div
                                        key={current.id + "-balance"}
                                        custom={dir}
                                        variants={balanceVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            type: "spring",
                                            stiffness: 320,
                                            damping: 30,
                                            mass: 0.8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 44,
                                                fontWeight: 700,
                                                color: "#0F112A",
                                                letterSpacing: "-0.025em",
                                                lineHeight: 1.06,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {current.balance}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#8D8D8D",
                                    letterSpacing: "0.13em",
                                    marginTop: 5,
                                }}
                            >
                                WALLET BALANCE
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Wallet */}
        </div>
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(150deg, #eef2ff 0%, #e4ecff 45%, #f0f4ff 100%)",
                fontFamily:
                    "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
            }}
        >
            {/* ── Wallet shell: 355 × 296 matching SVG viewBox ── */}
            <div
                style={{
                    position: "relative",
                    width: 355,
                    height: 296,
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                }}
            >
                {/* ── Stacked shadow cards behind ── */}
                {/* Card 3 — furthest back, #D8D8D8 */}
                <div
                    style={{
                        position: "absolute",
                        top: 12,
                        left: 20,
                        right: 20,
                        height: 260,
                        borderRadius: 28,
                        background: "#D8D8D8",
                        zIndex: 0,
                    }}
                />
                {/* Card 2 — middle, #E6E8EC */}
                <div
                    style={{
                        position: "absolute",
                        top: 6,
                        left: 10,
                        right: 10,
                        height: 272,
                        borderRadius: 29,
                        background: "#E6E8EC",
                        zIndex: 1,
                    }}
                />

                {/* ── Main foreground card ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 30,
                        background: "#ffffff",
                        /* Matches SVG: outer #E7EFFF ring + inner #0052FF 0.5px border */
                        boxShadow:
                            "0 0 0 2.5px #E7EFFF, 0 0 0 3px #0052FF33, inset 0 0 0 0.5px #0052FF",
                        zIndex: 2,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* ═══════════════════════════════════════
              TOP: Stacked card slots section
              Height ~148px (roughly half the card)
          ═══════════════════════════════════════ */}
                    <div
                        style={{
                            position: "relative",
                            height: 148,
                            flexShrink: 0,
                            overflow: "hidden",
                        }}
                    >
                        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
                            <motion.div
                                key={current.id + "-slots"}
                                custom={dir}
                                variants={slotVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 32,
                                    mass: 0.9,
                                }}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* Primary slot — active card */}
                                <div
                                    style={{
                                        height: 84,
                                        flexShrink: 0,
                                        background: current.topBg,
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: 24,
                                        paddingRight: 24,
                                    }}
                                >
                                    <span
                                        style={{
                                            color: current.topText,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                        }}
                                    >
                                        {current.label}
                                    </span>
                                </div>

                                {/* Secondary slot — next card peek */}
                                <div
                                    style={{
                                        flex: 1,
                                        background: current.subBg,
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: 24,
                                        paddingRight: 24,
                                        /* subtle inset top shadow to give depth */
                                        boxShadow: "inset 0 3px 8px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: current.subText,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            letterSpacing: "0.08em",
                                            opacity: 0.9,
                                        }}
                                    >
                                        {current.sublabel}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>


                    {/* BOTTOM: Balance section */}
                    <div
                        style={{
                            flex: 1,
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            padding: "0 24px 22px 24px",
                        }}
                    >
                        {/* ── Plus / Add button ── */}
                        <motion.button
                            onClick={goNext}
                            whileHover={{ scale: 1.09 }}
                            whileTap={{ scale: 0.91 }}
                            transition={{ type: "spring", stiffness: 450, damping: 22 }}
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                border: "none",
                                cursor: "pointer",
                                background:
                                    "linear-gradient(180deg, #2670FF 0%, #387BFC 18%, #508AF8 45%, #6195F4 72%, #6B9BF3 88%, #6E9DF2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: `0 6px 22px ${current.plusGlow}`,
                                outline: "none",
                            }}
                            aria-label="Next card"
                        >
                            {/* Cross icon matching SVG's path exactly */}
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                aria-hidden="true"
                            >
                                {/* Vertical bar */}
                                <path
                                    d="M9 2V16"
                                    stroke="white"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                                {/* Horizontal bar */}
                                <path
                                    d="M2 9H16"
                                    stroke="white"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </motion.button>

                        {/* ── Balance display ── */}
                        <div style={{ textAlign: "right" }}>
                            <div style={{ overflow: "hidden", position: "relative" }}>
                                <AnimatePresence custom={dir} mode="popLayout" initial={false}>
                                    <motion.div
                                        key={current.id + "-balance"}
                                        custom={dir}
                                        variants={balanceVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            type: "spring",
                                            stiffness: 320,
                                            damping: 30,
                                            mass: 0.8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 44,
                                                fontWeight: 700,
                                                color: "#0F112A",
                                                letterSpacing: "-0.025em",
                                                lineHeight: 1.06,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {current.balance}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    color: "#8D8D8D",
                                    letterSpacing: "0.13em",
                                    marginTop: 5,
                                }}
                            >
                                WALLET BALANCE
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
