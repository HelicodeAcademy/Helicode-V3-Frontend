"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "hiring",
    name: "Hiring",
    description: "Source and hire top talents around the world",
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Pay employees globally with Stablecoin",
  },
  {
    id: "hr-onboarding",
    name: "HR/Onboarding",
    description: "Automate people ops with a global HR system",
    disabled: false,
  },
];

export default function ProductSelectionPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string>("hiring");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      // TODO: Save to Zustand store
      console.log("Selected product:", selectedProduct);
      router.push("/dashboard"); // Update to actual next step
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard"); // Update to actual next step
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left sidebar with logo */}
      <div className="w-full lg:basis-2/5 flex flex-col justify-start items-center p-4.5">
        <div className="relative w-full h-full rounded-b-2xl overflow-hidden">
          {/* Illustrator wrapper with requested background, rounding and padding */}
          <div className="relative bg-[#F4F5F7] rounded-2xl p-1.5 w-full h-full">
            {/* Logo positioned inside the illustrator on the left */}
            <div className="absolute left-6 top-9 z-10">
              <Image
                src="/signup/logo.svg"
                alt="Helicode Logo"
                width={110}
                height={24}
              />
            </div>

            <div className="relative w-full h-full">
              <Image
                src="/signup/Onboarding-Illustration.svg"
                alt="Illustrator"
                fill
                className="object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:basis-3/5 px-6 lg:px-12 py-8 bg-white flex flex-col">
        {/* Header Navigation */}
        <div className="flex justify-between items-center w-full">
          <button className="text-black font-normal flex items-center text-sm hover:text-primary transition-colors">
            <Image
              src="/signup/back-arrow.svg"
              alt="back-arrow"
              width={16}
              height={16}
            />
            Go back
          </button>
          <Link
            href="/login"
            className="font-medium hover:underline text-black text-sm"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#355587]">Login</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-105.75 mx-auto flex-1 flex items-center justify-center">
          <div>
            <div className="mb-8">
              <h1 className="mb-3 text-[2rem] font-medium text-[#101828] leading-[145%]">
                Which product are you interested in?
              </h1>
              <p className="text-sm text-[#444444] leading-[145%]">
                Please provide your Organization information accurately, it will
                be used in all your communications on the platform.
              </p>
            </div>

            {/* Products Grid */}
            <div className="mb-8 space-y-6 p-1.5 rounded-2xl">
              {PRODUCTS.map((product) => (
                <button
                  key={product.id}
                  onClick={() =>
                    !product.disabled && setSelectedProduct(product.id)
                  }
                  disabled={product.disabled}
                  className={`w-full rounded-lg bg-white p-6 border text-left transition-all ${
                    product.disabled ? "opacity-30" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        selectedProduct === product.id && !product.disabled
                          ? "border-[#0052FF] bg-[#0052FF]/10"
                          : "border-[#E4E7EC]"
                      }`}
                    >
                      {/* {selectedProduct === product.id && !product.disabled && (
                        <Check className="h-4 w-4 text-white" />
                      )} */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <h3
                        className={`font-medium text-lg ${
                          product.disabled ? "text-[#252525]" : "text-[#0F112A]"
                        }`}
                      >
                        {product.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          product.disabled ? "text-[#5A5A5A]" : "text-[#475367]"
                        }`}
                      >
                        {product.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleGetStarted}
                variant={"primary"}
                disabled={isLoading}
                className="w-24.25 bg-[#1C1C1C] hover:bg-[#212121] text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Get Started"}
              </Button>
              <Button
                onClick={handleSkip}
                variant="surface"
                className="w-18.25 text-[#101828] hover:bg-[#f4f5f7] transition-colors bg-transparent"
              >
                Skip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
