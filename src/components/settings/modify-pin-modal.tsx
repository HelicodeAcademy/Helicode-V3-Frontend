'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '../ui/button';

interface ModifyPinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifyPinModal({ open, onOpenChange }: ModifyPinModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [newPin, setNewPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);

  const newInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleNewPinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updatedPin = [...newPin];
    updatedPin[index] = value;
    setNewPin(updatedPin);
    if (value && index < 5) {
      newInputRefs.current[index + 1]?.focus();
    }
  };

  const handleNewKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !newPin[index] && index > 0) {
      newInputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmPinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updatedPin = [...confirmPin];
    updatedPin[index] = value;
    setConfirmPin(updatedPin);
    if (value && index < 5) {
      confirmInputRefs.current[index + 1]?.focus();
    }
  };

  const handleConfirmKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !confirmPin[index] && index > 0) {
      confirmInputRefs.current[index - 1]?.focus();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#000000]">
            Create PIN
          </DialogTitle>
        </DialogHeader>

        <hr className="bg-[#E4E7EC] my-3" />

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              New PIN
            </label>
            <div className="flex gap-4">
              {newPin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {
                    if (el !== null) {
                      newInputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleNewPinChange(index, e.target.value)}
                  onKeyDown={(e) => handleNewKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-[#D7D7D7] text-black! rounded-[6px]!"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
              Confirm New PIN
            </label>
            <div className="flex gap-4">
              {confirmPin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {
                    if (el !== null) {
                      confirmInputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleConfirmPinChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleConfirmKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-[#D7D7D7] text-black! rounded-[6px]!"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            variant={'primary'}
            className="w-31.25 hover:bg-[#101828] text-white mt-8"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
