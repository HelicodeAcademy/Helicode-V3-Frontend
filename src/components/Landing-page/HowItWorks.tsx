"use client";

import Image from 'next/image'
import React from 'react';
import { motion } from 'motion/react';
import WalletIllustration from './WalletIllustration';
import WalletCardIllustration from './WalletCardIllustration';

export default function HowItWorks() {
    return (
        <section className='border-b border-[#ECECEC] py-8.5md:py-17 py-12 md:py-16 lg:py-24'>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col gap-12">
                    <div className='flexgap-4flex-colmd:flex-rowmd:items-end max-w-xl'>
                        <div className='flex flex-col gap-1'>
                            <p className='font-normal text-base text-[#697282]'>Get started with three simple steps</p>
                            <h2 className='font-bold text-3xl sm:text-[44px]'>How It Works</h2>
                        </div>
                    </div>
                    <div className='w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='flex-1 space-y-6'>
                            <div className="h-92.5">
                                <div className="border border-[#E6E8EC] flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl gap-2px4p-7.5">

                                    <div className="relative flex items-center gap-4 animate-slide-in-left mr-[30%]">
                                        <div className='absolute -left-10 flex justify-start'></div>
                                        <div className='flex w-55 items-center gap-2.5 rounded-lg border border-[#E6E8EC] bg-white p-2.5 shadow-[0_0_10px_2px_rgba(0,0,0,0.05)]'>

                                            <div className="relative h-10 w-11.5 bg-[#FDBEDF] rounded-lg">
                                                <Image src="/landingpage/HIW-img1.png" alt='img01' width={46} height={41} className='absoluteinset-0 h-full w-full ' quality={100} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1">
                                                <h5 className="font-medium text-[#474747]">Henry Doe</h5>
                                                <p className="text-xs text-[#9B9B9B]">Backend Developer</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <svg
                                        width="162"
                                        height="59"
                                        viewBox="0 0 162 59"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <motion.path
                                            d="M0.5 0V19.5C0.5 22.8137 3.18629 25.5 6.5 25.5H155.5C158.814 25.5 161.5 28.1863 161.5 31.5V58.5"
                                            stroke="url(#gradient)"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                        />

                                        <defs>
                                            <motion.linearGradient
                                                id="gradient"
                                                gradientUnits="userSpaceOnUse"
                                                x1="-162"
                                                y1="29.5"
                                                x2="0"
                                                y2="29.5"
                                                animate={{
                                                    x1: [-162, 162],
                                                    x2: [0, 324],
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    ease: "linear",
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <stop offset="0%" stopColor="#E6E8EC" />
                                                <stop offset="50%" stopColor="#0052FF" />
                                                <stop offset="100%" stopColor="#E6E8EC" />
                                            </motion.linearGradient>
                                        </defs>
                                    </svg> */}

                                    {/* #FB439D */}
                                    {/* <svg className="animate-fade-in pointer-events-none h-10 w-37.25" width="149" height="40" viewBox="0 0 149 40" fill="none"><defs><mask id="comet-mask-youtube-to-blog"><rect x="-26" y="-2" width="201" height="44" fill="black"></rect><rect width="25" height="44" y="-2" fill="url(#comet-gradient-youtube-to-blog)"><animateTransform attributeName="transform" type="translate" values="-26 0;150 0;150 0" dur="2.5s" repeatCount="indefinite"></animateTransform></rect></mask><linearGradient id="comet-gradient-youtube-to-blog" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="white" stopOpacity="0"></stop><stop offset="50%" stopColor="white" stopOpacity="0.5"></stop><stop offset="100%" stop-color="white" stopOpacity="1"></stop></linearGradient></defs><path d="M1 0V19.3333C1 21.5425 2.79086 23.3333 5 23.3333H144C146.209 23.3333 148 25.1242 148 27.3333V40" fill="none" strokeWidth="1.5" strokeLinecap="round" stroke="var(--border)"></path><path d="M1 0V19.3333C1 21.5425 2.79086 23.3333 5 23.3333H144C146.209 23.3333 148 25.1242 148 27.3333V40" fill="none" strokeWidth="1.5" strokeLinecap="round" stroke="#0052FF" mask="url(#comet-mask-youtube-to-blog)"></path></svg> */}

                                    <svg
                                        // className="animate-fade-in pointer-events-none h-10 w-37.25"
                                        width="162"
                                        height="59"
                                        viewBox="0 0 162 59"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M0.5 0V19.5C0.5 22.8137 3.18629 25.5 6.5 25.5H155.5C158.814 25.5 161.5 28.1863 161.5 31.5V58.5"
                                            stroke="url(#movingGradient)"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                        />

                                        <defs>
                                            <linearGradient
                                                id="movingGradient"
                                                gradientUnits="userSpaceOnUse"
                                                x1="-162"
                                                y1="29.5"
                                                x2="0"
                                                y2="29.5"
                                            >
                                                <stop offset="20%" stopColor="#E6E8EC" />
                                                <stop offset="40%" stopColor="#0052FF" />
                                                <stop offset="40%" stopColor="#E6E8EC" />

                                                <animate
                                                    attributeName="x1"
                                                    from="-162"
                                                    to="162"
                                                    dur="2.5s"
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="x2"
                                                    from="0"
                                                    to="324"
                                                    dur="2.5s"
                                                    repeatCount="indefinite"
                                                />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    <div className="relative flex items-center gap-4 animate-slide-in-left ml-[30%]">
                                        <div className='absolute -left-10 flex justify-start'>
                                            <svg className="h-6w-6 animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 3V6" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M12 18V21" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M21 12H18" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M6 12H3" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M18.3635 5.63672L16.2422 7.75804" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M7.76194 16.2422L5.64062 18.3635" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M18.3635 18.3635L16.2422 16.2422" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M7.76194 7.75804L5.64062 5.63672" stroke="#DBDCE0" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </div>

                                        <div className='flex w-55 items-center gap-2.5 rounded-lg border-[0.5px] border-[#0052FF] bg-white p-2.5 outline-5 outline-[#E7EFFF] shadow-[0_0_10px_2px_rgba(0,0,0,0.05)]'>
                                            <div className="relative h-10 w-11.5 bg-[#FFD4B7] rounded-lg">
                                                <Image src="/landingpage/HIW-img2.png" alt='img02' width={46} height={41} className='absoluteinset-0 h-full w-full' quality={100} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1">
                                                <h5 className="font-medium text-[#474747]">Henry Doe</h5>
                                                <p className="text-xs text-[#9B9B9B]">Product Designer</p>
                                            </div>
                                        </div>
                                    </div>

                                    <svg
                                        width="162"
                                        height="59"
                                        viewBox="0 0 162 59"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M161.5 0V19.5C161.5 22.8137 158.814 25.5 155.5 25.5H6.5C3.18629 25.5 0.5 28.1863 0.5 31.5V58.5"
                                            stroke="url(#movingGradientReverse)"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                        />

                                        <defs>
                                            <linearGradient
                                                id="movingGradientReverse"
                                                gradientUnits="userSpaceOnUse"
                                                x1="324"
                                                y1="29.5"
                                                x2="162"
                                                y2="29.5"
                                            >
                                                <stop offset="20%" stopColor="#E6E8EC" />
                                                <stop offset="40%" stopColor="#0052FF" />
                                                <stop offset="40%" stopColor="#E6E8EC" />

                                                <animate
                                                    attributeName="x1"
                                                    from="324"
                                                    to="0"
                                                    dur="2.5s"
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="x2"
                                                    from="162"
                                                    to="-162"
                                                    dur="2.5s"
                                                    repeatCount="indefinite"
                                                />
                                            </linearGradient>
                                        </defs>
                                    </svg>


                                    <div className="relative flex items-center gap-4 animate-slide-in-left mr-[20%]">
                                        <div className='absolute -left-10 flex justify-start'></div>
                                        <div className='flex w-55 items-center gap-2.5 rounded-lg border border-[#E6E8EC] bg-white p-2.5 shadow-[0_0_10px_2px_rgba(0,0,0,0.05)]'>

                                            <div className="relative h-10 w-11.5 bg-[#FFD2CF] rounded-lg">
                                                <Image src="/landingpage/HIW-img3.png" alt='img03' width={46} height={41} className='absoluteinset-0 h-full w-full' quality={100} />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1">
                                                <h5 className="font-medium text-[#474747]">Henry Doe</h5>
                                                <p className="text-xs text-[#9B9B9B]">Growth Marketer</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="font-bold text-xl sm:text-2xl md:text-3xl">Hire</h4>
                                <p className="text-[#A0A0A0]">Hire talent through Helicode or bring your own team</p>
                            </div>
                        </div>

                        <div className='flex-1 space-y-6'>
                            <div className="h-92.5">
                                <div className="border border-[#E6E8EC] bg[#0052FF] flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl px-4">
                                    {/* <Image src="/landingpage/HIW-illus.svg" alt="HIW-illustration" width={306} height={230} loading="eager" /> */}
                                    <WalletIllustration />
                                    {/* <WalletCardIllustration /> */}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="font-bold text-xl sm:text-2xl md:text-3xl">Fund</h4>
                                <p className="text-[#A0A0A0]">Fund payroll via stablecoins or fiat</p>
                            </div>
                        </div>

                        {/* PAY */}

                        <div className='flex-1 space-y-6'>
                            <div className="h-92.5">
                                <div className="border border-[#E6E8EC] flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl gap-2px-4">

                                    <div className='bg-amber200 bg-white w-75 wfull flex items-center justify-between py-2.5 px-3 p4 rounded-lg border border-[#E6E8EC]'>
                                        {/* left */}
                                        <div className="flex items-center gap-2.5">
                                            {/* Image */}
                                            <div className="w-14 h-12 rounded-md bg-[conic-gradient(from_25deg,#0052FF,#C3D6FF)]" />

                                            {/* Texts */}
                                            <div>
                                                <h5 className="text-xs font-medium text-black">Hacken Inc.</h5>
                                                <p className="text-[#A0A0A0] text-[10px] font-medium">Engineering</p>
                                            </div>
                                        </div>

                                        {/* Right */}
                                        <div className="bg-[#E3ECFF] flex items-center gap-1 px-1 py-0.5 rounded-full ml-auto">
                                            <span>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7 14C7.91925 14 8.8295 13.8189 9.67878 13.4672C10.5281 13.1154 11.2997 12.5998 11.9497 11.9497C12.5998 11.2997 13.1154 10.5281 13.4672 9.67878C13.8189 8.8295 14 7.91925 14 7C14 6.08075 13.8189 5.1705 13.4672 4.32122C13.1154 3.47194 12.5998 2.70026 11.9497 2.05025C11.2997 1.40024 10.5281 0.884626 9.67878 0.532843C8.8295 0.18106 7.91925 -1.36979e-08 7 0C5.14348 2.76642e-08 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 8.85652 0.737498 10.637 2.05025 11.9497C3.36301 13.2625 5.14348 14 7 14Z" fill="#0B53BF" />
                                                    <path d="M8.26 1.90552V2.80696C9.16049 3.07972 9.94942 3.63479 10.5103 4.39022C11.0712 5.14564 11.3744 6.0614 11.375 7.0023C11.3744 7.94319 11.0712 8.85895 10.5103 9.61438C9.94942 10.3698 9.16049 10.9249 8.26 11.1976V12.0999C9.39973 11.8195 10.4124 11.1648 11.1358 10.2405C11.8593 9.31627 12.2516 8.176 12.25 7.0023C12.2514 5.82873 11.859 4.68863 11.1356 3.76455C10.4122 2.84046 9.3996 2.18585 8.26 1.90552ZM2.625 7.0023C2.62564 6.0614 2.92878 5.14564 3.48968 4.39022C4.05058 3.63479 4.83951 3.07972 5.74 2.80696V1.90552C4.60041 2.18585 3.58784 2.84046 2.86442 3.76455C2.14101 4.68863 1.74859 5.82873 1.75 7.0023C1.74859 8.17586 2.14101 9.31596 2.86442 10.24C3.58784 11.1641 4.60041 11.8187 5.74 12.0991V11.1976C4.83886 10.926 4.04923 10.3712 3.48815 9.61551C2.92707 8.85984 2.6244 7.94349 2.625 7.0023Z" fill="white" />
                                                    <path d="M8.88054 7.97841C8.88054 6.18874 6.07587 6.92374 6.07587 5.93519C6.07587 5.58052 6.36054 5.35341 6.90265 5.35341C7.55054 5.35341 7.77376 5.66841 7.84376 6.0923H8.73588C8.65654 5.29585 8.19921 4.79341 7.43699 4.6433V3.94019H6.56199V4.61841C5.72587 4.72496 5.20087 5.21107 5.20087 5.93519C5.20087 7.73341 8.00943 7.05907 8.00943 8.03052C8.00943 8.39763 7.65554 8.64263 7.05588 8.64263C6.27265 8.64263 6.01443 8.2973 5.91876 7.82052H5.04688C5.10365 8.69319 5.6411 9.23841 6.56121 9.3753V10.0644H7.43621V9.38385C8.33299 9.26796 8.88054 8.74607 8.88054 7.97841Z" fill="white" />
                                                </svg>
                                            </span>
                                            <span className="font-medium text-xs text-[#0052FF]">USDC</span>
                                        </div>
                                    </div>


                                    <svg
                                        width="152"
                                        height="78"
                                        viewBox="0 0 152 78"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M135.5 0.00610352L135.072 35.049C135.032 38.3339 132.358 40.9758 129.073 40.9758H6.5C3.18629 40.9758 0.5 43.6621 0.5 46.9758V78.0061"
                                            stroke="url(#movingGradientRTL)"
                                            strokeWidth="1.5"
                                            strokeLinejoin="round"
                                        />

                                        <defs>
                                            <linearGradient
                                                id="movingGradientRTL"
                                                gradientUnits="userSpaceOnUse"
                                                x1="304"
                                                y1="39"
                                                x2="152"
                                                y2="39"
                                            >
                                                <stop offset="20%" stopColor="#E6E8EC" />
                                                <stop offset="40%" stopColor="#0052FF" />
                                                <stop offset="40%" stopColor="#E6E8EC" />

                                                <animate
                                                    attributeName="x1"
                                                    from="304"
                                                    to="0"
                                                    dur="2.8s"
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="x2"
                                                    from="152"
                                                    to="-152"
                                                    dur="2.8s"
                                                    repeatCount="indefinite"
                                                />
                                            </linearGradient>
                                        </defs>
                                    </svg>


                                    <div className="space-y-3">
                                        <div className='bg-amber200 bg-white w-75 wfull flex items-center justify-between py-2.5 px-3 p4 rounded-lg border border-[#E6E8EC]'>
                                            {/* left */}
                                            <div className="flex items-center gap-2.5">
                                                {/* Image */}

                                                <div className="relative">
                                                    <div className="relative w-10 h-10 bg-[#E2D8FB] rounded-full">
                                                        <Image src="/landingpage/HIW-img4.png" alt='img04' width={46} height={41} className='absoluteinset-0 h-full w-full' quality={100} />
                                                    </div>
                                                    <div className="absolute bottom-0 -right-1 border border-white h-4 w-4 rounded-full">
                                                        <Image src="/landingpage/Singapore.svg" alt="Botswana-Flag" width={16} height={16} className="h-full w-full" />
                                                    </div>
                                                </div>

                                                {/* Texts */}
                                                <div>
                                                    <h5 className="text-xs font-medium text-black">Carlos Barbosa</h5>
                                                    <p className="text-[#A0A0A0] text-[10px] font-medium">ML Engineer</p>
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="bg-[#E3ECFF] flex items-center gap-1 px-1 py-0.5 rounded-full ml-auto">
                                                <span>
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="5" cy="5" r="4.7" stroke="#0052FF" strokeWidth="0.6" />
                                                        <path d="M2.5625 5.375L3.65625 6.46875L6.9375 3.03125" stroke="#0052FF" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                                <span className="font-medium text-xs text-[#0052FF]">Paid</span>
                                            </div>
                                        </div>

                                        <div className='bg-amber200 bg-white w-75 wfull flex items-center justify-between py-2.5 px-3 p4 rounded-lg border border-[#E6E8EC]'>
                                            {/* left */}
                                            <div className="flex items-center gap-2.5">
                                                {/* Image */}
                                                <div className="relative">
                                                    <div className="relative w-10 h-10 bg-[#B9CFFF] rounded-full">
                                                        <Image src="/landingpage/HIW-img5.png" alt='img05' width={46} height={41} className='absoluteinset-0 h-full w-full' quality={100} />
                                                    </div>
                                                    <div className="absolute bottom-0 -right-1 border border-white h-4 w-4 rounded-full">
                                                        <Image src="/landingpage/Botswana.svg" alt="Botswana-Flag" width={16} height={16} className="h-full w-full" />
                                                    </div>
                                                </div>

                                                {/* Texts */}
                                                <div>
                                                    <h5 className="text-xs font-medium text-black">Sarah Hong</h5>
                                                    <p className="text-[#A0A0A0] text-[10px] font-medium">QA Engineer</p>
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="bg-[#E3ECFF] flex items-center gap-1 px-1 py-0.5 rounded-full ml-auto">
                                                <span>
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="5" cy="5" r="4.7" stroke="#0052FF" strokeWidth="0.6" />
                                                        <path d="M2.5625 5.375L3.65625 6.46875L6.9375 3.03125" stroke="#0052FF" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                                <span className="font-medium text-xs text-[#0052FF]">Paid</span>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h4 className="font-bold text-xl sm:text-2xl md:text-3xl">Pay</h4>
                                <p className="text-[#A0A0A0]">Pay your team instantly and track everything in one place</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
