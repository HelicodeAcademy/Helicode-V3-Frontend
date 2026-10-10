import Image from "next/image";
import { cn } from "@/lib/utils";

const FLAGS: Record<string, { src: string; alt: string }> = {
  USD: { src: "/account/USA.svg", alt: "US Dollar" },
  EUR: { src: "/account/Europe.svg", alt: "Euro" },
  NGN: { src: "/account/Nigeria.svg", alt: "Naira" },
  GHS: { src: "/account/Ghana.svg", alt: "Cedi" },
};

const LETTERS: Record<string, string> = {
  KES: "KSh",
  ZAR: "R",
  GHS: "GH₵",
  NGN: "₦",
};

export function CurrencyMark({
  currency,
  size = 36,
  className,
  letter,
}: {
  currency: string;
  size?: number;
  className?: string;
  letter?: boolean;
}) {
  const flag = !letter ? FLAGS[currency] : undefined;

  if (flag) {
    return (
      <Image
        src={flag.src}
        alt={flag.alt}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full", className)}
      />
    );
  }

  const label = LETTERS[currency] ?? currency.slice(0, 1);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] font-semibold text-[#667085]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
    >
      {label}
    </span>
  );
}
