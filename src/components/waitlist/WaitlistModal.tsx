"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { COUNTRIES, TEAM_SIZES, PAYROLL_VOLUMES, type Option } from "@/lib/waitlist-constants";
import Image from "next/image";

// ─── Validation schema (mirrors server-side)

const waitlistSchema = z.object({
    companyName: z.string().min(1, "Company name is required").max(100),
    website: z
        .string()
        .min(1, "Website is required")
        .refine(
            (val) => {
                try {
                    const url = val.startsWith("http") ? val : `https://${val}`;
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            },
            { message: "Please enter a valid website URL" }
        ),
    teamSize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"], {
        error: "Team size is required",
    }),
    country: z.string().min(1, "Country is required"),
    monthlyPayrollVolume: z.enum(
        ["under-50k", "50k-250k", "250k-1m", "1m-5m", "5m-20m", "20m+"],
        { error: "Monthly payroll volume is required" }
    ),
    currentPayrollProvider: z
        .string()
        .min(1, "Current payroll provider is required")
        .max(100),
    email: z.string().email("Please enter a valid email address"),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

// ─── Sub-components

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
            <AlertCircle className="size-3 shrink-0" />
            {message}
        </p>
    );
}

function FormField({
    label,
    required,
    error,
    children,
    className,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <Label className="text-[#0F112A] text-xs font-medium">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {children}
            <FieldError message={error} />
        </div>
    );
}

// ─── Success State 

function SuccessView({
    alreadyExists,
    onClose,
}: {
    alreadyExists: boolean;
    onClose: () => void;
}) {
    return (
        <div className="flex flex-col items-centerjustify-center gap-4 p-4 py8 textcenter wfull">
            {/* <div className="flex size-14 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="size-7 text-green-500" />
            </div> */}

            <Image src="/landingpage/confirm-illus.svg" alt="" width={400} height={220} className="w-full h-auto rounded-sm" />

            <div className="space-y-10 px6">
                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-semibold text-[#0F112A]">
                        {alreadyExists ? "You're already on the list!" : "You're on the list!"}
                    </h3>
                    {/* Thanks for your interest. We'll reach out as soon as we have a spot for you.  */}
                    <p className="text-sm text-[#667185] leading-relaxed">
                        {alreadyExists
                            ? "We already have your details. We'll reach out as soon as we have a spot for you."
                            : "Our team will review your request and reach out shortly to schedule your early access onboarding."}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={onClose}
                    className="mt-2mr-auto w-full sm:w-auto self-start border-[#E4E7EC] text-[#344054]"
                >
                    Done
                </Button>
            </div>
        </div>
    );
}

// ─── Main Modal

interface WaitlistModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleCallUrl?: string;
}

