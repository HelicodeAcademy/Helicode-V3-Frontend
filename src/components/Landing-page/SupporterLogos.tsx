import React from 'react'

export default function SupporterLogos() {
    return (
        <section id="supporter-logos" className="w-full border-b pt-4 pb-8 lg:py-0">
            <div className="max-w-7xl mx-auto w-full flex flex-col items-center lg:flex-row lg:divide-x px-4 md:px-8   py-12md:py-16">

                <div className='flex h-full w-full lg:w-fit'>
                    <span className='text-[#AAAAAA] mx-auto py-7 h-full font-sans text-center text-2xl lg:text-[28px] leading-tight font-semibold lg:mx-0 lg:pr-16 lg:text-start'>
                        <span className='text-[#0052FF]'>Supported by </span>
                        {" "}the
                        <br className='hidden lg:block' />
                        World&apos;s best.
                    </span>
                </div>

                <div className='flex h-full grow flex-wrap gap-4 lg:flex-row lg:gap-0 lg:divide-x'>
                    <div className='flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40'>
                        <div className='relative h-16 w-32 lg:w-36'>
                            {/* <img src="/logos/logo-1.png" alt="Supporter Logo 1" className="absolute inset-0 h-full w-full text-transparent object-contain select-none " /> */}
                        </div>
                    </div>
                    <div className='flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40'>
                        <div className='relative h-16 w-32 lg:w-36'>
                            {/* <img src="/logos/logo-1.png" alt="Supporter Logo 1" className="absolute inset-0 h-full w-full text-transparent object-contain select-none " /> */}
                        </div>
                    </div>
                    <div className='flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40'>
                        <div className='relative h-16 w-32 lg:w-36'>
                            {/* <img src="/logos/logo-1.png" alt="Supporter Logo 1" className="absolute inset-0 h-full w-full text-transparent object-contain select-none " /> */}
                        </div>
                    </div>
                    <div className='flex shrink-0 grow items-center justify-center h-16 min-w-28 lg:h-32 lg:min-w-40'>
                        <div className='relative h-16 w-32 lg:w-36'>
                            {/* <img src="/logos/logo-1.png" alt="Supporter Logo 1" className="absolute inset-0 h-full w-full text-transparent object-contain select-none " /> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
