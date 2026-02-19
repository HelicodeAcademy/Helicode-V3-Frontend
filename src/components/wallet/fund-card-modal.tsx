"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface FundCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const bankDetails = [
  { label: "Currency", value: "USD" },
  { label: "Bank name", value: "Lead Bank" },
  { label: "Account number", value: "218778527432" },
  { label: "Bank address", value: "1801 Main St. Kansas City, MO 64108" },
  { label: "Beneficiary Name", value: "Helicode Inc" },
];

export function FundCardModal({ open, onOpenChange }: FundCardModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-96.75">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#101828]">
            Fund with bank transfer
          </DialogTitle>
          <p className="text-xs text-[#9E9E9E] mt-2">
            Money sent to these details will be converted to{" "}
            <span className="text-[#0052FF]">digital dollars</span> and added to
            your Helicode Balance.
          </p>
        </DialogHeader>

        {/* Fee and Time Info */}
        <div className="flex gap-6 mt-4 pb-4 border-b border-[#eaeaea]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#667085]">0.1% fee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#667085]">2 min</span>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-2 mt-6">
          {bankDetails.map((detail, idx) => (
            <div key={idx} className="bg-[#F6F6F6] rounded-sm p-3">
              <label className="text-sm text-[#979CA6] block mb-1">
                {detail.label}
              </label>
              <div className="flex items-center justify-between">
                <p className="text-[#000000] font-medium">{detail.value}</p>
                <button
                  onClick={() => handleCopy(detail.value, idx)}
                  className="text-[#667085] hover:text-[#0166f4] transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <span className="text-xs text-green-600 font-medium">
                      Copied
                    </span>
                  ) : (
                    <Image
                      src="/wallet/copy-01.svg"
                      alt="copy"
                      width={16}
                      height={16}
                    />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
