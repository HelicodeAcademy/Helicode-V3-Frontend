// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "motion/react";

// // ─────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────
// interface Card {
//     id: string;
//     label: string;
//     sublabel: string;
//     topBg: string;
//     topText: string;
//     subBg: string;
//     subText: string;
//     balance: string;
//     plusGlow: string;
// }

// // ─────────────────────────────────────────────
// // Card data — cycling order matters visually
// // ─────────────────────────────────────────────
// const CARDS: Card[] = [
//     {
//         id: "stablecoin",
//         label: "STABLECOIN",
//         sublabel: "FIAT",
//         topBg: "#0052FF",
//         topText: "#ffffff",
//         subBg: "#E3ECFF",
//         subText: "#0052FF",
//         balance: "$120,000",
//         plusGlow: "rgba(38, 112, 255, 0.45)",
//     },
//     {
//         id: "fiat",
//         label: "FIAT",
//         sublabel: "CRYPTO",
//         topBg: "#E3ECFF",
//         topText: "#0052FF",
//         subBg: "#EEF3FF",
//         subText: "#0052FF",
//         balance: "$84,500",
//         plusGlow: "rgba(38, 112, 255, 0.3)",
//     },
//     {
//         id: "crypto",
//         label: "CRYPTO",
//         sublabel: "STABLECOIN",
//         topBg: "#0A0F2C",
//         topText: "#6E9DF2",
//         subBg: "#121830",
//         subText: "#6E9DF2",
//         balance: "$37,210",
//         plusGlow: "rgba(110, 157, 242, 0.4)",
//     },
// ];

// // ─────────────────────────────────────────────
// // Animation variants
// // ─────────────────────────────────────────────
// const slotVariants = {
//     enter: (dir: number) => ({
//         // y: dir > 0 ? -100 : 100,
//         y: dir > 0 ? 100 : -100,
//         opacity: 0,
//     }),
//     center: {
//         y: 0,
//         opacity: 1,
//     },
//     exit: (dir: number) => ({
//         // y: dir > 0 ? 100 : -100,
//         y: dir > 0 ? -100 : 100,
//         opacity: 0,
//     }),
// };

// const balanceVariants = {
//     enter: (dir: number) => ({ y: dir > 0 ? -14 : 14, opacity: 0 }),
//     center: { y: 0, opacity: 1 },
//     exit: (dir: number) => ({ y: dir > 0 ? 14 : -14, opacity: 0 }),
// };

// // ─────────────────────────────────────────────
// // Component
// // ─────────────────────────────────────────────
// export default function WalletIllustration() {
//     const [idx, setIdx] = useState(0);
//     const [dir, setDir] = useState<1 | -1>(1);
//     const [locked, setLocked] = useState(false);

//     const current = CARDS[idx];

//     const goNext = useCallback(() => {
//         if (locked) return;
//         setLocked(true);
//         setDir(1);
//         setIdx((p) => (p + 1) % CARDS.length);
//         setTimeout(() => setLocked(false), 550);
//     }, [locked]);

//     const goPrev = useCallback(() => {
//         if (locked) return;
//         setLocked(true);
//         setDir(-1);
//         setIdx((p) => (p - 1 + CARDS.length) % CARDS.length);
//         setTimeout(() => setLocked(false), 550);
//     }, [locked]);

//     // Auto-cycle every 3s
//     useEffect(() => {
//         const id = setInterval(goNext, 3000);
//         return () => clearInterval(id);
//     }, [goNext]);

//     return (
//         <div
//             style={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 // background:
//                 //     "linear-gradient(150deg, #eef2ff 0%, #e4ecff 45%, #f0f4ff 100%)",
//                 fontFamily:
//                     "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
//             }}
//         >
//             {/* ── Wallet shell: 355 × 296 matching SVG viewBox ── */}
//             <div
//                 style={{
//                     position: "relative",
//                     width: 355,
//                     height: 296,
//                     userSelect: "none",
//                     WebkitTapHighlightColor: "transparent",
//                 }}
//             >
//                 {/* ── Stacked shadow cards behind ── */}
//                 {/* Card 3 — furthest back, #D8D8D8 */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 12,
//                         left: 20,
//                         right: 20,
//                         height: 260,
//                         borderRadius: 28,
//                         background: "#D8D8D8",
//                         zIndex: 0,
//                     }}
//                 />
//                 {/* Card 2 — middle, #E6E8EC */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 6,
//                         left: 10,
//                         right: 10,
//                         height: 272,
//                         borderRadius: 29,
//                         background: "#E6E8EC",
//                         zIndex: 1,
//                     }}
//                 />

