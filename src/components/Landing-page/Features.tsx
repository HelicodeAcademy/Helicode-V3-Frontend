
import OnboardingStack from './OnboardingStack'
import Image from 'next/image'
import PayrollCardCycle from './PayrollCardCycle'
import ComplianceStack from "./ComplianceStack"


export default function Features() {
    return (
        <section
            className="w-full bg-white py-8.5md:py-17 py-12 md:py-16 lg:py-24    flexitems-centerjustify-center"
            style={{
                backgroundImage:
                    'radial-gradient(rgba(0, 0, 0, 0.1) 0.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col gap-12">

                    <div className='flexgap-4flex-colmd:flex-rowmd:items-end max-w-xl'>
                        <h2 className='font-bold text-3xl sm:text5xl sm:text-[44px] leading-tight'>Your all-in-one Global People Platform</h2>
                    </div>

                    <div className="space-y-6 w-full">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
                            <div className="flex flex-col rounded-lg bg-white border border-[#E6E8EC] p-5 md:p-8 space-y-8 overflow-hidden">

                                {/* animation wrapper */}
                                <div className="flex items-center justify-center w-full py-6 md:py10">
                                    <OnboardingStack />
                                </div>

                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-lg md:text-2xl">
                                        Onboarding
                                    </h3>

                                    <p className="text-[#697282] font-medium text-base">
                                        Onboard new hires in minutes. Manage contracts, documents, roles, and employee records from one dashboard.
                                    </p>
                                </div>
                            </div>


                            <div className="bg-white border border-[#E6E8EC] p-5 md:p-8 space-y-8 rounded-lg flex flex-col overflow-hidden   flex1h105">
                                <div className="flex items-center justify-center w-full py-6 md:py10">
                                    <div
                                        className="relative w-full max-w[420px] max-w105 bg-amber100 max-w-md h-45 h[180px] md:h-55 md:h[220px] flex flex-col items-center justify-center"
                                    >
                                        <div className='bg-white w-75 wfull flex items-center justify-between py-2.5 px-3 p4 rounded-lg border border-[#E6E8EC] shadow-[0_4px_10px_-5px_rgba(0,0,0,0.10)]'>
                                            {/* left */}
                                            <div className="flex items-center gap-2.5">
                                                {/* Image */}

                                                <div className="relative">
                                                    <div className="relative w-10 h-10 bg-[#E2D8FB] rounded-full"></div>
                                                    <div className="absolute bottom-0 -right-1 border border-white h-4 w-4 rounded-full">
                                                        <Image src="/landingpage/Singapore.svg" alt="Botswana-Flag" width={16} height={16} className="h-full w-full" />
                                                    </div>
                                                </div>

                                                {/* Texts */}
                                                <div>
                                                    <h5 className="text-xs font-medium text-black">Henry Doe</h5>
                                                    <p className="text-[#A0A0A0] text-[10px] font-medium">Software Engineer</p>
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
                                                <span className="font-normal text-xs text-[#0052FF]">Hired</span>
                                            </div>
                                        </div>

                                        <svg width="1" height="26" viewBox="0 0 1 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <line
                                                x1="0.5"
                                                y1="0"
                                                x2="0.5"
                                                y2="26"
                                                stroke="url(#paint0_linear)"
                                            />

                                            <defs>
                                                <linearGradient
                                                    id="paint0_linear"
                                                    x1="0"
                                                    y1="-26"
                                                    x2="0"
                                                    y2="0"
                                                    gradientUnits="userSpaceOnUse"
                                                >
                                                    <animateTransform
                                                        attributeName="gradientTransform"
                                                        type="translate"
                                                        from="0 -26"
                                                        to="0 52"
                                                        dur="2s"
                                                        repeatCount="indefinite"
                                                    />

                                                    {/* <stop offset="0" stopColor="#E6E8EC" />
                                                    <stop offset="0.5" stopColor="#0052FF" />
                                                    <stop offset="1" stopColor="#E6E8EC" /> */}
                                                    <stop offset="0.3" stopColor="#E6E8EC" />
                                                    <stop offset="0.5" stopColor="#0052FF" />
                                                    <stop offset="0.7" stopColor="#E6E8EC" />
                                                </linearGradient>
                                            </defs>
                                        </svg>


                                        <div className="flex items-center">
                                            <div className="p-1.5 border border-[#E6E8EC] rounded-full">
                                                <Image src="/landingpage/Ukraine.svg" alt="Botswana-Flag" width={26} height={26} className="h-full w-full" />
                                            </div>

                                            <svg width="46" height="1" viewBox="0 0 46 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M0 0.5L46 0.5"
                                                    stroke="#E6E8EC"
                                                    strokeOpacity="0.3"
                                                />
                                                <path
                                                    d="M0 0.5L46 0.5"
                                                    stroke="url(#paint0_linear_679_3824)"
                                                />

                                                <defs>
                                                    <linearGradient
                                                        id="paint0_linear_679_3824"
                                                        x1="-20"
                                                        y1="0"
                                                        x2="20"
                                                        y2="0"
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <animateTransform
                                                            attributeName="gradientTransform"
                                                            type="translate"
                                                            from="-46 0"
                                                            to="46 0"
                                                            // dur="2s"
                                                            dur="1.9s"
                                                            begin="0.35s"
                                                            repeatCount="indefinite"
                                                        />

                                                        <stop offset="0.3" stopColor="#E6E8EC" stopOpacity="0" />
                                                        <stop offset="0.7" stopColor="#0052FF" />
                                                        <stop offset="0.7" stopColor="#E6E8EC" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>




                                            <div className='bg-white w-55 wfull flex flex-col justifybetween p-3 space-y-2.5 rounded-lg border border-[#E6E8EC] shadow-[0_4px_10px_-5px_rgba(0,0,0,0.10)]'>
                                                <div className="flex items-center gap-1">
                                                    <div className="bg-[#F4F5F7] h-5 w-5.5 rounded-[2px]" />
                                                    <div className="flex flex-col gap-1">
                                                        <div className="bg-[#F4F5F7] h-0.75 w-13 rounded-[2px]" />
                                                        <div className="bg-[#F4F5F7] h-2 w-13 rounded-[2px]" />
                                                    </div>
                                                </div>
                                                <div className="h-5 bg-[#F4F5F7] rounded-[2px]" />
                                                <div className="h-5 bg-[#F4F5F7] rounded-[2px]" />
                                            </div>


                                            <svg width="44" height="1" viewBox="0 0 44 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <line
                                                    x1="0"
                                                    y1="0.5"
                                                    x2="44"
                                                    y2="0.5"
                                                    stroke="#E6E8EC"
                                                    strokeOpacity="0.3"
                                                />
                                                <line
                                                    x1="0"
                                                    y1="0.5"
                                                    x2="44"
                                                    y2="0.5"
                                                    stroke="url(#flow)"
                                                />

                                                <defs>
                                                    <linearGradient
                                                        id="flow"
                                                        x1="0"
                                                        y1="0"
                                                        x2="44"
                                                        y2="0"
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <animateTransform
                                                            attributeName="gradientTransform"
                                                            type="translate"
                                                            from="44 0"
                                                            to="-44 0"
                                                            // dur="1.8s"
                                                            dur="2s"
                                                            begin="0.35s"
                                                            repeatCount="indefinite"
                                                        />

                                                        <stop offset="0.4" stopColor="#0052FF" stopOpacity="0" />
                                                        <stop offset="0.4" stopColor="#0052FF" />
                                                        <stop offset="0.7" stopColor="#0052FF" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>


                                            <div className="p-1.5 border border-[#E6E8EC] rounded-full">
                                                <Image src="/landingpage/Netherlands.svg" alt="Botswana-Flag" width={26} height={26} className="h-full w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-lg md:text-2xl">Recruitment</h3>
                                    <p className="text-[#697282] font-medium text-base">
                                        Hire full-time employees or contractors across Africa with locally compliant contracts without setting up entities.
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6">

                            <div className="flex flex-col rounded-lg bg-white border border-[#E6E8EC] p-5 md:p-8 space-y-8 overflow-hidden">

                                {/* animation wrapper */}
                                <div className="flex items-center justify-center w-full py-6 md:py10">
                                    <PayrollCardCycle />
                                </div>

                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-lg md:text-2xl">
                                        Stablecoin Payroll
                                    </h3>

                                    <p className="text-[#697282] font-medium text-base">
                                        Run payroll using stablecoins or fiat. Pay teams instantly, avoid FX delays, and reduce cross-border costs.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col rounded-lg bg-white border border-[#E6E8EC] p-5 md:p-8 space-y-8 overflow-hidden">

                                {/* animation wrapper */}
                                <div className="flex items-center justify-center w-full h-full py-6 md:py10">

                                    <ComplianceStack />
                                </div>

                                <div className="space-y-2.5">
                                    <h3 className="font-bold text-lg md:text-2xl">
                                        Compliance
                                    </h3>

                                    <p className="text-[#697282] font-medium text-base">
                                        We handle local labor laws, tax requirements, and regulatory complexity, so you don&apos;t have to.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

{/* Row 1 */ }
{/* <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">

    <div
        className="flex flex-col rounded-lg bg-white border border-[#E6E8EC] p-5 md:p-8 flex-1 space-y-8"
    >
        Animation container
        <div className="relative flex items-center justify-center w-full h-[260px] md:h-[300px]">

            <OnboardingStack />

        </div>

        <div className="space-y-2.5">
            <h3 className="font-bold text-lg md:text-2xl">
                Onboarding
            </h3>

            <p className="text-[#697282] font-medium text-base">
                Onboard new hires in minutes...
            </p>
        </div>
    </div>

    <div className="bg-white border border-[#E6E8EC] p-5 md:p-8 space-y-8 rounded-lg">
        Card 2
    </div>
</div> */}

{/* <div className="grid grid-cols-12 gap-6">

    <div className="col-span-12 md:col-span-7 bg-gray-200 p-10 rounded-xl">
        Card 1
    </div>

    <div className="col-span-12 md:col-span-5 bg-gray-300 p-10 rounded-xl">
        Card 2
    </div>

    <div className="col-span-12 md:col-span-5 bg-gray-300 p-10 rounded-xl">
        Card 3
    </div>

    <div className="col-span-12 md:col-span-7 bg-gray-200 p-10 rounded-xl">
        Card 4
    </div>

</div> */}

// rough work
{/* <div
    className="relative flex flex-col rounded-lg   h-105w-full  bg-white border border-[#E6E8EC] p-5 md:p-8 flex-1 space-y-8 transition-all duration-200 ease-in-out"
>
    h-58.75 w-10.25
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <OnboardingStack />
    </div>
    <div className="relative flex flex-col h-58.75 w-full max-w-[382px] sm:w-[584px] sm:max-w-[584px] md:w-[382px]">
        <div className="relative flex-1 flex h-fullw-fullflex-col items-center justify-center overflow-hidden ">
            <OnboardingStack />
        </div>
    </div>

    <div className="">

        <OnboardingStack />
    </div>

    <div className="space-y-2.5">
        <h3 className="font-bold text-lg md:text-2xl">Onboarding</h3>
        <p className="text-[#697282] font-medium text-base">
            Onboard new hires in minutes. Manage contracts, documents, roles, and employee records from one dashboard.
        </p>
    </div>
</div> */}
