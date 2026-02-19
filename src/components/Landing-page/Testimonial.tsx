"use client"

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";


const testimonials = [
    {
        name: "Ayodeji Emmanuel",
        role: "Co-founder & CEO",
        accent: "#0052FF",
        bg: "#EFF4FF",
    },
    {
        name: "Ayodeji Emmanuel",
        role: "Co-founder & CEO",
        accent: "#FF6900",
        bg: "#FFF0E6",
    },
    {
        name: "Ayodeji Emmanuel",
        role: "Co-founder & CEO",
        accent: "#FF349E",
        bg: "#FFEEF7",
    },
];


export default function Testimonial() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        updateScrollState();
        el.addEventListener("scroll", updateScrollState, { passive: true });

        return () => el.removeEventListener("scroll", updateScrollState);
    }, []);


    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };


    const scrollByCard = (direction = "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const card = container.querySelector("[data-card]") as HTMLElement;

        if (!card) return;

        const scrollAmount = card.offsetWidth + 16; // card width + gap
        container.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
        });
    };

    // const scrollByCard = (direction: "left" | "right") => {
    //     const el = scrollRef.current;
    //     if (!el) return;

    //     const card = el.querySelector("[data-card]") as HTMLElement;
    //     if (!card) return;

    //     const gap = 16; // must match gap-4
    //     const amount = card.offsetWidth + gap;

    //     el.scrollBy({
    //         left: direction === "right" ? amount : -amount,
    //         behavior: "smooth",
    //     });
    // };


    return (
        <section
            className="w-full border-b border-[#ECECEC] bg-white py-8.5md:py-17 py-12 md:py-16 lg:py-24"
            style={{
                backgroundImage:
                    'radial-gradient(rgba(0, 0, 0, 0.1) 0.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 bg-red300">
                <div className="flex flex-col gap-12">
                    {/* Heading */}
                    <div className='max-w-2xl flex gap-4 flex-col lg:flex-row lg:items-end'>
                        <div className="flex grow flex-col gap-3">
                            <h2 className='font-bold text-3xl sm:text-5xl lg:text-[52px]'>
                                Trusted by the world&apos;s largest companies
                            </h2>
                        </div>

                        {/* Mobile arrows */}
                        <div className="flex flex-row items-center gap-2 lg:hidden">
                            <button
                                onClick={() => scrollByCard("left")}
                                disabled={!canScrollLeft}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm h-10 w-10 bg-white hover:bg-white/70 border shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Scroll left"
                            >
                                <ArrowLeft className="size-5 shrink-0 pointer-events-none" />
                            </button>

                            <button
                                onClick={() => scrollByCard("right")}
                                disabled={!canScrollRight}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm h-10 w-10 bg-white hover:bg-white/70 border shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Scroll right"
                            >
                                <ArrowRight className="size-5 shrink-0 pointer-events-none" />
                            </button>
                        </div>
                    </div>


                    {/* Scroll area */}
                    <div className="relative w-full  -mx-4md:-mx-8">
                        <div ref={scrollRef} className="overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory">
                            <div
                                // className="flex mx-auto max-w-7xl flex-nowrap flex1 gap-2 md:gap-4 bg-amber-100"
                                className="flex gap-4   px-4md:px-8"
                            >
                                {/* className="min-w-0 shrink-0 grow-0 snap-start flex basis-[92%] sm:basis-[64%] md:basis-[48%] lg:basis-[32%] pl-4 md:pl-8 xl:pl-0" */}
                                {testimonials.map((testimonial, i) => (
                                    <div key={i} data-card className="shrink-0 snap-start basis-[90%] sm:basis-[70%] md:basis-[48%] lg:basis-[32%]">
                                        <div
                                            className="relative flex h-104lg:h-112 w-full overflowclip overflow-hidden rounded-tr-4xl pb-3 pl-3"
                                            style={{
                                                "--border-bg": testimonial.accent,
                                                backgroundColor: testimonial.bg,
                                            } as React.CSSProperties}
                                        >
                                            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-[3px] border-b-[3px] border-(--border-bg) border-l-[#0052FF]border-[#0052FF]" style={{ borderBottomLeftRadius: "2px" }}></div>

                                            <div className="bg-[#F8F8F8] relative flex grow flex-col gap-10 p-6">
                                                <div className="size12">
                                                    <Image src="/landingpage/Lisk-logo.png" alt="Lisk-logo" width={81} height={28} />
                                                </div>
                                                <div>
                                                    <p className="text-[#697282] font-normal text-sm">{testimonial.role}</p>
                                                    <h5 className="font-medium text-black text-lg">{testimonial.name}</h5>
                                                </div>

                                                <div className="space-y-4">
                                                    <p className="font-medium">
                                                        Vorem ipsum dolor sit amet, consectetur adipiscing
                                                        elit. Nunc vulputate libero et velit interdum.
                                                    </p>
                                                    <p className="font-medium">
                                                        Class aptent taciti sociosqu ad litora torquent per
                                                        conubia nostra, per inceptos himenaeos.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}






                                {/* <div className="shrink-0 snap-start basis-[90%] sm:basis-[70%] md:basis-[48%] lg:basis-[32%]">
                                    <div
                                        className="relative flex h-104 w-full overflow-clip rounded-tr-4xl pb-3 pl-3 lg:h-112 bg-[#EFF4FF]"
                                    // style={{
                                    //     "--accent": testimonial.accent,
                                    //     backgroundColor: testimonial.bg,
                                    // }}
                                    >
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-[3px] border-b-[3px] border-[color:var(--accent)] border-l-[#0052FF]border-[#0052FF]" style={{ borderBottomLeftRadius: "2px" }}></div>

                                        <div className="bg-[#F8F8F8] relative flex grow flex-col gap-10 p-6">
                                            <div>Logo here</div>
                                            <div>
                                                <p className="text-[#697282] font-normal text-sm">Co-founder & CEO</p>
                                                <h5 className="font-medium text-black text-lg">Ayodeji Emmanuel</h5>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="font-medium">
                                                    Vorem ipsum dolor sit amet, consectetur adipiscing
                                                    elit. Nunc vulputate libero et velit interdum.
                                                </p>
                                                <p className="font-medium">
                                                    Class aptent taciti sociosqu ad litora torquent per
                                                    conubia nostra, per inceptos himenaeos.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}


                                {/* <div className="min-w-0 shrink-0 grow-0 snap-start flex basis-[92%] sm:basis-[64%] md:basis-[48%] lg:basis-[32%] pl-4 md:pl-8 xl:pl-0">
                                    <div className="relative flex h-104 w-full overflow-clip rounded-tr-4xl pb-3 pl-3 lg:h-112 bg-[#FFF0E6]">
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-[3px] border-l-[#FF6900] border-b-[3px] border-[#FF6900]" style={{ borderBottomLeftRadius: "2px" }}></div>

                                        <div className="bg-[#F8F8F8] relative flex grow flex-col gap-10 p-6">
                                            <div>Logo here</div>
                                            <div>
                                                <p className="text-[#697282] font-normal text-sm">Co-founder & CEO</p>
                                                <h5 className="font-medium text-black text-lg">Ayodeji Emmanuel</h5>
                                            </div>
                                            <div>
                                                <p className="font-medium">Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</p>
                                                <br />
                                                <p className="font-medium">Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="min-w-0 shrink-0 grow-0 snap-start flex basis-[92%] sm:basis-[64%] md:basis-[48%] lg:basis-[32%] pl-4 md:pl-8 xl:pl-0">
                                    <div className="relative flex h-104 w-full overflow-clip rounded-tr-4xl pb-3 pl-3 lg:h-112 bg-[#FFEEF7]">
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-[3px] border-l-[#FF349E] border-b-[3px] border-[#FF349E]" style={{ borderBottomLeftRadius: "2px" }}></div>

                                        <div className="bg-[#F8F8F8] relative flex grow flex-col gap-10 p-6">
                                            <div>Logo here</div>
                                            <div>
                                                <p className="text-[#697282] font-normal text-sm">Co-founder & CEO</p>
                                                <h5 className="font-medium text-black text-lg">Ayodeji Emmanuel</h5>
                                            </div>
                                            <div>
                                                <p className="font-medium">Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</p>
                                                <br />
                                                <p className="font-medium">Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

// export default function Testimonial() {
//     return (
//         <section
//             className="w-full border-b border-[#ECECEC] bg-white py-12 md:py-16 lg:py-24"
//             style={{
//                 backgroundImage:
//                     "radial-gradient(rgba(0, 0, 0, 0.2) 0.5px, transparent 1.5px)",
//                 backgroundSize: "16px 16px",
//             }}
//         >
//             <div className="mx-auto max-w-7xl px-4 md:px-8">
//                 <div className="flex flex-col gap-12">
//                     {/* Heading */}
//                     <div className="max-w-2xl">
//                         <h2 className="font-bold text-3xl sm:text-5xl lg:text-[52px]">
//                             Trusted by the world&apos;s largest companies
//                         </h2>
//                     </div>

//                     {/* Scroll area */}
//                     <div className="relative -mx-4 md:-mx-8">
//                         <div className="overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory">
//                             <div className="flex gap-4 px-4 md:px-8">
//                                 {[1, 2, 3].map((_, i) => (
//                                     <div
//                                         key={i}
//                                         className="
//                       shrink-0 snap-start
//                       basis-[90%]
//                       sm:basis-[70%]
//                       md:basis-[48%]
//                       lg:basis-[32%]
//                     "
//                                     >
//                                         <div className="relative flex h-104 w-full overflow-clip rounded-tr-4xl bg-[#EFF4FF] pb-3 pl-3 lg:h-112">
//                                             <div
//                                                 className="absolute bottom-0 left-0 h-3 w-3 border-b-[3px] border-l-[3px] border-[#0052FF]"
//                                                 style={{ borderBottomLeftRadius: "2px" }}
//                                             />

//                                             <div className="relative flex grow flex-col gap-10 bg-[#F8F8F8] p-6">
//                                                 <div>Logo here</div>

//                                                 <div>
//                                                     <p className="text-sm font-normal text-[#697282]">
//                                                         Co-founder & CEO
//                                                     </p>
//                                                     <h5 className="text-lg font-medium text-black">
//                                                         Ayodeji Emmanuel
//                                                     </h5>
//                                                 </div>

//                                                 <div className="space-y-4">
//                                                     <p className="font-medium">
//                                                         Vorem ipsum dolor sit amet, consectetur adipiscing
//                                                         elit. Nunc vulputate libero et velit interdum.
//                                                     </p>
//                                                     <p className="font-medium">
//                                                         Class aptent taciti sociosqu ad litora torquent per
//                                                         conubia nostra, per inceptos himenaeos.
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// }

