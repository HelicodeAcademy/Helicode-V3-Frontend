// import Image from "next/image";
// import React from "react";

// export default function SupporterLogos() {
//   return (
//     <section id="supporter-logos" className="w-full border-b pt-4 pb-8 lg:py-0">
//       <div className="max-w-7xl mx-auto w-full flex flex-col items-center lg:flex-row lg:divide-x px-4 md:px-8   py-12md:py-16">
//         <div className="flex h-full w-full lg:w-fit">
//           <span className="text-[#AAAAAA] mx-auto py-7 h-full font-sans text-center text-2xl lg:text-[28px] leading-tight font-semibold lg:mx-0 lg:pr-16 lg:text-start">
//             <span className="text-[#0052FF]">Supported by </span> the
//             <br className="hidden lg:block" /> world&apos;s best.
//           </span>
//         </div>

//         <div className="flex h-full grow flex-wrap gap-4 lg:flex-row lg:gap-0">
//           <div className="flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40">
//             <div className="relative h-16 w-32 lg:w-36">
//               <Image
//                 src="/landingpage/Stellar-Logo.svg"
//                 alt="Lisk-logo"
//                 width={120}
//                 height={43}
//                 className="absolute inset-0 h-full w-full text-transparent object-contain select-none "
//               />
//             </div>
//           </div>
//           <div className="flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40">
//             <div className="relative h-full w-24 lg:w-28 lg:w36">
//               <Image
//                 src="/landingpage/Lisk.png"
//                 alt="Lisk-logo"
//                 width={86}
//                 height={30}
//                 className="absolute inset-0 h-full w-full text-transparent object-contain select-none "
//               />
//             </div>
//           </div>

//           <div className="flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40">
//             <div className="relative h-full w-24 lg:w-28 lg:w36">
//               <Image
//                 src="/landingpage/yellow_card.svg"
//                 alt="Lisk-logo"
//                 width={113}
//                 height={26}
//                 className="absolute inset-0 h-full w-full text-transparent object-contain select-none "
//               />
//             </div>
//           </div>

//           <div className="flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40">
//             <div className="relative h-16 w-32 lg:w-36">
//               <Image
//                 src="/landingpage/Coinsub.svg"
//                 alt="Lisk-logo"
//                 width={146}
//                 height={26}
//                 className="absolute inset-0 h-full w-full text-transparent object-contain select-none "
//               />
//             </div>
//           </div>
//           <div className="flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40">
//             <div className="relative h-16 w-32 lg:w-36">
//               <Image
//                 src="/landingpage/mest-Logo.svg"
//                 alt="Lisk-logo"
//                 width={146}
//                 height={26}
//                 className="absolute inset-0 h-full w-full text-transparent object-contain select-none "
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import Image from "next/image";
import React from "react";

const logos = [
  {
    src: "/landingpage/Stellar-Logo.svg",
    alt: "Stellar logo",
    width: 120,
    height: 43,
  },
  { src: "/landingpage/Lisk.png", alt: "Lisk logo", width: 86, height: 30 },
  {
    src: "/landingpage/yellow_card.svg",
    alt: "Yellow Card logo",
    width: 113,
    height: 26,
  },
  {
    src: "/landingpage/Coinsub.svg",
    alt: "Coinsub logo",
    width: 146,
    height: 26,
  },
  {
    src: "/landingpage/mest-Logo.svg",
    alt: "MEST logo",
    width: 146,
    height: 26,
  },
  {
    src: "/landingpage/Quidax.svg",
    alt: "Quidax logo",
    width: 146,
    height: 26,
  },
];

export default function SupporterLogos() {
  return (
    <section id="supporter-logos" className="w-full border-b">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row lg:divide-x">
        {/* Static label — untouched */}
        <div className="flex lg:shrink-0">
          <span className="text-[#AAAAAA] mx-auto py-7 h-full font-sans text-center text-2xl lg:text-[28px] leading-tight font-semibold lg:mx-0 lg:pr-16 lg:text-start px-4 md:px-8">
            <span className="text-[#0052FF]">Supported by </span> the
            <br className="hidden lg:block" /> world&apos;s best.
          </span>
        </div>

        {/* Animated logos */}
        <div className="relative flex-1 min-w-0 overflow-hidden py-4 lg:py-0">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10 bg-linear-to-r from-white to-transparent dark:from-black" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10 bg-linear-to-l from-white to-transparent dark:from-black" />

          {/* Marquee track — duplicate logos for seamless loop */}
          <div className="flex w-max animate-marquee hover:paused lg:mt-4">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center justify-center h-16 lg:h-24 px-6 lg:px-8 min-w-30 lg:min-w-40"
              >
                <div className="relative h-8 lg:h-10 w-24 lg:w-32">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    className="absolute inset-0 h-full w-full object-contain select-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
