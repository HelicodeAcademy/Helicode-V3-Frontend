'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export function TalentOnboardingForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-100">
      <div className="md:mb-8 mb-6">
        <h1 className="text-[2rem] md:text-[2rem] font-medium text-[#212121] mb-2 leading-[145%]">
          Welcome to Helicode
        </h1>
        <p className="text-[#444444] text-sm">
          Please complete your talent account to start receiving your salaries
          smoothly.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Enter Code <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input type="text" placeholder="Enter code" className="" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Enter Email Address <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Image
              src="/signup/mail-01.png"
              alt="Email Icon"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />

            <Input
              type="email"
              placeholder="Enter your email address"
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
            Enter New Password <span className="text-[#FF3F3F]">*</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        className="w-20.75 hover:bg-[#101828] text-white mt-8"
      >
        Submit
      </Button>
    </div>
  );
}
