// "use client"

// import { motion, AnimatePresence } from "motion/react"
// import { useEffect, useState } from "react"

// const USERS = [
//     {
//         name: "John Doe",
//         role: "Backend Developer",
//         image: "https://i.pravatar.cc/100?img=1",
//         date: "Onboarded on Monday, August 2025",
//     },
//     {
//         name: "Jane Smith",
//         role: "Frontend Developer",
//         image: "https://i.pravatar.cc/100?img=2",
//         date: "Onboarded on Tuesday, August 2025",
//     },
//     {
//         name: "Mike Johnson",
//         role: "DevOps Engineer",
//         image: "https://i.pravatar.cc/100?img=3",
//         date: "Onboarded on Wednesday, August 2025",
//     },
// ]

// const TOTAL_BARS = 53
// const LOAD_DURATION = 4000

// export default function OnboardingStack() {
//     const [order, setOrder] = useState([0, 1, 2])
//     const [progress, setProgress] = useState(0)
//     const [completed, setCompleted] = useState(false)

//     const activeIndex = order[1]

//     // Progress Animation Loop
//     useEffect(() => {
//         setProgress(0)
//         setCompleted(false)

//         let start = Date.now()

//         const interval = setInterval(() => {
//             const elapsed = Date.now() - start
//             const percent = Math.min(elapsed / LOAD_DURATION, 1)

//             setProgress(percent)

//             if (percent === 1) {
//                 clearInterval(interval)

//                 setCompleted(true)

//                 setTimeout(() => {
//                     cycleCards()
//                 }, 1200)
//             }
//         }, 16)

//         return () => clearInterval(interval)
//     }, [order])

//     const cycleCards = () => {
//         setOrder(prev => [prev[1], prev[2], prev[0]])
//     }

//     return (
//         <div className="relative w-105 w[420px]h[320px] h-80 mx-auto">

//             {order.map((userIndex, position) => {

//                 const isActive = position === 1

//                 return (
//                     <Card
//                         key={userIndex}
//                         user={USERS[userIndex]}
//                         position={position}
//                         isActive={isActive}
//                         progress={isActive ? progress : 0}
//                         completed={isActive && completed}
//                     />
//                 )
//             })}

//         </div>
//     )
// }

// function Card({
//     user,
//     position,
//     isActive,
//     progress,
//     completed,
// }: any) {

//     const scale = isActive ? 1 : 0.92

//     const y = position === 0
//         ? -60
//         : position === 1
//             ? 0
//             : 120

//     const zIndex = isActive ? 30 : 10

//     return (
//         <motion.div
//             layout
//             animate={{ scale, y }}
//             transition={{
//                 duration: 0.6,
//                 ease: [0.22, 1, 0.36, 1],
//             }}
//             style={{ zIndex }}
//             className="absolute w-full bg-white rounded-2xl shadow-xl p-5 border"
//         >

//             {/* Header */}

//             <div className="flex items-center justify-between">

//                 <div className="flex items-center gap-3">

//                     <img
//                         src={user.image}
//                         className="w-12 h-12 rounded-full"
//                     />

//                     <div>

//                         <p className="font-semibold">
//                             {user.name}
//                         </p>

//                         <p className="text-sm text-gray-500">
//                             {user.role}
//                         </p>

//                     </div>

//                 </div>

//                 <Spinner completed={completed} progress={progress} />

//             </div>

//             {/* Progress */}

//             <AnimatePresence>

//                 {!completed && isActive && (

//                     <motion.div
//                         // initial={{ height: 40, opacity: 1 }}
//                         initial={{ height: 50, opacity: 1 }}
//                         exit={{
//                             height: 0,
//                             opacity: 0,
//                         }}
//                         className="overflow-hidden"
//                     >

//                         <ProgressBar progress={progress} />

//                         <p className="text-xs text-gray-400 mt-3">
//                             {user.date}
//                         </p>

//                     </motion.div>

//                 )}

//             </AnimatePresence>

//         </motion.div>
//     )
// }

// function ProgressBar({ progress }: any) {

//     return (
//         <div className="flex justify-between gap-0.5 mt-4">

//             {Array.from({ length: TOTAL_BARS }).map((_, i) => {

//                 const filled = i / TOTAL_BARS < progress

//                 return (
//                     <motion.div
//                         key={i}
//                         animate={{
//                             backgroundColor: filled
//                                 ? "#22c55e"
//                                 : "#e5e7eb",
//                         }}
//                         className="w[3px] w-0.75 h-2.5 rounded-full"
//                     />
//                 )
//             })}

