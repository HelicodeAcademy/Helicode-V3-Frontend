"use client";

import { useContext, useEffect } from "react";
import Image from "next/image";
import { PageTitleContext } from "../layout";
import { Button } from "@/components/ui/button";

export default function AccountingPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Accounting");
  }, [setTitle]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-8">
      <div className="w-full max-w-142.5 rounded-2xl border border-[#E4E7EC] bg-white px-8 py-10.5 text-center">
        <Image
          src="/home/quickbooks.svg"
          alt="QuickBooks"
          width={80}
          height={80}
          className="mx-auto h-20 w-20"
        />
        <h2 className="mt-6 text-[2.5rem] font-semibold text-[#222222]">
          QuickBooks Online
        </h2>
        <p className="mt-3 text-base leading-[145%] text-[#585858] font-medium">
          Connect your Helicode activity to QuickBooks Online. Review, manage,
          and sync transactions with ease.
        </p>
        <Button className="mt-8" variant="primary">
          <Image
            src="/home/links.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
          Connect
        </Button>
      </div>
    </div>
  );
}
