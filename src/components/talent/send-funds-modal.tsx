'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface SendFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendFundsModal({ open, onOpenChange }: SendFundsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#101928]">
            Send funds
          </DialogTitle>
          <DialogDescription className="text-sm text-[#475367]">
            Instant withdrawal to another crypto wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label
                htmlFor="to-address"
                className="text-sm font-medium text-[#344054]"
              >
                To
              </Label>
              <Input
                id="to-address"
                placeholder="Enter wallet address"
                className="mt-1"
              />
            </div>
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-[#344054]">
                Network
              </Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 border border-[#D0D5DD] rounded-md bg-[#F9FAFB]">
                <Image
                  src="/wallet/base.svg"
                  alt="BASE"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-[#344054]">BASE</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-32">
              <Label className="text-sm font-medium text-[#344054]">
                Asset
              </Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 border border-[#D0D5DD] rounded-md bg-[#F9FAFB]">
                <Image
                  src="/wallet/usdc.svg"
                  alt="USDC"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-[#344054]">USDC</span>
              </div>
            </div>
            <div className="flex-1">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-[#344054]"
              >
                Amount
              </Label>
              <Input
                id="amount"
                placeholder="0.00"
                className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <Button className="bg-[#000000] text-white font-medium px-6">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