//                 {/* ── Main foreground card ── */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         inset: 0,
//                         borderRadius: 30,
//                         background: "#ffffff",
//                         /* Matches SVG: outer #E7EFFF ring + inner #0052FF 0.5px border */
//                         boxShadow:
//                             "0 0 0 2.5px #E7EFFF, 0 0 0 3px #0052FF33, inset 0 0 0 0.5px #0052FF",
//                         zIndex: 2,
//                         overflow: "hidden",
//                         display: "flex",
//                         flexDirection: "column",
//                     }}
//                 >
//                     {/* TOP: Stacked card slots section */}
//                     {/* Height ~148px (roughly half the card) */}
//                     <div
//                         style={{
//                             position: "relative",
//                             height: 148,
//                             flexShrink: 0,
//                             overflow: "hidden",
//                         }}
//                     >
//                         <AnimatePresence custom={dir} mode="popLayout" initial={false}>
//                             <motion.div
//                                 key={current.id + "-slots"}
//                                 custom={dir}
//                                 variants={slotVariants}
//                                 initial="enter"
//                                 animate="center"
//                                 exit="exit"
//                                 transition={{
//                                     type: "spring",
//                                     stiffness: 300,
//                                     damping: 32,
//                                     mass: 0.9,
//                                 }}
//                                 style={{
//                                     position: "absolute",
//                                     inset: 0,
//                                     display: "flex",
//                                     flexDirection: "column",
//                                 }}
//                             >
//                                 {/* Primary slot — active card */}
//                                 <div
//                                     style={{
//                                         height: 84,
//                                         flexShrink: 0,
//                                         background: current.topBg,
//                                         display: "flex",
//                                         alignItems: "center",
//                                         paddingLeft: 24,
//                                         paddingRight: 24,
//                                     }}
//                                 >
//                                     <span
//                                         style={{
//                                             color: current.topText,
//                                             fontSize: 13,
//                                             fontWeight: 600,
//                                             letterSpacing: "0.08em",
//                                         }}
//                                     >
//                                         {current.label}
//                                     </span>
//                                 </div>

//                                 {/* Secondary slot — next card peek */}
//                                 <div
//                                     style={{
//                                         flex: 1,
//                                         background: current.subBg,
//                                         display: "flex",
//                                         alignItems: "center",
//                                         paddingLeft: 24,
//                                         paddingRight: 24,
//                                         // subtle inset top shadow to give depth 
//                                         boxShadow: "inset 0 3px 8px rgba(0,0,0,0.04)",
//                                     }}
//                                 >
//                                     <span
//                                         style={{
//                                             color: current.subText,
//                                             fontSize: 13,
//                                             fontWeight: 600,
//                                             letterSpacing: "0.08em",
//                                             opacity: 0.9,
//                                         }}
//                                     >
//                                         {current.sublabel}
//                                     </span>
//                                 </div>
//                             </motion.div>
//                         </AnimatePresence>
//                     </div>

//                     {/* BOTTOM: Balance section */}
//                     <div
//                         style={{
//                             flex: 1,
//                             background: "#ffffff",
//                             display: "flex",
//                             alignItems: "flex-end",
//                             justifyContent: "space-between",
//                             padding: "0 24px 22px 24px",
//                         }}
//                     >
//                         {/* ── Plus / Add button ── */}
//                         <motion.button
//                             onClick={goNext}
//                             whileHover={{ scale: 1.09 }}
//                             whileTap={{ scale: 0.91 }}
//                             transition={{ type: "spring", stiffness: 450, damping: 22 }}
//                             style={{
//                                 width: 46,
//                                 height: 46,
//                                 borderRadius: "50%",
//                                 border: "none",
//                                 cursor: "pointer",
//                                 background:
//                                     "linear-gradient(180deg, #2670FF 0%, #387BFC 18%, #508AF8 45%, #6195F4 72%, #6B9BF3 88%, #6E9DF2 100%)",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 flexShrink: 0,
//                                 boxShadow: `0 6px 22px ${current.plusGlow}`,
//                                 outline: "none",
//                             }}
//                             aria-label="Next card"
//                         >
//                             {/* Cross icon matching SVG's path exactly */}
//                             <svg
//                                 width="18"
//                                 height="18"
//                                 viewBox="0 0 18 18"
//                                 fill="none"
//                                 aria-hidden="true"
//                             >
//                                 {/* Vertical bar */}
//                                 <path
//                                     d="M9 2V16"
//                                     stroke="white"
//                                     strokeWidth="2.2"
//                                     strokeLinecap="round"
//                                 />
//                                 {/* Horizontal bar */}
//                                 <path
//                                     d="M2 9H16"
//                                     stroke="white"
//                                     strokeWidth="2.2"
//                                     strokeLinecap="round"
//                                 />
//                             </svg>
//                         </motion.button>

