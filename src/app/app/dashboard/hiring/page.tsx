"use client";

import { useContext, useEffect } from "react";
import { PageTitleContext } from "../layout";
import { RoleRequestForm } from "@/components/hiring/role-request-form";

export default function HiringPage() {
  const { setTitle } = useContext(PageTitleContext);

  useEffect(() => {
    setTitle("Hiring");
  }, [setTitle]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (data: any) => {
    console.log("Role request submitted:", data);
  };

  return (
    <div className="py-8 px-6 md:px-12 max-w-112.5 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-bold text-[#212121] mb-2">
          Role Request
        </h1>
        <p className="text-[#444444] text-sm leading-relaxed max-w-lg">
          Hire faster, reduce hiring costs, and scale your team globally without
          the operational complexity.
        </p>
      </div>

      {/* Form */}
      <RoleRequestForm onSubmit={handleSubmit} />
    </div>
  );
}
