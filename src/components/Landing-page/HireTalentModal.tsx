"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, AlertCircle } from "lucide-react";

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
import {
    ROLE_TYPES,
    SENIORITY_LEVELS,
    WORK_ARRANGEMENTS,
    SALARY_RANGES,
    type Option,
} from "@/lib/waitlist-constants";

// ─── Validation schema (mirrors server-side) ──────────────────────────────────

const hireTalentSchema = z.object({
    roleTitle: z.string().min(1, "Role title is required").max(100),
    roleType: z.enum(["full-time", "part-time", "contract", "internship"], {
        error: "Role type is required",
    }),
    seniority: z.enum(
        ["intern", "junior", "mid", "senior", "lead", "manager", "director", "vp", "c-suite"],
        { error: "Seniority is required" }
    ),
    workArrangement: z.enum(["remote", "hybrid", "onsite"], {
        error: "Work arrangement is required",
    }),
    expectedStartDate: z
        .string()
        .min(1, "Expected start date is required")
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Please enter a valid date",
        }),
    salaryRange: z.enum(
        ["under-1k", "1k-2k", "2k-4k", "4k-7k", "7k-12k", "12k-20k", "20k+", "flexible"],
        { error: "Salary range is required" }
    ),
    preferredLocation: z.string().min(1, "Preferred location is required").max(100),
    workerType: z.string().min(1, "Worker type is required").max(100),
    email: z.string().email("Please enter a valid email address"),
    companyName: z.string().min(1, "Company name is required").max(100),
});

type HireTalentFormData = z.infer<typeof hireTalentSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Success State ─────────────────────────────────────────────────────────────

