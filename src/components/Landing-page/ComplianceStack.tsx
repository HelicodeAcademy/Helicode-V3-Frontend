"use client"

import { motion } from "motion/react"
import Image from "next/image"

const BARS = 53

export default function ComplianceStack() {
    return (
        <div className="relative overflow-hidden flex items-center justify-center w-full  w48 h32 min-h50 min-h-37.5">
            <div className="absolute top-0 md:left-5 z-0 bg-white min-w-57 sm:min-w-78 p-3 md:p-4 space-y-6 rounded-lg border border-[#E6E8EC] shadow-[0_4px_10px_-5px_rgba(0,0,0,0.10)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-14 h-12 rounded-md bg-[conic-gradient(from_180deg,#0052FF,#C3D6FF)]" />

                        <div>
                            <h5 className="text-xs font-medium text-black">Stacks Inc.</h5>
                            <p className="text-[#A0A0A0] text-[10px] font-medium">Design</p>
                        </div>
                    </div>

                    <div className="flex -space-x-2 p-1 border border-[#E6E8EC] rounded-3xl">
                        <Image src="/landingpage/Brazil.svg" alt="Brazil" width={16} height={16} className="w-4 h-4 rounded-full border-2border-white object-cover" />
                        <Image src="/landingpage/Singapore1.svg" alt="Singapore" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                        <Image src="/landingpage/Nigeria.svg" alt="Nigeria" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                        <Image src="/landingpage/South-Africa.svg" alt="South-Africa" width={16} height={16} className="w-4h-4 rounded-full border-2border-white object-cover" />
                        <Image src="/landingpage/Tanzania.svg" alt="Tanzania" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                        <Image src="/landingpage/Lesotho.svg" alt="Lesotho" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                        <Image src="/landingpage/Kenya.svg" alt="Kenya" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                        <Image src="/landingpage/Ghana.svg" alt="Ghana" width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
                    </div>
                </div>

                <Progress />
            </div>

            <div className="absolute top-[50%] left-[30%] md:top-[40%] md:left-[30%] z-10 bg-white min-w-57 sm:min-w-78 p-3 md:p-4 space-y-6 rounded-lg border border-[#E6E8EC] shadow-[0_4px_10px_-5px_rgba(0,0,0,0.10)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-14 h-12 rounded-md bg-[conic-gradient(from_180deg,#0052FF,#C3D6FF)]" />

                        <div>
                            <h5 className="text-xs font-medium text-black">Acken Inc.</h5>
                            <p className="text-[#A0A0A0] text-[10px] font-medium">Engineering</p>
                        </div>
                    </div>

                    {/* <div className="bg-[#E3ECFF] flex items-center gap-1 px-1 py-0.5 rounded-full ml-auto">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 14C7.91925 14 8.8295 13.8189 9.67878 13.4672C10.5281 13.1154 11.2997 12.5998 11.9497 11.9497C12.5998 11.2997 13.1154 10.5281 13.4672 9.67878C13.8189 8.8295 14 7.91925 14 7C14 6.08075 13.8189 5.1705 13.4672 4.32122C13.1154 3.47194 12.5998 2.70026 11.9497 2.05025C11.2997 1.40024 10.5281 0.884626 9.67878 0.532843C8.8295 0.18106 7.91925 -1.36979e-08 7 0C5.14348 2.76642e-08 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 8.85652 0.737498 10.637 2.05025 11.9497C3.36301 13.2625 5.14348 14 7 14Z" fill="#0B53BF" />
                                <path d="M8.26 1.90552V2.80696C9.16049 3.07972 9.94942 3.63479 10.5103 4.39022C11.0712 5.14564 11.3744 6.0614 11.375 7.0023C11.3744 7.94319 11.0712 8.85895 10.5103 9.61438C9.94942 10.3698 9.16049 10.9249 8.26 11.1976V12.0999C9.39973 11.8195 10.4124 11.1648 11.1358 10.2405C11.8593 9.31627 12.2516 8.176 12.25 7.0023C12.2514 5.82873 11.859 4.68863 11.1356 3.76455C10.4122 2.84046 9.3996 2.18585 8.26 1.90552ZM2.625 7.0023C2.62564 6.0614 2.92878 5.14564 3.48968 4.39022C4.05058 3.63479 4.83951 3.07972 5.74 2.80696V1.90552C4.60041 2.18585 3.58784 2.84046 2.86442 3.76455C2.14101 4.68863 1.74859 5.82873 1.75 7.0023C1.74859 8.17586 2.14101 9.31596 2.86442 10.24C3.58784 11.1641 4.60041 11.8187 5.74 12.0991V11.1976C4.83886 10.926 4.04923 10.3712 3.48815 9.61551C2.92707 8.85984 2.6244 7.94349 2.625 7.0023Z" fill="white" />
                                <path d="M8.88054 7.97841C8.88054 6.18874 6.07587 6.92374 6.07587 5.93519C6.07587 5.58052 6.36054 5.35341 6.90265 5.35341C7.55054 5.35341 7.77376 5.66841 7.84376 6.0923H8.73588C8.65654 5.29585 8.19921 4.79341 7.43699 4.6433V3.94019H6.56199V4.61841C5.72587 4.72496 5.20087 5.21107 5.20087 5.93519C5.20087 7.73341 8.00943 7.05907 8.00943 8.03052C8.00943 8.39763 7.65554 8.64263 7.05588 8.64263C6.27265 8.64263 6.01443 8.2973 5.91876 7.82052H5.04688C5.10365 8.69319 5.6411 9.23841 6.56121 9.3753V10.0644H7.43621V9.38385C8.33299 9.26796 8.88054 8.74607 8.88054 7.97841Z" fill="white" />
                            </svg>
                        </span>
                        <span className="font-medium text-xs text-[#0052FF]">USDC</span>
                    </div> */}

                    <div className="flex -space-x-2 p-1 border border-[#E6E8EC] rounded-3xl">
                        <img src="https://i.pravatar.cc/100?img=17" alt="img-01" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=15" alt="img-02" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=25" alt="img-03" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=35" alt="img-04" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=32" alt="img-05" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=14" alt="img-06" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=56" alt="img-07" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                        <img src="https://i.pravatar.cc/100?img=59" alt="img-08" width={20} height={20} className="w-5 h-5 rounded-full border-2 border-white object-cover" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function Progress() {
    return (
        <div className="flex gap-0.5 md:gap-1 justify-between mt4">
            {Array.from({ length: BARS }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        backgroundColor:
                            i / BARS <= 0.3
                                ? "#0052FF"
                                : "#D9E5FF",
                    }}
                    className="w-0.75 h-3.5 roundedfull"
                />
            ))}
        </div>
    )
}