//         </div>
//     )
// }

// function Spinner({ completed, progress }: any) {

//     if (completed) {
//         return (
//             <motion.svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//             >
//                 <motion.path
//                     d="M5 13L9 17L19 7"
//                     fill="transparent"
//                     stroke="#22c55e"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     initial={{
//                         pathLength: 0,
//                     }}
//                     animate={{
//                         pathLength: 1,
//                     }}
//                     transition={{
//                         duration: 0.6,
//                     }}
//                 />
//             </motion.svg>
//         )
//     }

//     return (

//         <motion.div
//             animate={{
//                 rotate: 360,
//             }}
//             transition={{
//                 repeat: Infinity,
//                 duration: 1,
//                 ease: "linear",
//             }}
//             className="w-6 h-6 border-2 border-gray-300 border-t-green-500 rounded-full"
//         />
//     )
// }


///////////////////////////
///////////////////////////////

"use client"

import {
    motion,
    AnimatePresence,
    useAnimationControls,
} from "framer-motion"

import {
    useEffect,
    useState,
} from "react"


const LOAD_TIME = 4200

const USERS = [
    {
        name: "John Doe",
        role: "Backend Developer",
        image: "https://i.pravatar.cc/100?img=11",
        date: "Onboarded on Monday, August 2025",
    },
    {
        name: "Jane Smith",
        role: "Frontend Developer",
        image: "https://i.pravatar.cc/100?img=32",
        date: "Onboarded on Tuesday, August 2025",
    },
    {
        name: "Mike Johnson",
        role: "DevOps Engineer",
        image: "https://i.pravatar.cc/100?img=51",
        date: "Onboarded on Wednesday, August 2025",
    },
]

const BARS = 53

export default function OnboardingStack() {
    const [order, setOrder] = useState([0, 1, 2])
    const [progress, setProgress] = useState(0)
    const [complete, setComplete] = useState(false)

    const active = order[1]

    useEffect(() => {
        setProgress(0)
        setComplete(false)

        let start = performance.now()
        let frame: number

        const update = (now: number) => {
            const p = Math.min((now - start) / LOAD_TIME, 1)

            setProgress(p)

            if (p === 1) {
                setComplete(true)
                setTimeout(cycle, 900)
                return
            }

            frame = requestAnimationFrame(update)
        }

        frame = requestAnimationFrame(update)

        return () => cancelAnimationFrame(frame)
    }, [order])

    function cycle() {
        setOrder(prev => [prev[1], prev[2], prev[0],])
    }

    return (
        // <div className="w-105h-80 relativemx-auto relative w-full h-full flex items-center justify-center">
        // <div className="relative w-full max-w[420px] max-w-105 h[260px] h-65 md:h-70 md:h[280px]">
        <div
            className="relative w-full max-w[420px] max-w-105 h-45 h[180px] md:h-55 md:h[220px] flex items-center justify-center"
        >
            {order.map((i, position) => (
                <Card
                    key={i}
                    user={USERS[i]}
                    position={position}
                    active={position === 1}
                    progress={position === 1 ? progress : 0}
                    complete={position === 1 && complete}
                />
            ))}
        </div>
    )
}


function Card({
    user,
    position,
    active,
    progress,
    complete,
}: any) {
    // const scale = active ? 1 : 0.92
    const scale = active ? 1 : 0.85
    const y = position === 0 ? -70 : position === 1 ? 0 : 70

    const blur = active ? 0 : 4
    const opacity = active ? 1 : 0.7
    const zIndex = active ? 10 : 1

    return (
        <motion.div
            layout
            animate={{
                scale,
                y,
                // filter: `blur(${blur}px)`,
                opacity,
            }}
            transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
            }}
            style={{ zIndex }}
            className="absolute w-full rounded-lg border border-[#E6E8EC] bg-white shadow-[0_9px_21px_-5px_rgba(0,0,0,0.1)] p-4"
        >
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                    <img
                        src={user.image}
                        className="w-12h-12 w-10 h-10 rounded-full"
                    />

                    <div>
                        <div className="font-medium text-sm text-black">
                            {user.name}
                        </div>

                        <div className="text-xs text-[#9B9B9B]">
                            {user.role}
                        </div>
                    </div>
                </div>

                <SpinnerCheck
                    progress={progress}
                    complete={complete}
                />
            </div>

            {/* PROGRESS AREA */}
            <AnimatePresence>
                {!complete && active && (
                    <motion.div
                        // initial={{ height: 60, opacity: 1 }}
                        initial={{ maxHeight: 70, opacity: 1 }}
                        exit={{
                            // height: 0,
                            maxHeight: 0,
                            opacity: 0,
                        }}
                        transition={{ duration: 0.4, }}
                        className="overflow-hidden"
                    >
                        <div className="my-5">
                            <Progress progress={progress} />
                        </div>
                        <div className="text-xs text-[#9B9B9B] mt3">
                            {user.date}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function Progress({ progress }: any) {
    return (
        <div className="flex gap-0.5 justify-between mt4">
            {Array.from({ length: BARS }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        backgroundColor:
                            i / BARS <= progress
                                ? "#12B76A"
                                : "#DDFBE8",
                    }}
                    className="w-0.75 h2.5 h-3.5 rounded-full"
                />
            ))}
        </div>
    )
}


