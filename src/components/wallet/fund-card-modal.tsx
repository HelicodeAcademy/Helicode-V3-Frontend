"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface FundCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FundCardModal({
  open,
  onOpenChange,
  onSuccess,
}: FundCardModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"card" | "bank" | null>(
    null,
  );

  const handleBuy = () => {
    // Process payment
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-113.25">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">
            Fund with Card or Bank Transfer
          </DialogTitle>
          <p className="text-sm text-[#0F112A] mt-1">
            Secure payment processing. Supports major cards and bank accounts.
          </p>
        </DialogHeader>

        <hr className="bg-[#E4E7EC]" />

        <div className="space-y-4 mt-4">
          {/* Amount Input */}
          <div className="relative">
            <Image
              src="/hiring/currency-dollar.svg"
              alt="dollar sign"
              width={20}
              height={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#667085]"
            />

            <Input
              type="number"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* Credit or Debit Card */}
            <button
              onClick={() => setSelectedMethod("card")}
              className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                selectedMethod === "card"
                  ? "border-[#0166f4] bg-[#f0f4ff]"
                  : "border-[#eaeaea] hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/wallet/credit-card-02.svg"
                  alt="cred card"
                  width={24}
                  height={24}
                />
                <span className="">Credit or Debit Card</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#667085]" />
            </button>

            {/* Bank Transfer */}
            <button
              onClick={() => setSelectedMethod("bank")}
              className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                selectedMethod === "bank"
                  ? "border-[#0166f4] bg-[#f0f4ff]"
                  : "border-[#eaeaea] hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/wallet/bank.svg"
                  alt={"bank"}
                  width={24}
                  height={24}
                />
                <span className="">Bank Transfer</span>
              </div>
              <ChevronRight className="h-5 w-5 text-[#667085]" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="surface"
              onClick={() => onOpenChange(false)}
              className="flex-1 hover:bg-[#e5e5e5]"
            >
              Cancel
            </Button>
            <Button
              variant={"primary"}
              onClick={handleBuy}
              disabled={!amount || !selectedMethod}
              className="flex-1 text-white hover:bg-[#212121]/90"
            >
              Fund
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
