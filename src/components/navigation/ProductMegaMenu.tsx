"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image1 from "../../../public/landingpage/onboardingIcon.svg";
import Image2 from "../../../public/landingpage/profile-circle.svg";
import Image3 from "../../../public/landingpage/credit-card.svg";
import Image from 'next/image';

const products = [
    {
        title: 'Onboarding',
        description: 'We make it easy for companies to onboard talent globally from contracts to compliance.',
        href: '/product-one',
        icon: Image1,
    },
    {
        title: 'Recruitment',
        description: 'We help companies find and hire top African talent quickly, with vetted candidates.',
        href: '/product-two',
        icon: Image2,
    },
    {
        title: 'Payroll',
        description: 'Pay your team instantly in stablecoins with low fees, no borders, and zero delays.',
        href: '/product-three',
        icon: Image3,
    },
];

// export default function ProductMegaMenu() {
//     const [open, setOpen] = useState(false);

//     return (
//         <div
//             className=""
//             onMouseEnter={() => setOpen(true)}
//             onMouseLeave={() => setOpen(false)}
//         >
//             {/* Trigger */}
//             <button className="font-medium hover:text-primary">
//                 Product
//             </button>

//             <AnimatePresence>
//                 {open && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: 8 }}
//                         transition={{ duration: 0.2, ease: 'easeOut' }}
//                         className="absolute left-0 right-0 topfull wscreen"
//                     >
//                         <div className="bg-red-200shadow-lg">
//                             <div className="mx-auto grid max-w-7xl grid-cols-3 gap-6 px-6 py-8">
//                                 {products.map((item) => (
//                                     <Link
//                                         key={item.title}
//                                         href={item.href}
//                                         className="rounded-lg border p-6 transition hover:bg-gray-100"
//                                     >
//                                         <h3 className="font-semibold">{item.title}</h3>
//                                         <p className="mt-2 text-sm text-gray-600">
//                                             {item.description}
//                                         </p>
//                                     </Link>
//                                 ))}
//                             </div>
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }

export default function ProductMegaMenu() {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="h-full"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* Trigger */}
            <button className="px2 font-normal text-black/70 hover:text-black w-full h-full">
                Products
            </button>


            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute left-0 right-0 top-full z-50"
                    >
                        {/* <div className="bg-red-200shadow-lg"> */}
                        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-8 py4">
                            {products.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group rounded-lg p-6 bg-[#E7E9F3] hover:bg-[#0052FF] transition duration-700 "
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#0052FF] group-hover:bg-[#3D78F6] py-2 px-2.5 rounded transition duration-700">
                                            <Image src={item.icon} alt={`${item.title}-icon`} height={30} width={30} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl text-black group-hover:text-white font-medium transition duration-700">{item.title}</h3>
                                            <p className="text-sm text-[#717171] group-hover:text-white transition duration-700">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {/* </div> */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