function SpinnerCheck({
    progress,
    complete,
}: any) {
    return (
        <div className="relative w-6 h-6">
            {/* SPINNER */}
            <motion.svg
                className="absolute"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                animate={{
                    rotate: complete
                        ? 180
                        : 360,
                    opacity: complete ? 0 : 1,
                }}
                transition={{
                    rotate: {
                        repeat: complete
                            ? 0
                            : Infinity,
                        duration: 1.2,
                        ease: "linear",
                    },
                    opacity: {
                        duration: 0.3,
                    },
                }}
            >
                {SPINNER_PATHS.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        stroke="#DBDCE0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                ))}
            </motion.svg>

            {/* CHECK */}

            <motion.svg
                width="24"
                height="24"
                viewBox="0 0 16 16"
                className="absolute"
            >
                <motion.path
                    d="M3.33594 9.33325L5.66927 11.6666L12.6693 4.33325"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{
                        pathLength: 0,
                        opacity: 0,
                    }}
                    animate={{
                        pathLength: complete ? 1 : 0,
                        opacity: complete ? 1 : 0,
                    }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                    }}
                />
            </motion.svg>
        </div>
    )
}



const SPINNER_PATHS = [
    "M12 3V6",
    "M12 18V21",
    "M21 12H18",
    "M6 12H3",
    "M18.3635 5.63672L16.2422 7.75804",
    "M7.76194 16.2422L5.64062 18.3635",
    "M18.3635 18.3635L16.2422 16.2422",
    "M7.76194 7.75804L5.64062 5.63672",
]


/////////////////////////////
///////////////////////////////////
////////////////////////////////

// "use client"

// import { motion } from "framer-motion"
// import { useEffect, useState } from "react"



// /* ---------------- CONFIG ---------------- */

// const LOAD_TIME = 4000
// const BARS = 53



// const USERS = [
//     {
//         name: "John Doe",
//         role: "Backend Developer",
//         image: "https://i.pravatar.cc/100?img=11",
//         date: "Onboarded on Monday, August 2025",
//     },
//     {
//         name: "Jane Smith",
//         role: "Frontend Developer",
//         image: "https://i.pravatar.cc/100?img=32",
//         date: "Onboarded on Tuesday, August 2025",
//     },
//     {
//         name: "Mike Johnson",
//         role: "DevOps Engineer",
//         image: "https://i.pravatar.cc/100?img=51",
//         date: "Onboarded on Wednesday, August 2025",
//     },
// ]


// export default function OnboardingStack() {
//     const [order, setOrder] = useState([0, 1, 2])
//     const [progress, setProgress] = useState(0)
//     const [isComplete, setIsComplete] = useState(false)


//     /* cycle order */
//     function cycle() {
//         setOrder(prev => [prev[1], prev[2], prev[0],])
//     }

//     /* loading animation */
//     useEffect(() => {
//         setProgress(0)
//         setIsComplete(false)

//         let start = performance.now()

//         let frame: number

//         const update = (now: number) => {
//             const p = Math.min((now - start) / LOAD_TIME, 1);

//             setProgress(p);

//             if (p === 1) {
//                 setIsComplete(true)
//                 setTimeout(cycle, 1000)
//                 return
//             }

//             frame = requestAnimationFrame(update);
//         }

//         frame = requestAnimationFrame(update);

//         return () => cancelAnimationFrame(frame);
//     }, [order])



//     return (
//         // <div className="relative w-105 h-65 mx-auto">
//         <div className="relative w-105 h-65 mx-auto flexh-fullw-fullitems-centerjustify-center">
//             {order.map((userIndex, position) => {
//                 const active = position === 1