//                         {/* ── Balance display ── */}
//                         <div style={{ textAlign: "right" }}>
//                             <div style={{ overflow: "hidden", position: "relative" }}>
//                                 <AnimatePresence custom={dir} mode="popLayout" initial={false}>
//                                     <motion.div
//                                         key={current.id + "-balance"}
//                                         custom={dir}
//                                         variants={balanceVariants}
//                                         initial="enter"
//                                         animate="center"
//                                         exit="exit"
//                                         transition={{
//                                             type: "spring",
//                                             stiffness: 320,
//                                             damping: 30,
//                                             mass: 0.8,
//                                         }}
//                                     >
//                                         <div
//                                             style={{
//                                                 fontSize: 44,
//                                                 fontWeight: 700,
//                                                 color: "#0F112A",
//                                                 letterSpacing: "-0.025em",
//                                                 lineHeight: 1.06,
//                                                 whiteSpace: "nowrap",
//                                             }}
//                                         >
//                                             {current.balance}
//                                         </div>
//                                     </motion.div>
//                                 </AnimatePresence>
//                             </div>

//                             <div
//                                 style={{
//                                     fontSize: 10,
//                                     fontWeight: 600,
//                                     color: "#8D8D8D",
//                                     letterSpacing: "0.13em",
//                                     marginTop: 5,
//                                 }}
//                             >
//                                 WALLET BALANCE
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ── Dot navigation indicators ── */}
//             {/* <div
//                 style={{
//                     marginTop: 28,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 7,
//                 }}
//             >
//                 {CARDS.map((c, i) => (
//                     <motion.button
//                         key={c.id}
//                         onClick={() => {
//                             if (i === idx || locked) return;
//                             setDir(i > idx ? 1 : -1);
//                             setLocked(true);
//                             setIdx(i);
//                             setTimeout(() => setLocked(false), 550);
//                         }}
//                         animate={{
//                             width: i === idx ? 22 : 7,
//                             backgroundColor: i === idx ? "#0052FF" : "#C4CAD4",
//                         }}
//                         transition={{ type: "spring", stiffness: 380, damping: 28 }}
//                         style={{
//                             height: 7,
//                             borderRadius: 4,
//                             border: "none",
//                             cursor: "pointer",
//                             padding: 0,
//                             outline: "none",
//                         }}
//                         aria-label={`Go to ${c.label} card`}
//                     />
//                 ))}
//             </div> */}