export function WaitlistModal({
    open,
    onOpenChange,
    scheduleCallUrl = "https://calendly.com/fiyinodebunmi/30min",
}: WaitlistModalProps) {
    const [status, setStatus] = React.useState<
        "idle" | "submitting" | "success" | "error"
    >("idle");
    const [successData, setSuccessData] = React.useState<{
        alreadyExists: boolean;
    } | null>(null);
    const [serverError, setServerError] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors },
    } = useForm<WaitlistFormData>({
        resolver: zodResolver(waitlistSchema),
        mode: "onBlur",
        // defaultValues: {
        //     companyName: "",
        //     teamSize: "1-10",
        //     country: "US",
        // },
    });

    // Reset everything when modal closes
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            // Small delay so the close animation finishes before resetting
            setTimeout(() => {
                reset();
                setStatus("idle");
                setSuccessData(null);
                setServerError(null);
            }, 300);
        }
        onOpenChange(next);
    };

    const onSubmit = async (data: WaitlistFormData) => {
        setStatus("submitting");
        setServerError(null);

        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (res.status === 422 && json.errors) {
                // Map server validation errors back to form fields
                Object.entries(json.errors as Record<string, string[]>).forEach(
                    ([field, messages]) => {
                        setError(field as keyof WaitlistFormData, {
                            message: messages[0],
                        });
                    }
                );
                setStatus("idle");
                return;
            }

            if (!json.success) {
                setServerError(json.message || "Something went wrong. Please try again.");
                setStatus("error");
                return;
            }

            setSuccessData({ alreadyExists: json.alreadyExists });
            setStatus("success");
        } catch {
            setServerError("Network error. Please check your connection and try again.");
            setStatus("error");
        }
    };

    const isSubmitting = status === "submitting";

    return (
        <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
            <DialogPrimitive.Portal>
                {/* Overlay */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

                {/* Content */}
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
                        "bg-white rounded-2xl shadow-2xl border border-[#E4E7EC]",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
                        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                        "duration-200",
                        "max-h-[90dvh] overflow-y-auto"
                    )}
                    // Prevent accidental close on overlay click while submitting
                    onInteractOutside={(e) => {
                        if (isSubmitting) e.preventDefault();
                    }}
                    onEscapeKeyDown={(e) => {
                        if (isSubmitting) e.preventDefault();
                    }}
                    aria-describedby="waitlist-description"
                >
                    {/* Close button */}
                    {/* <DialogPrimitive.Close
                        disabled={isSubmitting}
                        className="absolute right-4 top-4 z-10 rounded-md p-1 text-[#98A2B3] transition-colors hover:text-[#0F112A] disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </DialogPrimitive.Close> */}

                    <div className="p6">
                        {status === "success" && successData ? (
                            <SuccessView
                                alreadyExists={successData.alreadyExists}
                                onClose={() => handleOpenChange(false)}
                            />
                        ) : (
                            <div className="p-6">
                                {/* Header */}
                                <div className="mb-6 space-y-2">
                                    <DialogPrimitive.Title className="text-xl md:text-3xl font-bold text-[#0F112A]">
                                        Join Waitlist
                                    </DialogPrimitive.Title>
                                    <p
                                        id="waitlist-description"
                                        className="textsm text-[#454545]"
                                    >
                                        Apply to join the waitlist. We&apos;re onboarding a limited number of companies for our private beta.
                                    </p>
                                </div>

                                {/* Server-level error banner */}
                                {status === "error" && serverError && (
                                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                        <span>{serverError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {/* Company Name */}
                                        <FormField
                                            label="Company Name"
                                            required
                                            error={errors.companyName?.message}
                                        >
                                            <Input
                                                {...register("companyName")}
                                                placeholder="Helicode"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.companyName}
                                                className={cn(
                                                    "w-full",
                                                    errors.companyName && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                        {/* Email */}
                                        <FormField
                                            label="Work Email"
                                            required
                                            error={errors.email?.message}
                                        >
                                            <Input
                                                {...register("email")}
                                                type="email"
                                                placeholder="you@company.com"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.email}
                                                className={cn(
                                                    "w-full",
                                                    errors.email && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                        {/* Website */}
                                        <FormField
                                            label="Website"
                                            required
                                            error={errors.website?.message}
                                            className="sm:col-span-2"
                                        >
                                            <Input
                                                {...register("website")}
                                                placeholder="https://www.helicode.xyz"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.website}
                                                className={cn(
                                                    "w-full",
                                                    errors.website && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                        {/* Team Size */}
                                        <FormField
                                            label="Team Size"
                                            required
                                            error={errors.teamSize?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="teamSize"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.teamSize && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.teamSize}
                                                        >
                                                            <SelectValue placeholder="Select team size" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {TEAM_SIZES.map((s: Option) => (
                                                                <SelectItem key={s.value} value={s.value}>
                                                                    {s.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* Country */}
                                        <FormField
                                            label="Country"
                                            required
                                            error={errors.country?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="country"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.country && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.country}
                                                        >
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-60">
                                                            {COUNTRIES.map((c: Option) => (
                                                                <SelectItem key={c.value} value={c.value}>
                                                                    {c.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* Monthly Payroll Volume */}
                                        <FormField
                                            label="Monthly Payroll Volume"
                                            required
                                            error={errors.monthlyPayrollVolume?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="monthlyPayrollVolume"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.monthlyPayrollVolume && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.monthlyPayrollVolume}
                                                        >
                                                            <SelectValue placeholder="Select volume" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PAYROLL_VOLUMES.map((v: Option) => (
                                                                <SelectItem key={v.value} value={v.value}>
                                                                    {v.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* Current Payroll Provider */}
                                        <FormField
                                            label="Current Payroll Provider"
                                            required
                                            error={errors.currentPayrollProvider?.message}
                                        >
                                            <Input
                                                {...register("currentPayrollProvider")}
                                                placeholder="e.g. ADP, Gusto, Rippling"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.currentPayrollProvider}
                                                className={cn(
                                                    "w-full",
                                                    errors.currentPayrollProvider && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justifyend">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="default"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                "Get Early Access"
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="default"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto border-[#E4E7EC] text-[#344054]"
                                            onClick={() => {
                                                // Open schedule call in new tab
                                                window.open(scheduleCallUrl, "_blank", "noopener,noreferrer");
                                            }}
                                        >
                                            Schedule a Call
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

// ─── Convenience trigger wrapper

export function WaitlistButton({
    children,
    scheduleCallUrl,
    ...props
}: React.ComponentProps<typeof Button> & { scheduleCallUrl?: string }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} {...props}>
                {children ?? "Join Waitlist"}
            </Button>
            <WaitlistModal
                open={open}
                onOpenChange={setOpen}
                scheduleCallUrl={scheduleCallUrl}
            />
        </>
    );
}