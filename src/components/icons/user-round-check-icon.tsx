import { cn } from "@/lib/utils";

interface UserRoundCheckIconProps {
  className?: string;
  color?: string;
}

/** User-with-checkmark icon; color via `color` prop or `text-*` / currentColor. */
export function UserRoundCheckIcon({
  className,
  color = "currentColor",
}: UserRoundCheckIconProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.6875 8.48596L8.79457 12.6878L6.5625 10.4794L7.36254 9.6878L8.75904 11.0695L11.8535 7.72949L12.6875 8.48596Z"
        fill={color}
      />
      <path
        d="M5.52572 10.4785L7.16882 12.1041H1.3125V11.6666C1.3125 9.52196 2.80596 7.72605 4.80964 7.26224C3.62167 6.84102 2.77083 5.70737 2.77083 4.375C2.77083 2.68363 4.14196 1.3125 5.83333 1.3125C7.52471 1.3125 8.89583 2.68363 8.89583 4.375C8.89583 5.70737 8.04498 6.84102 6.85703 7.26224C7.97854 7.52188 8.94023 8.19884 9.56964 9.12069L8.73618 10.0203L7.36248 8.66114L5.52572 10.4785Z"
        fill={color}
      />
    </svg>
  );
}