//             {/* ── Subtle caption ── */}
//             {/* <p
//                 style={{
//                     marginTop: 18,
//                     fontSize: 12,
//                     color: "#8D8D8D",
//                     letterSpacing: "0.04em",
//                 }}
//             >
//                 Tap + to switch cards
//             </p> */}
//         </div>
//     );
// }

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Card {
//     id: string;
//     label: string;
//     bg: string;
//     text: string;
// }

// // ─── Cards — independent items in the carousel ───────────────────────────────

// const CARDS: Card[] = [
//     { id: "stablecoin", label: "STABLECOIN", bg: "#0052FF", text: "#ffffff" },
//     { id: "fiat", label: "FIAT", bg: "#E3ECFF", text: "#0052FF" },
// ];

// // ─── SVG paths (verbatim from Wallet_2.svg) ───────────────────────────────────

// const SHADOW_CARD_3 =
//     "M276.74 83.7285H77.4646C55.6883 83.7285 38.0352 101.382 38.0352 123.158V255.269C38.0352 277.045 55.6883 294.699 77.4646 294.699H276.74C298.516 294.699 316.17 277.045 316.17 255.269V123.158C316.17 101.382 298.516 83.7285 276.74 83.7285Z";
// const SHADOW_CARD_2 =
//     "M294.48 41.5049H59.7224C37.9461 41.5049 20.293 59.158 20.293 80.9343V239.959C20.293 261.735 37.9461 279.388 59.7224 279.388H294.48C316.257 279.388 333.91 261.735 333.91 239.959V80.9343C333.91 59.158 316.257 41.5049 294.48 41.5049Z";
// const MAIN_CARD_GLOW =
//     "M309.776 2.5C332.933 2.50003 351.706 21.2727 351.706 44.4297V226.655C351.706 249.812 332.933 268.584 309.776 268.584H44.4297C21.2728 268.584 2.50014 249.812 2.5 226.655V44.4297C2.5 21.2727 21.2727 2.5 44.4297 2.5H309.776Z";
// const MAIN_CARD_BORDER =
//     "M309.776 5H44.4294C22.6531 5 5 22.6531 5 44.4294V226.655C5 248.431 22.6531 266.084 44.4294 266.084H309.776C331.553 266.084 349.206 248.431 349.206 226.655V44.4294C349.206 22.6531 331.553 5 309.776 5Z";
// // The curved white overlay panel — concave notches cut into top-left/top-right
// // Its top edge is at y≈125 (the concave curves dip to ~125), flat top at y≈150.797
// const OVERLAY_PATH =
//     "M310.124 266.826C331.9 266.826 349.553 249.173 349.553 227.397V150.797H330.526H313.341C305.956 150.796 298.836 148.048 293.366 143.086L290.601 140.595C279.775 130.785 265.688 125.35 251.078 125.348H104.663C90.0526 125.349 75.9644 130.784 65.1376 140.595L62.3776 143.086C56.9061 148.045 49.7852 150.791 42.4008 150.79H25.2151L5.34766 150.797V227.397C5.34766 249.173 23.0008 266.826 44.7771 266.826H310.124Z";

// // ─── Layout constants matching the SVG's 355×296 coordinate space ─────────────

// const W = 355;
// const H = 296;

// // From SVG: blue rect  x=24.3477 y=24.3477 w=306 h=223 rx=19
// const TOP_CARD_X = 24.3477;
// const TOP_CARD_Y = 24.3477;
// const TOP_CARD_W = 306;
// const TOP_CARD_H = 223; // extends far down, but clipped by overlay
// const TOP_CARD_RX = 19;

// // From SVG: fiat rect  x=24.3477 y=79.3477 w=306 h=168 rx=19
// const BOT_CARD_X = 24.3477;
// const BOT_CARD_Y = 79.3477;
// const BOT_CARD_W = 306;
// const BOT_CARD_H = 168;
// const BOT_CARD_RX = 19;

// // Overlay's flat top edge y-coordinate (from path data V150.797)
// const OVERLAY_Y = 150.797;

// // The clipping region for card animation: top of blue card → overlay top
// const CLIP_TOP = TOP_CARD_Y; // 24.3477
// const CLIP_BOTTOM = OVERLAY_Y;  // 150.797
// const CLIP_H = CLIP_BOTTOM - CLIP_TOP; // ≈ 126.45px

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function WalletIllustration() {
//     // topIdx = which card is currently in the TOP slot
//     // botIdx = which card is currently in the BOTTOM slot
//     // They always differ by 1 (mod CARDS.length)
//     const [topIdx, setTopIdx] = useState<number>(0);
//     const [locked, setLocked] = useState<boolean>(false);

//     const botIdx = (topIdx + 1) % CARDS.length;

//     const advance = useCallback((): void => {
//         if (locked) return;
//         setLocked(true);
//         // Rotate: current bottom becomes new top, new bottom is next in line
//         setTopIdx((prev) => (prev + 1) % CARDS.length);
//         setTimeout(() => setLocked(false), 700);
//     }, [locked]);

//     useEffect(() => {
//         const id = setInterval(advance, 3000);
//         return () => clearInterval(id);
//     }, [advance]);

//     const topCard = CARDS[topIdx];
//     const botCard = CARDS[botIdx];

//     return (
//         <div
//             style={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontFamily:
//                     "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
//             }}
//         >
//             <div
//                 style={{
//                     position: "relative",
//                     width: W,
//                     height: H,
//                     userSelect: "none",
//                     flexShrink: 0,
//                 }}
//             >

//                 {/* ══════════════════════════════════════════════════════
//             LAYER 0 — Static SVG chrome
//             Shadow cards behind + white glow card surface
//         ══════════════════════════════════════════════════════ */}
//                 <svg
//                     width={W} height={H}
//                     viewBox={`0 0 ${W} ${H}`}
//                     fill="none"
//                     style={{ position: "absolute", inset: 0, zIndex: 0 }}
//                 >
//                     <path d={SHADOW_CARD_3} fill="#D8D8D8" stroke="white" strokeWidth="1.30431" strokeMiterlimit="10" />
//                     <path d={SHADOW_CARD_2} fill="#E6E8EC" stroke="white" strokeWidth="1.30431" strokeMiterlimit="10" />
//                     <path d={MAIN_CARD_GLOW} fill="white" stroke="#E7EFFF" strokeWidth="5" strokeMiterlimit="10" />
//                 </svg>

//                 {/* ══════════════════════════════════════════════════════
//             LAYER 1 — Card animation region
//             Clipped to the visible card area (y=24 → y=150).
//             Rounded top corners matching the wallet.
//             The TWO cards animate INDEPENDENTLY inside here:
//               • top card  → exits upward, keyed by topIdx
//               • bottom card → enters from below, keyed by botIdx
//         ══════════════════════════════════════════════════════ */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: CLIP_TOP,
//                         left: 0,
//                         right: 0,
//                         height: CLIP_H,
//                         overflow: "hidden",
//                         borderRadius: `${TOP_CARD_RX}px ${TOP_CARD_RX}px 0 0`,
//                         zIndex: 1,
//                     }}
//                 >
//                     {/*
//             ┌─────────────────────────┐  ← CLIP_TOP  (y=24.3)
//             │  TOP CARD               │  animates: slides UP and OUT on change
//             │  (STABLECOIN band)      │
//             ├─────────────────────────┤  ← BOT_CARD_Y (y=79.3) — bottom card starts here
//             │  BOTTOM CARD            │  animates: slides UP into position from below
//             │  (FIAT band, peek)      │
//             └─────────────────────────┘  ← CLIP_BOTTOM (y=150.8)

//             Key insight: these are two SEPARATE AnimatePresence blocks.
//             The top card exits UP (y: 0 → -CLIP_H).
//             The bottom card enters from below (y: CLIP_H → its resting offset).
//             Their resting y-offsets are fixed based on SVG coordinates.
//           */}

//                     {/* ── TOP CARD — independently animated ── */}
//                     {/*
//             Resting position in clip-local coords:
//               top = TOP_CARD_Y - CLIP_TOP = 0
//             This card fills from y=0 of the clip region.
//           */}
//                     <AnimatePresence initial={false}>
//                         <motion.div
//                             key={"top-" + topIdx}
//                             initial={{ y: CLIP_H }}        // enters from below the clip region
//                             animate={{ y: 0 }}             // settles at y=0 (its natural position)
//                             exit={{ y: -CLIP_H }}          // exits upward out of clip region
//                             transition={{
//                                 type: "spring",
//                                 stiffness: 280,
//                                 damping: 30,
//                                 mass: 0.9,
//                             }}
//                             style={{
//                                 position: "absolute",
//                                 top: 0,                       // TOP_CARD_Y - CLIP_TOP = 0
//                                 left: TOP_CARD_X,
//                                 width: TOP_CARD_W,
//                                 height: TOP_CARD_H,
//                                 borderRadius: TOP_CARD_RX,
//                                 background: topCard.bg,
//                                 overflow: "hidden",
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     position: "absolute",
//                                     top: 24,
//                                     left: 24,
//                                     color: topCard.text,
//                                     fontSize: 13,
//                                     fontWeight: 600,
//                                     letterSpacing: "0.08em",
//                                 }}
//                             >
//                                 {topCard.label}
//                             </div>
//                         </motion.div>
//                     </AnimatePresence>

//                     {/* ── BOTTOM CARD — independently animated ── */}
//                     {/*
//             Resting position in clip-local coords:
//               top = BOT_CARD_Y - CLIP_TOP = 79.3477 - 24.3477 = 55px
//             This card starts 55px below the top of the clip region —
//             that's exactly where it overlaps the blue card from below.
//           */}
//                     <AnimatePresence initial={false}>
//                         <motion.div
//                             key={"bot-" + botIdx}
//                             initial={{ y: CLIP_H }}                    // enters from the bottom
//                             animate={{ y: 0 }}                         // slides up to resting offset
//                             exit={{ y: -CLIP_H }}                      // exits upward
//                             transition={{
//                                 type: "spring",
//                                 stiffness: 280,
//                                 damping: 30,
//                                 mass: 0.9,
//                                 delay: 0.04,                             // tiny stagger after top card
//                             }}
//                             style={{
//                                 position: "absolute",
//                                 top: BOT_CARD_Y - CLIP_TOP,              // 55px — sits below top card
//                                 left: BOT_CARD_X,
//                                 width: BOT_CARD_W,
//                                 height: BOT_CARD_H,
//                                 borderRadius: BOT_CARD_RX,
//                                 background: botCard.bg,
//                                 overflow: "hidden",
//                                 // Subtle shadow — bottom card feels stacked on top of blue
//                                 boxShadow: "0 -2px 10px rgba(0,0,0,0.07)",
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     position: "absolute",
//                                     top: 24,
//                                     left: 24,
//                                     color: botCard.text,
//                                     fontSize: 13,
//                                     fontWeight: 600,
//                                     letterSpacing: "0.08em",
//                                 }}
//                             >
//                                 {botCard.label}
//                             </div>
//                         </motion.div>
//                     </AnimatePresence>
//                 </div>

//                 {/* ══════════════════════════════════════════════════════
//             LAYER 2 — White curved overlay SVG
//             Exact path from Wallet_2.svg rendered at native coords.
//             Sits OVER the card stack — the concave notches reveal
//             the card tops while masking their lower portions.
//         ══════════════════════════════════════════════════════ */}
//                 <svg
//                     width={W} height={H}
//                     viewBox={`0 0 ${W} ${H}`}
//                     fill="none"
//                     style={{
//                         position: "absolute",
//                         inset: 0,
//                         zIndex: 2,
//                         pointerEvents: "none",
//                         filter: "drop-shadow(0 -3px 10px rgba(0,40,150,0.07))",
//                     }}
//                 >
//                     <path d={OVERLAY_PATH} fill="white" />
//                 </svg>

//                 {/* ══════════════════════════════════════════════════════
//             LAYER 3 — Balance content (above overlay)
//         ══════════════════════════════════════════════════════ */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: OVERLAY_Y,
//                         left: 0,
//                         right: 0,
//                         bottom: H - 266,          // bottom of white card area in SVG coords
//                         zIndex: 3,
//                         display: "flex",
//                         alignItems: "flex-end",
//                         justifyContent: "space-between",
//                         padding: "0 28px 24px 28px",
//                     }}
//                 >
//                     {/* + button */}
//                     <motion.button
//                         onClick={advance}
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.87 }}
//                         transition={{ type: "spring", stiffness: 460, damping: 22 }}
//                         style={{
//                             width: 46,
//                             height: 46,
//                             borderRadius: "50%",
//                             border: "none",
//                             cursor: "pointer",
//                             background:
//                                 "linear-gradient(180deg, #2670FF 0%, #387BFC 11%, #508AF8 30%, #6195F4 51%, #6B9BF3 73%, #6E9DF2 100%)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             flexShrink: 0,
//                             boxShadow: "0 6px 22px rgba(38,112,255,0.42)",
//                             outline: "none",
//                         }}
//                     >
//                         <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
//                             <path
//                                 d="M8.5 2V15M2 8.5H15"
//                                 stroke="white"
//                                 strokeWidth="2.2"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                             />
//                         </svg>
//                     </motion.button>

