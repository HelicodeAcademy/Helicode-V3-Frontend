"use client";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-[#E4E7EC] bg-white px-8 py-16 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
          Coming soon
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[#101828]">{title}</h2>
        <p className="mt-3 text-sm leading-[145%] text-[#667085]">
          {description ??
            "This page is not available yet. We will notify you when it is ready."}
        </p>
      </div>
    </div>
  );
}
