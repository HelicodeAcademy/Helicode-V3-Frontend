"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/store/team-store";
import { apiCall } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PayTeamMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: TeamMember | null;
}

type PayStep = "pay" | "pin" | "success";

const PIN_LENGTH = 4;

export function PayTeamMemberModal({
    open,
    onOpenChange,
    member,
}: PayTeamMemberModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<PayStep>("pay");
    const [amount, setAmount] = useState("");
    const [amountError, setAmountError] = useState("");
    const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
    const [pinError, setPinError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Reset on open
    useEffect(() => {
        if (open && member) {
            setStep("pay");
            setAmount(String(member.amount));
            setAmountError("");
            setPin(Array(PIN_LENGTH).fill(""));
            setPinError("");
        }
    }, [open, member]);

    // Focus first PIN box when entering pin step
    useEffect(() => {
        if (step === "pin") {
            setTimeout(() => pinRefs.current[0]?.focus(), 50);
        }
    }, [step]);

    const handleContinueToPay = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setAmountError("Enter a valid amount.");
            return;
        }
        setAmountError("");
        setStep("pin");
    };

    // PIN input handlers
    const handlePinChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newPin = [...pin];
        newPin[index] = digit;
        setPin(newPin);
        setPinError("");
        if (digit && index < PIN_LENGTH - 1) {
            pinRefs.current[index + 1]?.focus();
        }
    };

    const handlePinKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs.current[index - 1]?.focus();
        }
    };

    const handlePinPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
        const newPin = [...pin];
        [...pasted].forEach((digit, i) => { newPin[i] = digit; });
        setPin(newPin);
        pinRefs.current[Math.min(pasted.length, PIN_LENGTH - 1)]?.focus();
    };

    const pinComplete = pin.every((d) => d !== "");

    // const handleConfirmPin = async () => {
    //     if (!pinComplete) return;
    //     setIsSubmitting(true);
    //     try {
    //         // When endpoint is ready: await apiCall(`/teams/${member?.id}/pay`, { method: "POST", body: JSON.stringify({ amount: Number(amount), pin: pin.join("") }) })

    //         await apiCall(`/payroll-groups/pay-now/${member?.id}`, {
    //             method: "POST",
    //             body: JSON.stringify({ pin: pin.join("") }),
    //         });
    //         setStep("success");
    //     } catch (err: unknown) {
    //         toast.error(
    //             err instanceof Error ? err.message : "Payment failed. Please try again.",
    //         );
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleConfirmPin = async () => {
        if (!pinComplete || !member) return;
        setIsSubmitting(true);
        setPinError("");
        try {
            await apiCall(`/payroll-groups/pay-now/${member.id}`, {
                method: "POST",
                body: JSON.stringify({ pin: pin.join(""), amount: Number(amount) }),
            });
            setStep("success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
            if (message === "Wallet PIN not configured") {
                setPinError(message);
            } else {
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoHome = () => {
        onOpenChange(false);
        router.push("/dashboard");
    };

    const handleGoToSettings = () => {
        onOpenChange(false);
        router.push("/dashboard/settings");
    };

    if (!member) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "gap-0 p-0 overflow-hidden rounded-xl",
                    step === "success" ? "sm:max-w-md" : "sm:max-w-sm",
                )}
                showCloseButton={false}
            >
                {/* ── Step: Pay ── */}
                {step === "pay" && (
                    <div className="bg-[#F8F8F8]">
                        <DialogTitle className="sr-only">Pay</DialogTitle>
                        <div className="bg[#f5f5f5] px-5 pt-5 pb-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h2 className="text-2xl font-semibold text-black">Pay</h2>
                                    <p className="text-sm text-[#667085] mt-1.5">
                                        Send an instant payout
                                    </p>
                                </div>
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                                >
                                    <X className="h-4 w-4 text-[#101928]" />
                                </button>
                            </div>

                            {/* Recipient card */}
                            <div className="bg-white rounded-xl px-4 py-3.5 mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-[#667085]">Recipient</span>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-[#101928]">
                                            {member.fullName}
                                        </p>
                                        {/* <p className="text-xs text-[#667085]">
                                            {member.type.charAt(0) +
                                                member.type.slice(1).toLowerCase()}
                                        </p> */}
                                        <p className="text-xs text-[#667085]">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Amount card */}
                            <div className="bg-white rounded-xl px-4 pt-3.5 pb-4">
                                <p className="text-sm text-[#667085] mb-2">Amount</p>
                                <div className="relative">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[2rem] font-bold text-[#101928]">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setAmountError("");
                                        }}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        placeholder="0.00"
                                        className="w-full pl-8 text-[2rem] font-bold text-[#101928] bg-transparent outline-none border-none placeholder:text-[#d0d5dd]"
                                    />
                                </div>
                                {amountError && (
                                    <p className="text-xs text-red-500 mt-1">{amountError}</p>
                                )}
                            </div>
                            {/* not editable */}
                            {/* <div className="bg-white rounded-xl px-4 pt-3.5 pb-4">
                                <p className="text-sm text-[#667085] mb-2">Amount</p>
                                <p className="text-[2rem] font-bold text-[#101928] leading-none">
                                    ${member.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div> */}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end px-5 py-4">
                            <Button
                                variant="primary"
                                // onClick={() => setStep("pin")} // when not editable
                                onClick={handleContinueToPay}
                                className="hover:bg-[#101828]/90"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step: PIN ── */}
                {step === "pin" && (
                    <>
                        <DialogTitle className="sr-only">Input Pin</DialogTitle>
                        <div className="px-6 py-8 flex flex-col items-center text-center">
                            {/* Lock icon */}
                            <div className="h-19 w-19 rounded-full bg-[#EEF4FF] flex items-center justify-center mb-8">
                                <Lock className="h-8 w-8 text-[#0052FF]" strokeWidth={1.5} />
                            </div>

                            <h2 className="text-2xl font-semibold text-black mb-2">
                                Input Pin
                            </h2>
                            <p className="text-sm text-[#7F7F7F] mb-8">
                                Enter your 4-digit code to proceed
                            </p>

                            {/* PIN boxes */}
                            <div className="flex items-center gap-2.5 mb-8">
                                {pin.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => {
                                            pinRefs.current[i] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handlePinChange(i, e.target.value)}
                                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                                        onPaste={i === 0 ? handlePinPaste : undefined}
                                        className={cn(
                                            "h-12 w-12 rounded-md border text-center text-lg font-semibold text-[#101928] outline-none transition-all",
                                            pinError ? "border-red-400 bg-red-50"
                                                : digit
                                                    ? "border-[#101928] bg-white shadow-sm"
                                                    : "border[#E4E7EC] border-[#D7D7D7] bg-white",
                                            !pinError && "focus:border-[#101928] focus:ring-2 focus:ring-[#101928]/10",
                                        )}
                                    />
                                ))}
                            </div>

                            {/* PIN error with settings CTA */}
                            {pinError && (
                                <div className="mb-6 text-center">
                                    <p className="text-sm text-red-500 mb-1">{pinError}</p>
                                    <button
                                        onClick={handleGoToSettings}
                                        className="cursor-pointer text-sm text-[#0052FF] underline underline-offset-2 hover:text-[#0041cc] transition-colors"
                                    >
                                        Set up your PIN in Settings →
                                    </button>
                                </div>
                            )}

                            {!pinError && <div className="mb-6" />}

                            <Button
                                variant="primary"
                                className="w-full py-5 hover:bg-[#101828]/90"
                                disabled={!pinComplete || isSubmitting}
                                onClick={handleConfirmPin}
                            >
                                {isSubmitting ? "Confirming..." : "Confirm"}
                            </Button>
                        </div>
                    </>
                )}

                {/* ── Step: Success ── */}
                {step === "success" && (
                    <>
                        <DialogTitle className="sr-only">Payment Sent</DialogTitle>

                        <div className="p-2 flexflex-colitems-center">
                            <Image
                                src="/payroll/modal-illustration.png"
                                alt="Success"
                                width={384}
                                height={220}
                                className="w-full rounded-md"
                            />
                            <div className="px-4 pt-6 pb-6">
                                <h2 className="text-2xl font-bold text-[#000000] mb-8">
                                    Payment Sent!
                                </h2>
                                <Button
                                    variant="primary"
                                    onClick={handleGoHome}
                                    className="hover:bg-[#101828]/90"
                                >
                                    Go to home
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}