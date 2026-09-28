import { cn } from "@/lib/utils";
import type { LocalAccount } from "@/lib/local-accounts";
import Image from "next/image";

export function CurrencyMark({
  mark,
  size = 36,
  className,
}: {
  mark: LocalAccount["mark"];
  size?: number;
  className?: string;
}) {
  if (mark === "naira") {
    return (
      <Image
        src="/account/Nigeria.svg"
        alt="Naira"
        width={size}
        height={size}
        className={cn("shrink-0", className)}
      />
    );
  }

  if (mark === "cedi") {
    return (
      <Image
        src="/account/Ghana.svg"
        alt="Cedi"
        width={size}
        height={size}
        className={cn("shrink-0", className)}
        aria-hidden
      />
    );
  }

  if (mark === "rand") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-[#98A2B3] font-semibold text-white",
          className,
        )}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        R
      </span>
    );
  }

  if (mark === "flag-eu") {
    return (
      <Image
        src="/account/Europe.svg"
        alt="Euro"
        width={size}
        height={size}
        className={cn("shrink-0", className)}
      />
    );
  }

  return (
    <Image
      src="/account/USA.svg"
      alt="USD"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}
