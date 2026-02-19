import React from 'react'
import { Button } from '../ui/button'

export default function Hero() {
    return (
        <section
            id="hero"
            className="w-full border-b bg-white py-24 md:py-34     flexitems-centerjustify-center"
            style={{
                backgroundImage:
                    'radial-gradient(rgba(0, 0, 0, 0.1) 0.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col gap-10 justify-center items-center text-center max-w-4xl mx-auto">
                    <div className='space-y-4'>
                        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-black leadingtight">
                            Global hiring and payroll built on stablecoins.
                        </h1>
                        <p className="max-w-xl mx-auto text-lg sm:text-xl md:text-2xl text-[#717171] font-medium">
                            Ambitious teams use our system to automate hiring, payroll, compliance, and IT processes in one place.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            className="py-2 px-3 text-white hover:bg-[#101828]/70 rounded-[6px]"
                        >
                            Join waitlist
                        </Button>
                        <Button
                            className="text-[#363636] bg-[#E9E9E9] hover:bg-[#E9E9E9]/90 rounded-[6px]"
                        >
                            Book a Demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