//                     {/* Balance */}
//                     <div style={{ textAlign: "right" }}>
//                         <div
//                             style={{
//                                 fontSize: 44,
//                                 fontWeight: 700,
//                                 color: "#0F112A",
//                                 letterSpacing: "-0.025em",
//                                 lineHeight: 1.05,
//                                 whiteSpace: "nowrap",
//                             }}
//                         >
//                             $120,000
//                         </div>
//                         <div
//                             style={{
//                                 fontSize: 10,
//                                 fontWeight: 600,
//                                 color: "#8D8D8D",
//                                 letterSpacing: "0.13em",
//                                 marginTop: 5,
//                             }}
//                         >
//                             WALLET BALANCE
//                         </div>
//                     </div>
//                 </div>

//                 {/* ══════════════════════════════════════════════════════
//             LAYER 4 — Outer border ring (topmost, never clipped)
//         ══════════════════════════════════════════════════════ */}
//                 <svg
//                     width={W} height={H}
//                     viewBox={`0 0 ${W} ${H}`}
//                     fill="none"
//                     style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}
//                 >
//                     <path d={MAIN_CARD_BORDER} fill="none" stroke="#0052FF" strokeWidth="0.5" strokeMiterlimit="10" />
//                 </svg>

//             </div>

//             {/* ── Nav dots ── */}
//             {/* <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 7 }}>
//                 {CARDS.map((card, i) => (
//                     <motion.button
//                         key={card.id}
//                         onClick={() => {
//                             if (i !== topIdx) advance();
//                         }}
//                         animate={{
//                             width: i === topIdx ? 22 : 7,
//                             backgroundColor: i === topIdx ? "#0052FF" : "#C4CAD4",
//                         }}
//                         transition={{ type: "spring", stiffness: 380, damping: 28 }}
//                         style={{
//                             height: 7,
//                             borderRadius: 4,
//                             border: "none",
//                             cursor: "pointer",
//                             padding: 0,
//                             outline: "none",
//                         }}
//                     />
//                 ))}
//             </div> */}
//         </div>
//     );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Card {
    id: string;
    label: string;
    bg: string;
    text: string;
    stroke: string;
}

