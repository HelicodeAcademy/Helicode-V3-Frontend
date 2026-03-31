// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Image from "next/image";
// import { useState } from "react";

// // withdrawal to crypto wallet for team user

// interface SendFundsModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function SendFundsModal({ open, onOpenChange }: SendFundsModalProps) {
//   const [showSuccess, setShowSuccess] = useState(false);

//   const handleContinue = () => {
//     setShowSuccess(true);
//   };

//   const handleGoHome = () => {
//     setShowSuccess(false);
//     onOpenChange(false);
//   };
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md">
//         {!showSuccess ? (
//           <>
//             <DialogHeader>
//               <DialogTitle className="text-xl font-semibold text-[#101928]">
//                 Send funds
//               </DialogTitle>
//               <DialogDescription className="text-sm text-[#475367]">
//                 Instant withdrawal to another crypto wallet
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-6 mt-6">
//               <div className="flex gap-3">
//                 <div className="flex-1">
//                   <Label
//                     htmlFor="to-address"
//                     className="text-sm font-medium text-[#344054]"
//                   >
//                     To
//                   </Label>
//                   <Input
//                     id="to-address"
//                     placeholder="Enter wallet address"
//                     className="mt-1"
//                   />
//                 </div>
//                 <div className="flex flex-col">
//                   <Label className="text-sm font-medium text-[#344054]">
//                     Network
//                   </Label>
//                   <div className="flex items-center gap-2 mt-1 px-3 py-2 border border-[#D0D5DD] rounded-md bg-[#F9FAFB]">
//                     <Image
//                       src="/wallet/base.svg"
//                       alt="BASE"
//                       width={16}
//                       height={16}
//                     />
//                     <span className="text-sm font-medium text-[#344054]">
//                       BASE
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <div className="w-32">
//                   <Label className="text-sm font-medium text-[#344054]">
//                     Asset
//                   </Label>
//                   <div className="flex items-center gap-2 mt-1 px-3 py-2 border border-[#D0D5DD] rounded-md bg-[#F9FAFB]">
//                     <Image
//                       src="/wallet/usdc.svg"
//                       alt="USDC"
//                       width={16}
//                       height={16}
//                     />
//                     <span className="text-sm font-medium text-[#344054]">
//                       USDC
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex-1">
//                   <Label
//                     htmlFor="amount"
//                     className="text-sm font-medium text-[#344054]"
//                   >
//                     Amount
//                   </Label>
//                   <Input
//                     id="amount"
//                     placeholder="0.00"
//                     className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                     type="number"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-start">
//                 <Button
//                   className="bg-[#000000] text-white font-medium px-6"
//                   onClick={handleContinue}
//                 >
//                   Continue
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
//             <div className="flex justify-center">
//               <Image
//                 src="/payroll/modal-illustration.png"
//                 alt="Success"
//                 width={384}
//                 height={220}
//                 className="mx-auto"
//               />
//             </div>

//             <div className="space-y-2">
//               <DialogTitle className="text-xl font-semibold text-[#101928]">
//                 Withdrawal successful
//               </DialogTitle>
//               <DialogDescription className="text-sm text-[#475367]">
//                 Your crypto has been successfully sent
//               </DialogDescription>
//             </div>