function SuccessView({
    alreadyExists,
    onClose,
    scheduleCallUrl,
}: {
    alreadyExists: boolean;
    onClose: () => void;
    scheduleCallUrl: string;
}) {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Checkmark */}
            <div className="flex size-14 items-center justify-center rounded-full bg-green-50 shrink-0">
                <svg
                    className="size-7 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl font-bold text-[#0F112A] leading-snug">
                    {alreadyExists ? "We've updated your request!" : "Request received! 🎉"}
                </h3>
                <p className="text-sm text-[#667185] leading-relaxed">
                    {alreadyExists
                        ? "We already have your details on file and have updated your request. Our team will be in touch soon."
                        : "Our team will review your hiring request and reach out to schedule a call so we can find the right talent for you."}
                </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                    variant="outline"
                    size="default"
                    onClick={onClose}
                    className="w-full sm:w-auto border-[#E4E7EC] text-[#344054]"
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    size="default"
                    onClick={() => {
                        window.open(scheduleCallUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full sm:w-auto"
                >
                    Schedule a Call Now
                </Button>
            </div>
        </div>
    );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

interface HireTalentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** URL for the "Schedule a Call" button */
    scheduleCallUrl?: string;
}

export function HireTalentModal({
    open,
    onOpenChange,
    scheduleCallUrl = "https://calendly.com/your-link",
}: HireTalentModalProps) {
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
    } = useForm<HireTalentFormData>({
        resolver: zodResolver(hireTalentSchema),
        mode: "onBlur",
    });

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setTimeout(() => {
                reset();
                setStatus("idle");
                setSuccessData(null);
                setServerError(null);
            }, 300);
        }
        onOpenChange(next);
    };

    const onSubmit = async (data: HireTalentFormData) => {
        setStatus("submitting");
        setServerError(null);

        try {
            const res = await fetch("/api/hire-talent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (res.status === 422 && json.errors) {
                Object.entries(json.errors as Record<string, string[]>).forEach(
                    ([field, messages]) => {
                        setError(field as keyof HireTalentFormData, {
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

    // Today's date in YYYY-MM-DD for min date on date picker
    const today = new Date().toISOString().split("T")[0];

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
                        "max-h-[90dvh] overflow-y-auto overscroll-contain"
                    )}
                    onInteractOutside={(e) => {
                        if (isSubmitting) e.preventDefault();
                    }}
                    onEscapeKeyDown={(e) => {
                        if (isSubmitting) e.preventDefault();
                    }}
                    aria-describedby="hire-talent-description"
                >
                    {/* Close button */}
                    <DialogPrimitive.Close
                        disabled={isSubmitting}
                        className="absolute right-4 top-4 z-10 rounded-md p-1 text-[#98A2B3] transition-colors hover:text-[#0F112A] disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </DialogPrimitive.Close>

                    <div className="p-6 sm:p-8">
                        {status === "success" && successData ? (
                            <SuccessView
                                alreadyExists={successData.alreadyExists}
                                onClose={() => handleOpenChange(false)}
                                scheduleCallUrl={scheduleCallUrl}
                            />
                        ) : (
                            <>
                                {/* Header */}
                                <div className="mb-6 space-y-2">
                                    <DialogPrimitive.Title className="text-xl md:text-3xl font-bold text-[#0F112A]">
                                        Hire Talent
                                    </DialogPrimitive.Title>
                                    <p
                                        id="hire-talent-description"
                                        className="text-sm text-[#454545]"
                                    >
                                        Hire faster, reduce hiring costs, and scale your team globally without the operational complexity.
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

                                        {/* Work Email */}
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

                                        {/* Role Title */}
                                        <FormField
                                            label="Role Title"
                                            required
                                            error={errors.roleTitle?.message}
                                            className="sm:col-span-2"
                                        >
                                            <Input
                                                {...register("roleTitle")}
                                                placeholder="e.g. Senior Backend Engineer"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.roleTitle}
                                                className={cn(
                                                    "w-full",
                                                    errors.roleTitle && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                        {/* Role Type */}
                                        <FormField
                                            label="Role Type"
                                            required
                                            error={errors.roleType?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="roleType"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.roleType && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.roleType}
                                                        >
                                                            <SelectValue placeholder="Select role type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ROLE_TYPES.map((o: Option) => (
                                                                <SelectItem key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* Seniority */}
                                        <FormField
                                            label="Seniority"
                                            required
                                            error={errors.seniority?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="seniority"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.seniority && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.seniority}
                                                        >
                                                            <SelectValue placeholder="Select seniority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SENIORITY_LEVELS.map((o: Option) => (
                                                                <SelectItem key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* How will they work? */}
                                        <FormField
                                            label="How will they work?"
                                            required
                                            error={errors.workArrangement?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="workArrangement"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.workArrangement && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.workArrangement}
                                                        >
                                                            <SelectValue placeholder="Remote / Hybrid / On-site" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {WORK_ARRANGEMENTS.map((o: Option) => (
                                                                <SelectItem key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* Monthly Salary Range */}
                                        <FormField
                                            label="Monthly Salary Range"
                                            required
                                            error={errors.salaryRange?.message}
                                        >
                                            <Controller
                                                control={control}
                                                name="salaryRange"
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isSubmitting}
                                                    >
                                                        <SelectTrigger
                                                            className={cn(
                                                                "w-full",
                                                                errors.salaryRange && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                            )}
                                                            aria-invalid={!!errors.salaryRange}
                                                        >
                                                            <SelectValue placeholder="Select salary range" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {SALARY_RANGES.map((o: Option) => (
                                                                <SelectItem key={o.value} value={o.value}>
                                                                    {o.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>

                                        {/* Expected Start Date */}
                                        <FormField
                                            label="Expected Start Date"
                                            required
                                            error={errors.expectedStartDate?.message}
                                            className="sm:col-span-2"
                                        >
                                            <Input
                                                {...register("expectedStartDate")}
                                                type="date"
                                                min={today}
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.expectedStartDate}
                                                className={cn(
                                                    "w-full",
                                                    // Style the placeholder text on empty date inputs
                                                    "[&:not([value])]:text-[#D4D6E2] [&[value='']]:text[#D4D6E2] [[value='']]:text-[#D4D6E2]",
                                                    errors.expectedStartDate && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                        {/* Preferred Location */}
                                        <FormField
                                            label="Preferred Location"
                                            required
                                            error={errors.preferredLocation?.message}
                                        >
                                            <Input
                                                {...register("preferredLocation")}
                                                placeholder="e.g. Lagos, Nigeria"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.preferredLocation}
                                                className={cn(
                                                    "w-full",
                                                    errors.preferredLocation && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                        {/* Worker Type */}
                                        <FormField
                                            label="Worker Type"
                                            required
                                            error={errors.workerType?.message}
                                        >
                                            <Input
                                                {...register("workerType")}
                                                placeholder="e.g. Employee, Contractor"
                                                disabled={isSubmitting}
                                                aria-invalid={!!errors.workerType}
                                                className={cn(
                                                    "w-full",
                                                    errors.workerType && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/30"
                                                )}
                                            />
                                        </FormField>

                                    </div>

                                    {/* Action */}
                                    <div className="mt-6">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="default"
                                            disabled={isSubmitting}
                                            className="w-full"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Submitting…
                                                </>
                                            ) : (
                                                "Submit & Schedule a Call"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

// ─── Convenience trigger wrapper

export function HireTalentButton({
    children,
    scheduleCallUrl,
    ...props
}: React.ComponentProps<typeof Button> & { scheduleCallUrl?: string }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)} {...props}>
                {children ?? "Hire Talent"}
            </Button>
            <HireTalentModal
                open={open}
                onOpenChange={setOpen}
                scheduleCallUrl={scheduleCallUrl}
            />
        </>
    );
}