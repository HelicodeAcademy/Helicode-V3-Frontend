'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { setWalletPin } from '@/lib/wallet-service';
import { useWalletStore } from '@/store/wallet-store';

interface ModifyPinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifyPinModal({ open, onOpenChange }: ModifyPinModalProps) {
  const { hasPin, setHasPin } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [oldPin, setOldPin] = useState(['', '', '', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);

  const oldInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = (pin: string[]) => pin.every((digit) => digit !== '');

  const resetFields = () => {
    setOldPin(['', '', '', '', '', '']);
    setNewPin(['', '', '', '', '', '']);
    setConfirmPin(['', '', '', '', '', '']);
  };

  useEffect(() => {
    if (!open) return;
    resetFields();
    const focusTarget = hasPin
      ? oldInputRefs.current[0]
      : newInputRefs.current[0];
    focusTarget?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handlePinChange = (
    pin: string[],
    setPin: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    index: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;
    const updatedPin = [...pin];
    updatedPin[index] = value;
    setPin(updatedPin);
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    pin: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasPin && !isComplete(oldPin)) {
      toast.error('Please enter your current PIN');
      return;
    }

    if (!isComplete(newPin) || !isComplete(confirmPin)) {
      toast.error('Please enter a 6-digit PIN');
      return;
    }

    const newPinValue = newPin.join('');
    const confirmValue = confirmPin.join('');

    if (newPinValue !== confirmValue) {
      toast.error('New PIN and confirmation do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await setWalletPin(newPinValue, hasPin ? oldPin.join('') : undefined);
      setHasPin(true);
      toast.success('PIN saved successfully!');
      setTimeout(() => onOpenChange(false), 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save PIN';
      toast.error(errorMessage);
      console.error('Set PIN error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#000000]">
            {hasPin ? 'Change PIN' : 'Create PIN'}
          </DialogTitle>
        </DialogHeader>

        <hr className="bg-[#E4E7EC] my-3" />

        <form onSubmit={onSubmit} className="space-y-6">
          {hasPin && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#0F112A] mb-2.5">
                Current PIN
              </label>
              <div className="flex gap-4">
                {oldPin.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el: HTMLInputElement | null) => {
                      if (el !== null) {
                        oldInputRefs.current[index] = el;
                      }
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handlePinChange(
                        oldPin,
                        setOldPin,
                        oldInputRefs,
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handlePinKeyDown(oldPin, oldInputRefs, index, e)
                    }
                    className="w-12 h-12 text-center text-2xl font-bold border-[#D7D7D7] text-black! rounded-[6px]!"
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
          )}

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
                  onChange={(e) =>
                    handlePinChange(
                      newPin,
                      setNewPin,
                      newInputRefs,
                      index,
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    handlePinKeyDown(newPin, newInputRefs, index, e)
                  }
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
                    handlePinChange(
                      confirmPin,
                      setConfirmPin,
                      confirmInputRefs,
                      index,
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    handlePinKeyDown(confirmPin, confirmInputRefs, index, e)
                  }
                  className="w-12 h-12 text-center text-2xl font-bold border-[#D7D7D7] text-black! rounded-[6px]!"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

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
            ) : hasPin ? (
              'Save changes'
            ) : (
              'Set PIN'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