//             <div className="flex pt-4">
//               <Button
//                 className="bg-[#000000] text-white font-medium px-6"
//                 onClick={handleGoHome}
//               >
//                 Go to home
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Lock } from "lucide-react";
import {
  KeyboardEvent,
  ClipboardEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
// import { initiateCryptoWithdrawal } from "@/lib/wallet-service";
import { initiateTeamCryptoWithdrawal } from "@/lib/team/team-transaction-service";
import { useTeamWalletStore } from "@/store/team/team-wallet-store";

interface WithdrawFundsModal {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WithdrawStep = "details" | "pin" | "success";

const PIN_LENGTH = 4;

interface CryptoWithdrawalFormData {
  walletAddress: string;
  amount: number;
  pin: string;
}

interface WithdrawDetailsStepProps {
  walletAddress: string;
  amount: string;
  availableBalance: number;
  addressError: string;
  amountError: string;
  onWalletAddressChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onContinue: () => void;
}

interface WithdrawPinStepProps {
  pin: string[];
  parsedAmount: number;
  isSubmitting: boolean;
  pinRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  onPinChange: (index: number, value: string) => void;
  onPinKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onPinPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onConfirm: () => void;
}

interface WithdrawSuccessStepProps {
  onGoHome: () => void;
}

function WithdrawDetailsStep({
  walletAddress,
  amount,
  availableBalance,
  addressError,
  amountError,
  onWalletAddressChange,
  onAmountChange,
  onContinue,
}: WithdrawDetailsStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Withdraw funds
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475367]">
          Instant withdrawal to your crypto wallet
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-6">
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
              placeholder="Paste address"
              className="mt-1"
              value={walletAddress}
              onChange={(event) => onWalletAddressChange(event.target.value)}
            />
            {addressError ? (
              <p className="mt-1 text-xs text-red-500">{addressError}</p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <Label className="text-sm font-medium text-[#344054]">
              Network
            </Label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-2">
              <Image src="/wallet/base.svg" alt="BASE" width={16} height={16} />
              <span className="text-sm font-medium text-[#344054]">BASE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-32">
            <Label className="text-sm font-medium text-[#344054]">Asset</Label>
            <div className="mt-1 rounded-md border border-[#D0D5DD] bg-[#F9FAFB] px-3 py-2">
              <div className="flex items-center gap-2">
                <Image
                  src="/wallet/usdc.svg"
                  alt="USDC"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-[#344054]">USDC</span>
              </div>
            </div>
            <span className="mt-1 block text-xs text-[#667085]">
              Balance: ${availableBalance.toFixed(2)}
            </span>
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
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
            />
            {amountError ? (
              <p className="mt-1 text-xs text-red-500">{amountError}</p>
            ) : (
              <p className="mt-1 text-xs text-[#667085]">
                You can withdraw up to ${availableBalance.toFixed(2)}.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            className="bg-[#000000] px-6 font-medium text-white"
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
}

function WithdrawPinStep({
  pin,
  isSubmitting,
  pinRefs,
  onPinChange,
  onPinKeyDown,
  onPinPaste,
  onBack,
  onConfirm,
}: WithdrawPinStepProps) {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-19 w-19 items-center justify-center rounded-full bg-[#EEF4FF]">
          <Lock className="h-8 w-8 text-[#0052FF]" strokeWidth={1.5} />
        </div>

        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Input Pin
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-[#475367]">
          Enter your 4-digit code to confirm this withdrawal
        </DialogDescription>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2.5">
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={(element) => {
                pinRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => onPinChange(index, event.target.value)}
              onKeyDown={(event) => onPinKeyDown(index, event)}
              onPaste={index === 0 ? onPinPaste : undefined}
              className="h-12 w-12 rounded-md border border-[#D7D7D7] text-center text-lg font-semibold text-[#101928]"
              disabled={isSubmitting}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="border-[#D0D5DD]"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          className="bg-[#000000] px-6 font-medium text-white"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

function WithdrawSuccessStep({ onGoHome }: WithdrawSuccessStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="flex justify-center">
        <Image
          src="/payroll/modal-illustration.png"
          alt="Success"
          width={384}
          height={220}
          className="mx-auto"
        />
      </div>

      <div className="space-y-2">
        <DialogTitle className="text-xl font-semibold text-[#101928]">
          Withdrawal successful
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475367]">
          Your crypto has been successfully sent to the wallet address you
          provided
        </DialogDescription>
      </div>

      <div className="flex pt-4">
        <Button
          className="bg-[#000000] px-6 font-medium text-white"
          onClick={onGoHome}
        >
          Go to home
        </Button>
      </div>
    </div>
  );
}

export function SendFundsModal({ open, onOpenChange }: WithdrawFundsModal) {
  const { teamWalletBalance } = useTeamWalletStore();
  const [step, setStep] = useState<WithdrawStep>("details");
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [amountError, setAmountError] = useState("");
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { watch, reset, setValue } = useForm<CryptoWithdrawalFormData>({
    defaultValues: {
      walletAddress: "",
      amount: undefined,
      pin: "",
    },
  });

  const walletAddress = watch("walletAddress");
  const amount = watch("amount");
  const availableBalance = teamWalletBalance ?? 0;
  const parsedAmount = Number(amount);

  useEffect(() => {
    if (!open) return;

    setStep("details");
    reset({
      walletAddress: "",
      amount: undefined,
      pin: "",
    });
    setPin(Array(PIN_LENGTH).fill(""));
    setAmountError("");
    setIsSubmitting(false);
  }, [open, reset]);

  useEffect(() => {
    if (step !== "pin") return;

    const timer = setTimeout(() => {
      pinRefs.current[0]?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [step]);

  const handleContinue = () => {
    setStep("pin");
  };

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextPin = [...pin];
    nextPin[index] = digit;
    setPin(nextPin);

    if (digit && index < PIN_LENGTH - 1) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, PIN_LENGTH);
    const nextPin = [...pin];

    [...pasted].forEach((digit, index) => {
      nextPin[index] = digit;
    });

    setPin(nextPin);
    pinRefs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
  };

  const handleConfirmPin = async () => {
    setIsSubmitting(true);

    try {
      const pinString = pin.join("");

      if (pinString.length !== PIN_LENGTH) {
        toast.error("Please enter a complete PIN");
        return;
      }

      if (!amount || amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      await initiateTeamCryptoWithdrawal({
        amount: amount.toString(),
        pin: pinString,
        toAddress: walletAddress,
      });

      //  I might need to update the team wallet balance here after successful withdrawal,

      // if (walletData) {
      //   setWalletData({
      //     ...walletData,
      //     balance:
      //       amount && !Number.isNaN(parsedAmount)
      //         ? Math.max(0, walletData.balance - parsedAmount)
      //         : walletData.balance,
      //   });
      // }

      toast.success("Withdrawal initiated successfully!");
      setStep("success");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Withdrawal failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "details" ? (
          <WithdrawDetailsStep
            walletAddress={walletAddress}
            amount={amount?.toString() || ""}
            availableBalance={availableBalance}
            addressError=""
            amountError={amountError}
            onWalletAddressChange={(value) => {
              setValue("walletAddress", value);
            }}
            onAmountChange={(value) => {
              const nextAmount = Number(value);
              setValue("amount", nextAmount);

              if (!value) {
                setAmountError("");
                return;
              }

              if (nextAmount <= 0) {
                setAmountError("Amount must be greater than 0.");
                return;
              }

              if (nextAmount > availableBalance) {
                setAmountError(
                  "Amount cannot be more than your available balance.",
                );
                return;
              }

              setAmountError("");
            }}
            onContinue={handleContinue}
          />
        ) : step === "pin" ? (
          <WithdrawPinStep
            pin={pin}
            parsedAmount={parsedAmount}
            isSubmitting={isSubmitting}
            pinRefs={pinRefs}
            onPinChange={handlePinChange}
            onPinKeyDown={handlePinKeyDown}
            onPinPaste={handlePinPaste}
            onBack={() => setStep("details")}
            onConfirm={handleConfirmPin}
          />
        ) : (
          <WithdrawSuccessStep onGoHome={handleGoHome} />
        )}
      </DialogContent>
    </Dialog>
  );
}
