import React from 'react'
import OnboardingStack from './OnboardingStack'

export default function Features() {
    return (
        <section
            className="w-full bg-white py-8.5md:py-17 py-12 md:py-16 lg:py-24    flexitems-centerjustify-center"
            style={{
                backgroundImage:
                    'radial-gradient(rgba(0, 0, 0, 0.2) 0.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col gap-12">

                    <div className='flexgap-4flex-colmd:flex-rowmd:items-end max-w-2xl'>
                        <h2 className='font-bold text-3xl sm:text-5xl lg:text-6xl leadingtight'>Your all-in-one Global People Platform</h2>
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

                            {/* <div className="flex flex-col rounded-lg bg-white border border-[#E6E8EC] p-5 md:p-8 flex-1 space-y-8 overflow-hidden">
                                <div className="relative flex items-center justify-center w-full h-65 md:h-75 h[260px] md:h[300px] bg-red-200">
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
                            </div> */}



                            <div className="bg-white border border-[#E6E8EC] p-5 md:p-8 space-y-8 rounded-lg flex flex-col overflow-hidden   flex1h105">
                                <div></div>

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

                            <div className="bg-amber-100 p-10 rounded-lg">
                                Card 3
                            </div>

                            <div className="bg-red-300 p-10 rounded-lg">
                                Card 4 (wider)
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