// ─── Card data ────────────────────────────────────────────────────────────────

const CARDS: Card[] = [
    { id: "stablecoin", label: "STABLECOIN", bg: "#0052FF", text: "#E4E6F3", stroke: "#D2D5DA" },
    { id: "fiat", label: "FIAT", bg: "#E3ECFF", text: "#0052FF", stroke: "#D2D5DA" },
];

// ─── Static SVG paths — verbatim from Wallet_3.svg ───────────────────────────

const P_SHADOW_3 = "M276.74 83.7285H77.4646C55.6883 83.7285 38.0352 101.382 38.0352 123.158V255.269C38.0352 277.045 55.6883 294.699 77.4646 294.699H276.74C298.516 294.699 316.17 277.045 316.17 255.269V123.158C316.17 101.382 298.516 83.7285 276.74 83.7285Z";
const P_SHADOW_2 = "M294.48 41.5049H59.7224C37.9461 41.5049 20.293 59.158 20.293 80.9343V239.959C20.293 261.735 37.9461 279.388 59.7224 279.388H294.48C316.257 279.388 333.91 261.735 333.91 239.959V80.9343C333.91 59.158 316.257 41.5049 294.48 41.5049Z";
const P_GLOW = "M309.776 2.5C332.933 2.50003 351.706 21.2727 351.706 44.4297V226.655C351.706 249.812 332.933 268.584 309.776 268.584H44.4297C21.2728 268.584 2.50014 249.812 2.5 226.655V44.4297C2.5 21.2727 21.2727 2.5 44.4297 2.5H309.776Z";
const P_BORDER = "M309.776 5H44.4294C22.6531 5 5 22.6531 5 44.4294V226.655C5 248.431 22.6531 266.084 44.4294 266.084H309.776C331.553 266.084 349.206 248.431 349.206 226.655V44.4294C349.206 22.6531 331.553 5 309.776 5Z";
const P_OVERLAY = "M310.124 266.826C331.9 266.826 349.553 249.173 349.553 227.397V150.797H330.526H313.341C305.956 150.796 298.836 148.048 293.366 143.086L290.601 140.595C279.775 130.785 265.688 125.35 251.078 125.348H104.663C90.0526 125.349 75.9644 130.784 65.1376 140.595L62.3776 143.086C56.9061 148.045 49.7852 150.791 42.4008 150.79H25.2151L5.34766 150.797V227.397C5.34766 249.173 23.0008 266.826 44.7771 266.826H310.124Z";

