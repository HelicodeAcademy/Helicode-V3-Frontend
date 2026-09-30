"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText = "No results",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLElement | null>(null);

  const selected = options.find((option) => option.value === value);
  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const parent =
      trigger.closest<HTMLElement>("[data-slot='dialog-content']") ??
      document.body;
    portalRef.current = parent;
    const triggerRect = trigger.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    setMenuStyle({
      top: triggerRect.bottom - parentRect.top + parent.scrollTop + 4,
      left: triggerRect.left - parentRect.left,
      width: triggerRect.width,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const parent = portalRef.current;
    const previousOverflow = parent?.style.overflow ?? "";
    if (parent && parent !== document.body) {
      parent.style.overflow = "visible";
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setQuery("");
    };

    window.addEventListener("resize", updatePosition);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      if (parent && parent !== document.body) {
        parent.style.overflow = previousOverflow;
      }
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="border-input flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          className={cn("truncate text-left", !selected && "text-[#667085]")}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-[#667085]" />
      </button>
      {open &&
        portalRef.current &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
              pointerEvents: "auto",
            }}
            className="z-[60] rounded-md border bg-white shadow-md"
            onPointerDown={(event) => event.nativeEvent.stopPropagation()}
          >
            <div className="border-b border-[#E4E7EC] p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#98A2B3]" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 border-[#E4E7EC] pl-8"
                />
              </div>
            </div>
            <div
              className="max-h-60 overflow-y-auto overscroll-contain p-1"
              onWheel={(event) => event.stopPropagation()}
            >
              {visibleOptions.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[#667085]">
                  {emptyText}
                </p>
              ) : (
                visibleOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onValueChange(option.value);
                        close();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm text-[#101828] hover:bg-[#F2F4F7]",
                        isSelected && "bg-[#EFF4FF]",
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="size-4 shrink-0 text-[#0052FF]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          portalRef.current,
        )}
    </>
  );
}
