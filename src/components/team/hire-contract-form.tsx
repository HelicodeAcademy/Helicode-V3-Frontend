"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddHireStore, HireContractForm } from "@/store/add-hire-store";
import { addTeamMember } from "@/lib/team-service";
import { toast } from "react-hot-toast";
import { Currency, PaymentFrequency } from "@/store/team-store";

interface HireContractFormComponentProps {
    title: string;
    subtitle: string;
    workerType: "CONTRACTOR" | "EMPLOYEE";
    onSuccess: () => void;
}

const CURRENCIES: { value: Currency; label: string }[] = [
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "USDC", label: "USDC — USD Coin" },
    { value: "USDT", label: "USDT — Tether" },
];

const FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
    { value: "HOURLY", label: "Hourly" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
];

export function HireContractFormComponent({
    title,
    subtitle,
    workerType,
    onSuccess,
}: HireContractFormComponentProps) {
    const { details, contract, setContract } = useAddHireStore();
    const [errors, setErrors] = useState<
        Partial<Record<keyof HireContractForm, string>>
    >({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof HireContractForm, string>> = {};
        if (!contract.amount || isNaN(Number(contract.amount)) || Number(contract.amount) <= 0)
            newErrors.amount = "Enter a valid amount.";
        if (!contract.department.trim())
            newErrors.department = "Department is required.";
        if (!contract.contract) newErrors.contract = "Please upload a contract file.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        const payload = {
            firstName: details.firstName,
            lastName: details.lastName,
            email: details.email,
            role: details.role,
            department: contract.department,
            country: details.country,
            type: workerType,
            // amount: contract.amount,
            amount: Number(contract.amount),
            startDate: details.startDate,
            frequency: contract.frequency,
            currency: contract.currency,
            contract: contract.contract!,
        }
        console.log("payload", payload)
        try {
            await addTeamMember({
                firstName: details.firstName,
                lastName: details.lastName,
                email: details.email,
                role: details.role,
                department: contract.department,
                country: details.country,
                type: workerType,
                // amount: contract.amount,
                amount: Number(contract.amount),
                startDate: details.startDate,
                frequency: contract.frequency,
                currency: contract.currency,
                contract: contract.contract!,
            });
            onSuccess();
        } catch (err: unknown) {
            // toast.error(
            //     err instanceof Error ? err.message : "Failed to add team member.",
            // );
            const message =
                err instanceof Error ? err.message : "Failed to add team member.";
            toast.error(message);
            // console.error("[addTeamMember]", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-full">
            <div className="max-w-112.5 mx-auto w-full">
                <h1 className="text-2xl md:text-[2rem] font-medium text-[#212121] mb-2">
                    {title}
                </h1>
                <p className="text-[#444444] text-sm mb-8">{subtitle}</p>

                <div className="space-y-5">
                    {/* Monthly Rate */}
                    <div>
                        <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                            Rate <span className="text-[#FF3F3F]">*</span>
                        </label>
                        <Input
                            type="number"
                            min={0}
                            placeholder="5000"
                            value={contract.amount}
                            onChange={(e) => setContract({ amount: e.target.value })}
                            className={errors.amount ? "border-red-400" : ""}
                        />
                        {errors.amount && (
                            <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                        )}
                    </div>

                    {/* Currency — now a proper select */}
                    <div>
                        <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                            Currency <span className="text-[#FF3F3F]">*</span>
                        </label>
                        <Select
                            value={contract.currency}
                            onValueChange={(val) =>
                                setContract({ currency: val as Currency })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                            Payment Frequency <span className="text-[#FF3F3F]">*</span>
                        </label>
                        <Select
                            value={contract.frequency}
                            onValueChange={(val) =>
                                setContract({ frequency: val as PaymentFrequency })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                {FREQUENCIES.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                        {f.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                            Department <span className="text-[#FF3F3F]">*</span>
                        </label>
                        <Input
                            placeholder="Engineering"
                            value={contract.department}
                            onChange={(e) => setContract({ department: e.target.value })}
                            className={errors.department ? "border-red-400" : ""}
                        />
                        {errors.department && (
                            <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                        )}
                    </div>

                    {/* Upload Contract — styled dropzone */}
                    <div>
                        <label className="block text-sm font-medium text-[#0F112A] mb-1.5">
                            Upload contract <span className="text-[#FF3F3F]">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "w-full border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center gap-2 transition-colors",
                                errors.contract
                                    ? "border-red-400 bg-red-50"
                                    : "border-[#E4E7EC] hover:border-[#0052FF] hover:bg-[#f0f6ff]",
                            )}
                        >
                            <UploadCloud className="h-6 w-6 text-[#667085]" />
                            {contract.contract ? (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-[#101928]">
                                        {contract.contract.name}
                                    </p>
                                    <p className="text-xs text-[#667085]">
                                        {(contract.contract.size / 1024).toFixed(1)} KB — click to
                                        replace
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-[#101928] font-medium">
                                        Click to upload contract
                                    </p>
                                    <p className="text-xs text-[#667085]">PDF, DOC up to 10MB</p>
                                </div>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setContract({ contract: file });
                            }}
                        />
                        {errors.contract && (
                            <p className="text-xs text-red-500 mt-1">{errors.contract}</p>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        variant="primary"
                        className="w-32"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create New Hire"}
                    </Button>
                </div>
            </div>
        </div>
    );
}