// ─── Layout — all values in SVG coordinate space (355 × 296) ─────────────────

const W = 355;
const H = 296;

// From SVG: rect x=24.3477 y=24.3477 w=306 h=88  rx=19  (BLUE / top card)
//           rect x=24.3477 y=79.3477 w=306 h=97  rx=19  (FIAT / bottom card)
const CARD_X = 24.3477;
const CARD_W = 306;
const CARD_RX = 19;

const BLUE_Y = 24.3477;
const BLUE_H = 88;

const FIAT_Y = 79.3477;
const FIAT_H = 97;

// Overlay flat top at y=150.797
const OVERLAY_Y = 150.797;

// Clip region: top of blue card → overlay top
const CLIP_TOP = BLUE_Y;
const CLIP_H = OVERLAY_Y - CLIP_TOP; // ≈ 126.45px

// Resting positions in clip-local coords (y=0 = CLIP_TOP)
const BLUE_REST: number = 0;
const FIAT_REST: number = FIAT_Y - CLIP_TOP; // ≈ 55px

// Both cards travel exactly CLIP_H px — solid block lift, no stretch
const TRAVEL = CLIP_H;

const SPRING = {
    type: "spring" as const,
    stiffness: 320,
    damping: 34,
    mass: 0.8,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WalletIllustration() {
    const [topIdx, setTopIdx] = useState<number>(0);
    const [locked, setLocked] = useState<boolean>(false);

    const bottomIdx = (topIdx + 1) % CARDS.length;

    const advance = useCallback((): void => {
        if (locked) return;
        setLocked(true);
        setTopIdx((prev) => (prev + 1) % CARDS.length);
        setTimeout(() => setLocked(false), 700);
    }, [locked]);

    const goTo = useCallback((i: number): void => {
        if (i === topIdx || locked) return;
        setLocked(true);
        setTopIdx(i);
        setTimeout(() => setLocked(false), 700);
    }, [topIdx, locked]);

    useEffect(() => {
        const id = setInterval(advance, 3200);
        return () => clearInterval(id);
    }, [advance]);

    const topCard = CARDS[topIdx];
    const bottomCard = CARDS[bottomIdx];

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                // fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,'Helvetica Neue',sans-serif",
            }}
        >
            <div style={{ position: "relative", width: W, height: H, userSelect: "none", flexShrink: 0 }}>

                {/* LAYER 0 — Static chrome */}
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none"
                    style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <path d={P_SHADOW_3} fill="#D8D8D8" stroke="white" strokeWidth="1.30431" strokeMiterlimit="10" />
                    <path d={P_SHADOW_2} fill="#E6E8EC" stroke="white" strokeWidth="1.30431" strokeMiterlimit="10" />
                    <path d={P_GLOW} fill="white" stroke="#E7EFFF" strokeWidth="5" strokeMiterlimit="10" />
                </svg>

                {/* LAYER 1 — Card animation region */}
                <div
                    style={{
                        position: "absolute",
                        top: CLIP_TOP,
                        left: 0,
                        right: 0,
                        height: CLIP_H,
                        overflow: "hidden",
                        borderRadius: `${CARD_RX}px ${CARD_RX}px 0 0`,
                        zIndex: 1,
                    }}
                >
                    {/* TOP card — rests at y=0, travels CLIP_H */}
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={"top-" + topIdx}
                            initial={{ y: TRAVEL }}
                            animate={{ y: BLUE_REST }}
                            exit={{ y: -TRAVEL }}
                            transition={SPRING}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: CARD_X,
                                width: CARD_W,
                                height: BLUE_H,
                                borderRadius: CARD_RX,
                                background: topCard.bg,
                                border: `1px solid ${topCard.stroke}`,
                                boxSizing: "border-box",
                            }}
                        >
                            <span style={{
                                position: "absolute",
                                top: 18, left: 22,
                                color: topCard.text,
                                fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
                            }}>
                                {topCard.label}
                            </span>
                        </motion.div>
                    </AnimatePresence>

                    {/* BOTTOM card — rests at y=FIAT_REST≈55, travels CLIP_H */}
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={"bot-" + bottomIdx}
                            initial={{ y: FIAT_REST + TRAVEL }}
                            animate={{ y: FIAT_REST }}
                            exit={{ y: FIAT_REST - TRAVEL }}
                            transition={{ ...SPRING, delay: 0.04 }}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: CARD_X,
                                width: CARD_W,
                                height: FIAT_H,
                                borderRadius: CARD_RX,
                                background: bottomCard.bg,
                                border: `1px solid ${bottomCard.stroke}`,
                                boxSizing: "border-box",
                                boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
                            }}
                        >
                            <span style={{
                                position: "absolute",
                                top: 18, left: 22,
                                color: bottomCard.text,
                                fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
                            }}>
                                {bottomCard.label}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* LAYER 2 — White curved overlay */}
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none"
                    style={{
                        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                        filter: "drop-shadow(0 -4px 14px rgba(0,40,160,0.07))",
                    }}>
                    <path d={P_OVERLAY} fill="white" />
                </svg>

                {/* LAYER 3 — Balance content */}
                <div
                    style={{
                        position: "absolute",
                        top: OVERLAY_Y, left: 0, right: 0, bottom: H - 266,
                        zIndex: 3,
                        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                        padding: "0 28px 24px 28px",
                    }}
                >
                    <motion.button
                        onClick={advance}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.87 }}
                        transition={{ type: "spring", stiffness: 460, damping: 22 }}
                        style={{
                            width: 46, height: 46, borderRadius: "50%",
                            border: "none", cursor: "pointer",
                            background: "linear-gradient(180deg,#2670FF 0%,#387BFC 11%,#508AF8 30%,#6195F4 51%,#6B9BF3 73%,#6E9DF2 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, boxShadow: "0 6px 22px rgba(38,112,255,0.42)", outline: "none",
                        }}
                    >
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M8.5 2V15M2 8.5H15" stroke="white" strokeWidth="2.2"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.button>

                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            fontSize: 44, fontWeight: 700, color: "#0F112A",
                            letterSpacing: "-0.025em", lineHeight: 1.05, whiteSpace: "nowrap",
                        }}>
                            $120,000
                        </div>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: "#8D8D8D",
                            letterSpacing: "0.13em", marginTop: 5,
                        }}>
                            WALLET BALANCE
                        </div>
                    </div>
                </div>

                {/* LAYER 4 — Border ring */}
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none"
                    style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
                    <path d={P_BORDER} stroke="#0052FF" strokeWidth="0.5" strokeMiterlimit="10" />
                </svg>

            </div>
        </div>
    );
}