//                 return (
//                     <Card
//                         key={userIndex}
//                         user={USERS[userIndex]}
//                         position={position}
//                         active={active}
//                         progress={active ? progress : 0}
//                         complete={active && isComplete}
//                     />
//                 )
//             })}
//         </div>
//     )
// }



// function Card({
//     user,
//     position,
//     active,
//     progress,
//     complete,
// }: any) {
//     const positions = [{ y: -60, scale: 0.85, zIndex: 1 }, { y: 0, scale: 1, zIndex: 3 }, { y: 60, scale: 0.85, zIndex: 2 },]

//     const pos = positions[position]
//     const showProgress = active && !complete

//     return (
//         <motion.div
//             layout
//             animate={{
//                 y: pos.y,
//                 scale: pos.scale,
//             }}
//             transition={{
//                 layout: {
//                     duration: 0.6,
//                     ease: [0.22, 1, 0.36, 1],
//                 },
//             }}
//             style={{ zIndex: pos.zIndex }}
//             className="absolute left-0 right-0 w-full bg-white border shadow-xl rounded-2xl p-5"
//         >
//             {/* HEADER */}
//             <div className="flex justify-between items-center">
//                 <div className="flex gap-3 items-center">
//                     <img
//                         src={user.image}
//                         className="w-12 h-12 rounded-full"
//                     />

//                     <div>
//                         <div className="font-semibold">
//                             {user.name}
//                         </div>

//                         <div className="text-sm text-neutral-500">
//                             {user.role}
//                         </div>
//                     </div>
//                 </div>

//                 <SpinnerCheck
//                     progress={progress}
//                     complete={complete}
//                 />
//             </div>


//             {/* PROGRESS AREA */}
//             <motion.div
//                 animate={{
//                     height: showProgress ? 60 : 0,
//                     opacity: showProgress ? 1 : 0,
//                 }}
//                 transition={{ duration: 0.4 }}
//                 className="overflow-hidden"
//             >
//                 <Progress progress={progress} />

//                 <div className="text-xs text-neutral-400 mt-3">
//                     {user.date}
//                 </div>
//             </motion.div>
//         </motion.div>
//     )
// }


// function Progress({ progress }: any) {
//     return (
//         <div className="flex gap-0.5 justify-between mt4">
//             {Array.from({
//                 length: BARS,
//             }).map((_, i) => (
//                 <motion.div
//                     key={i}
//                     animate={{
//                         backgroundColor: i / BARS <= progress ? "#12B76A" : "#DDFBE8",
//                     }}
//                     className="w-0.75 h-3.5 rounded-full"
//                 />
//             ))}
//         </div>
//     )
// }

// function SpinnerCheck({
//     progress,
//     complete,
// }: any) {
//     return (
//         <div className="relative w-6 h-6">
//             {/* spinner */}
//             <motion.svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 className="absolute"
//                 animate={{
//                     rotate: complete ? 180 : 360,
//                     opacity: complete ? 0 : 1,
//                 }}

//                 transition={{
//                     rotate: {
//                         repeat: complete ? 0 : Infinity,
//                         duration: 1.2,
//                         ease: "linear",
//                     },
//                     opacity: {
//                         duration: 0.3,
//                     },
//                 }}
//             >
//                 {SPINNER_PATHS.map((d, i) => (
//                     <path
//                         key={i}
//                         d={d}
//                         stroke="#DBDCE0"
//                         strokeWidth="1.5"
//                         strokeLinecap="round"
//                     />
//                 ))}
//             </motion.svg>

//             {/* checkmark */}
//             <motion.svg
//                 width="24"
//                 height="24"
//                 viewBox="0 0 16 16"
//                 className="absolute"
//             >
//                 <motion.path
//                     d="M3.33594 9.33325L5.66927 11.6666L12.6693 4.33325"
//                     stroke="#22c55e"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     fill="none"
//                     initial={{
//                         pathLength: 0,
//                         opacity: 0,
//                     }}
//                     animate={{
//                         pathLength: complete ? 1 : 0,
//                         opacity: complete ? 1 : 0,
//                     }}
//                     transition={{
//                         duration: 0.6,
//                     }}
//                 />
//             </motion.svg>
//         </div>
//     )
// }

// const SPINNER_PATHS = [
//     "M12 3V6",
//     "M12 18V21",
//     "M21 12H18",
//     "M6 12H3",
//     "M18.3635 5.63672L16.2422 7.75804",
//     "M7.76194 16.2422L5.64062 18.3635",
//     "M18.3635 18.3635L16.2422 16.2422",
//     "M7.76194 7.75804L5.64062 5.63672",
// ]
