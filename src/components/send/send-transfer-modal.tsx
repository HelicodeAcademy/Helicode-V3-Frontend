"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type ReactNode,
} from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  FileText,
  Loader2,
  Mail,
  Plus,
  PlusCircle,
  Search,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMoneyTwoFa } from "@/hooks/use-money-two-fa";
import { useAuthStore } from "@/store/auth-store";
import {
  addBridgePayoutWireDetails,
  createBridgePayoutRecipient,
  listBridgePayoutRecipients,
  pollBridgePayoutWithdrawal,
  quoteBridgePayout,
  withdrawBridgePayout,
  type BridgePayoutQuote,
} from "@/lib/bridge-payout-service";
import { requestTransactionVerificationCode } from "@/lib/transaction-verification-service";
import {
  bridgeRecipientToSend,
  formatUsd,
  getWireCutoffInfo,
  lookupRoutingNumber,
  PAYMENT_PURPOSES,
  railLabel,
  railShortLabel,
  recipientDisplayName,
  recipientInitials,
  sendRailToBridge,
  US_STATE_OPTIONS,
  type SendAccountKind,
  type SendRail,
  type SendRecipient,
  type SendRecipientType,
} from "@/lib/send-recipients";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Step =
  | "rail"
  | "recipients"
  | "new-recipient"
  | "wire-details"
  | "amount"
  | "review"
  | "email"
  | "success";

const COMPANY_FEE_FALLBACK = 0.008;

interface SendTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletBalance: number;
  onSuccess?: () => void;
}

const RAILS: {
  id: SendRail;
  title: string;
  description: string;
  meta: string;
  icon: string;
}[] = [
  {
    id: "ach",
    title: "ACH",
    description: "Standard US bank transfer for routine payments.",
    meta: "1-3 business days · Up to $250k/day",
    icon: "/home/bank.svg",
  },
  {
    id: "wire",
    title: "Domestic wire",
    description: "Fedwire transfer for large or urgent payments.",
    meta: "Same day before 4 PM ET · Up to $1M/day",
    icon: "/home/zap.svg",
  },
  {
    id: "swift",
    title: "International wire (SWIFT)",
    description: "Send USD to a bank account in 180+ countries.",
    meta: "1-3 business days · Up to $500k/day",
    icon: "/home/globe.svg",
  },
];

export function SendTransferModal({
  open,
  onOpenChange,
  walletBalance,
  onSuccess,
}: SendTransferModalProps) {
  const router = useRouter();
  const userEmail = useAuthStore((state) => state.user?.email);
  const { requireAuthenticator, handleSubmitError } = useMoneyTwoFa();

  const [step, setStep] = useState<Step>("rail");
  const [rail, setRail] = useState<SendRail>("wire");
  const [recipients, setRecipients] = useState<SendRecipient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wireDetailsId, setWireDetailsId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isRecipientsLoading, setIsRecipientsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState<string>(PAYMENT_PURPOSES[0]);
  const [reference, setReference] = useState("");
  const [invoice, setInvoice] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [quote, setQuote] = useState<BridgePayoutQuote | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCode, setEmailCode] = useState(["", "", "", "", "", ""]);
  const [code2fa, setCode2fa] = useState("");
  const [emailError, setEmailError] = useState("");
  const [transferId, setTransferId] = useState("");
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
  const [feeUsdc, setFeeUsdc] = useState(0);

  const selected = recipients.find((item) => item.id === selectedId) ?? null;
  const wireDetailsRecipient =
    recipients.find((item) => item.id === wireDetailsId) ?? null;
  const bridgeRail = sendRailToBridge(rail);
  const parsedAmount = Number(amount.replace(/,/g, ""));
  const amountValid =
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    Number(parsedAmount.toFixed(2)) === parsedAmount;

  useEffect(() => {
    if (!open) return;
    setStep("rail");
    setRail("wire");
    setRecipients([]);
    setSelectedId(null);
    setWireDetailsId(null);
    setSearch("");
    setAmount("");
    setPurpose(PAYMENT_PURPOSES[0]);
    setReference("");
    setInvoice(null);
    setConfirmed(false);
    setQuote(null);
    setEmailCode(["", "", "", "", "", ""]);
    setCode2fa("");
    setEmailError("");
    setTransferId("");
    setSubmittedAt(null);
    setFeeUsdc(0);
    setIsSubmitting(false);
    setIsRecipientsLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open || step !== "recipients" || !bridgeRail) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsRecipientsLoading(true);
      try {
        const data = await listBridgePayoutRecipients(false, {
          rail: bridgeRail,
          q: search.trim() || undefined,
        });
        if (cancelled) return;
        setRecipients(data.recipients.map(bridgeRecipientToSend));
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load recipients",
          );
        }
      } finally {
        if (!cancelled) setIsRecipientsLoading(false);
      }
    }, search.trim() ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bridgeRail, open, search, step]);

  useEffect(() => {
    if (step !== "amount" || !amountValid || !selected || !bridgeRail) {
      setQuote(null);
      return;
    }
    if (parsedAmount > walletBalance) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsQuoteLoading(true);
      try {
        const next = await quoteBridgePayout(false, "USD", parsedAmount, {
          recipientId: selected.id,
          rail: bridgeRail,
        });
        if (!cancelled) {
          setQuote(next);
          setFeeUsdc(next.feeUsdc ?? 0);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
          setFeeUsdc(
            Number((parsedAmount * COMPANY_FEE_FALLBACK).toFixed(2)),
          );
        }
      } finally {
        if (!cancelled) setIsQuoteLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    amountValid,
    bridgeRail,
    parsedAmount,
    selected,
    step,
    walletBalance,
  ]);

  const close = () => onOpenChange(false);

  const goBack = () => {
    if (step === "recipients") setStep("rail");
    else if (step === "new-recipient") setStep("recipients");
    else if (step === "wire-details") setStep("recipients");
    else if (step === "amount") setStep("recipients");
    else if (step === "review") setStep("amount");
    else if (step === "email") setStep("review");
  };

  const requestEmail = async () => {
    await requestTransactionVerificationCode("COMPANY_WITHDRAWAL_FIAT");
    toast.success("Verification code sent to your email!");
  };

  const startEmailStep = async () => {
    if (!selected || !amountValid) return;
    if (!confirmed) {
      toast.error("Confirm the account details before sending.");
      return;
    }
    setIsSubmitting(true);
    try {
      await requestEmail();
      setEmailCode(["", "", "", "", "", ""]);
      setCode2fa("");
      setEmailError("");
      setStep("email");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification code",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTransfer = async () => {
    if (!selected) return;
    const code = emailCode.join("");
    if (code.length !== 6) {
      setEmailError("Enter the 6-digit code from your email.");
      return;
    }
    if (requireAuthenticator && code2fa.trim().length < 6) {
      setEmailError("Enter your authenticator or backup code.");
      return;
    }
    if (rail === "swift") {
      setEmailError(
        "International wire (SWIFT) is not available yet. Choose ACH or domestic wire.",
      );
      return;
    }

    if (!bridgeRail) {
      setEmailError(
        "International wire (SWIFT) is not available yet. Choose ACH or domestic wire.",
      );
      return;
    }

    setIsSubmitting(true);
    setEmailError("");
    try {
      const result = await withdrawBridgePayout(false, {
        currency: "USD",
        amount: parsedAmount,
        recipientId: selected.id,
        rail: bridgeRail,
        verificationCode: code,
        ...(code2fa.trim() ? { code2fa: code2fa.trim() } : {}),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
      });

      if (result.pending && result.withdrawalId) {
        await pollBridgePayoutWithdrawal(false, result.withdrawalId);
      }

      setTransferId(result.withdrawalId || result.bridgeTransferId || "");
      setFeeUsdc(result.feeUsdc ?? feeUsdc);
      setSubmittedAt(new Date());
      setStep("success");
      onSuccess?.();
    } catch (error) {
      const message = await handleSubmitError(error, requestEmail);
      setEmailError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[90vh] gap-0 overflow-y-auto rounded-2xl border-[#E4E7EC] p-6 sm:max-w-140",
          step === "new-recipient" && "sm:max-w-150",
        )}
      >
        {step !== "success" && step !== "email" ? (
          <div className="flex items-start gap-2">
            {step !== "rail" ? (
              <button
                type="button"
                onClick={goBack}
                className="mt-1 rounded-md text-[#0B0F1A] hover:bg-[#F2F4F7]"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-2xl font-semibold text-[#0B0F1A]">
                {step === "rail" && "How do you want to send?"}
                {step === "recipients" && "Who are you sending to?"}
                {step === "new-recipient" && "New recipient"}
                {step === "wire-details" && "Add wire details"}
                {step === "amount" && "How much are you sending?"}
                {step === "review" && "Review your transfer"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-[#6B7280]">
                {step === "rail" &&
                  "Pick a transfer type. Compare speed and limits below."}
                {step === "recipients" &&
                  (recipients.length === 0
                    ? "Recipients you add are saved for your next transfer."
                    : "Choose a saved recipient or add a new one.")}
                {step === "new-recipient" &&
                  "We'll save these details so you can pay them again in one click."}
                {step === "wire-details" &&
                  "Wire routing numbers are often different from ACH routing numbers."}
                {step === "amount" && null}
                {step === "review" &&
                  "Check everything carefully — wires can't be reversed once sent."}
              </DialogDescription>
            </div>
            <DialogClose className="mt-1 rounded-md p-1 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#0B0F1A]">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        ) : (
          <div className="flex justify-end">
            <DialogClose className="rounded-md p-1 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#0B0F1A]">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        )}

        <div className="py-5">
          {step === "rail" && (
            <RailStep
              rail={rail}
              onSelect={setRail}
              onContinue={() => {
                setSelectedId(null);
                setStep("recipients");
              }}
            />
          )}

          {step === "recipients" && (
            <RecipientsStep
              rail={rail}
              recipients={recipients}
              totalCount={recipients.length}
              isLoading={isRecipientsLoading}
              selectedId={selectedId}
              search={search}
              onSearchChange={setSearch}
              onSelect={setSelectedId}
              onAddWireDetails={(id) => {
                setWireDetailsId(id);
                setStep("wire-details");
              }}
              onAdd={() => setStep("new-recipient")}
              onContinue={() => {
                if (!selectedId) {
                  toast.error("Select a recipient to continue.");
                  return;
                }
                const next = recipients.find((item) => item.id === selectedId);
                if (!next?.ready) {
                  toast.error("This recipient is not ready for that transfer type.");
                  return;
                }
                setStep("amount");
              }}
            />
          )}

          {step === "new-recipient" && (
            <NewRecipientStep
              rail={rail}
              onCancel={() => setStep("recipients")}
              onSaved={(recipient) => {
                setRecipients((current) => {
                  const without = current.filter(
                    (item) => item.id !== recipient.id,
                  );
                  return [recipient, ...without];
                });
                setSelectedId(recipient.id);
                setStep("amount");
              }}
            />
          )}

          {step === "wire-details" && wireDetailsRecipient && (
            <WireDetailsStep
              recipient={wireDetailsRecipient}
              onCancel={() => {
                setWireDetailsId(null);
                setStep("recipients");
              }}
              onSaved={(recipient) => {
                setRecipients((current) =>
                  current.map((item) =>
                    item.id === recipient.id ? recipient : item,
                  ),
                );
                setSelectedId(recipient.id);
                setWireDetailsId(null);
                setStep("amount");
              }}
            />
          )}

          {step === "amount" && selected && (
            <AmountStep
              rail={rail}
              balance={walletBalance}
              amount={amount}
              onAmountChange={setAmount}
              purpose={purpose}
              onPurposeChange={setPurpose}
              reference={reference}
              onReferenceChange={setReference}
              invoice={invoice}
              onInvoiceChange={setInvoice}
              feeUsdc={feeUsdc}
              isQuoteLoading={isQuoteLoading}
              onContinue={() => {
                if (!amountValid) {
                  toast.error("Enter a valid amount.");
                  return;
                }
                if (parsedAmount > walletBalance) {
                  toast.error("Insufficient balance.");
                  return;
                }
                if (parsedAmount > 10000 && !invoice) {
                  toast.error("Invoice is required for amounts over $10,000.");
                  return;
                }
                if (rail === "ach" || rail === "wire") {
                  const maxRef = rail === "ach" ? 10 : 140;
                  if (reference.trim().length > maxRef) {
                    toast.error(
                      `Reference must be ${maxRef} characters or fewer.`,
                    );
                    return;
                  }
                }
                setConfirmed(false);
                setStep("review");
              }}
            />
          )}

          {step === "review" && selected && (
            <ReviewStep
              rail={rail}
              recipient={selected}
              amount={parsedAmount}
              purpose={purpose}
              reference={reference}
              invoiceName={invoice?.name}
              feeUsdc={feeUsdc}
              confirmed={confirmed}
              onConfirmedChange={setConfirmed}
              onEditRecipient={() => setStep("recipients")}
              onEditPayment={() => setStep("amount")}
              isSubmitting={isSubmitting}
              onSend={() => void startEmailStep()}
            />
          )}

          {step === "email" && (
            <EmailStep
              email={userEmail}
              code={emailCode}
              onCodeChange={setEmailCode}
              code2fa={code2fa}
              onCode2faChange={setCode2fa}
              requireAuthenticator={requireAuthenticator}
              error={emailError}
              isSubmitting={isSubmitting}
              onResend={() =>
                void requestEmail().catch((err) => {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to resend code",
                  );
                })
              }
              onConfirm={() => void submitTransfer()}
            />
          )}

          {step === "success" && selected && (
            <SuccessStep
              rail={rail}
              recipient={selected}
              amount={parsedAmount}
              reference={reference}
              feeUsdc={feeUsdc}
              transferId={transferId}
              submittedAt={submittedAt}
              onDone={close}
              onViewTransactions={() => {
                close();
                router.push("/dashboard/transactions");
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RailStep({
  rail,
  onSelect,
  onContinue,
}: {
  rail: SendRail;
  onSelect: (rail: SendRail) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {RAILS.map((option) => {
          const selected = rail === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                selected
                  ? "border-[#0052FF]"
                  : "border-[#E4E7EC] bg-white hover:bg-[#F9FAFB]",
              )}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#344054]">
                <Image
                  src={option.icon}
                  alt={option.title}
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#0B0F1A]">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-sm text-[#6B7280]">
                  {option.description}
                </span>
                <span className="mt-1 block text-sm text-[#374151] font-medium">
                  {option.meta}
                </span>
              </span>
              <RadioMark selected={selected} />
            </button>
          );
        })}
      </div>

      <hr />

      <div className="flex justify-end pt-2">
        <Button variant="primary" type="button" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function RecipientsStep({
  rail,
  recipients,
  totalCount,
  isLoading,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onAddWireDetails,
  onAdd,
  onContinue,
}: {
  rail: SendRail;
  recipients: SendRecipient[];
  totalCount: number;
  isLoading: boolean;
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onAddWireDetails: (id: string) => void;
  onAdd: () => void;
  onContinue: () => void;
}) {
  const empty = !isLoading && totalCount === 0 && !search.trim();

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center gap-3 rounded-xl border border-[#DCE1EA] bg-[#F3F5F9]! px-4 py-3 text-left hover:bg-[#F9FAFB]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-[#C5CCD8] text-[#101828]">
          <Plus className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#101828]">
            Add contact
          </span>
          <span className="block text-sm text-[#6B7280]">
            Enter bank details manually
          </span>
        </span>
      </button>

      {empty ? (
        <div className="rounded-xl border border-[#E4E7EC] bg-[#F8F9FB] px-5 py-8 text-center">
          <div className="mx-auto mb-6 w-full max-w-60 rounded-xl border border-[#E4E7EC] bg-white p-4 text-left">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 shrink-0 rounded-md bg-[#EEF2F6]" />
              <span className="h-2.5 flex-1 rounded bg-[#EEF2F6]" />
            </div>
            <div className="my-3 h-px bg-[#EEF2F6]" />
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 shrink-0 rounded-md bg-[#EEF2F6]" />
              <span className="flex-1 space-y-1.5">
                <span className="block h-2.5 rounded bg-[#EEF2F6]" />
                <span className="block h-2.5 w-2/3 rounded bg-[#EEF2F6]" />
              </span>
            </div>
          </div>
          <p className="text-base font-semibold text-[#101828]">
            Recipients appear here
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Add your first recipient to send a bank transfer
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={onAdd}
            className="mt-5"
          >
            <PlusCircle className="h-4 w-4" />
            Add contact
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name, email or account number"
              className="h-11 rounded-lg border-[#E4E7EC] pl-9"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#344054]">
              Saved recipients · {totalCount}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-[#667085]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : recipients.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#667085]">
              No recipients match that search.
            </p>
          ) : (
            <div className="space-y-2">
              {recipients.map((recipient) => {
                const selected = selectedId === recipient.id;
                const needsWire =
                  rail === "wire" && recipient.needsWireDetails;
                const notReady = !recipient.ready && !needsWire;
                return (
                  <button
                    key={recipient.id}
                    type="button"
                    disabled={notReady}
                    onClick={() => {
                      if (needsWire) {
                        onAddWireDetails(recipient.id);
                        return;
                      }
                      onSelect(recipient.id);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-[#0052FF]"
                        : "border-[#E4E7EC] bg-white hover:bg-[#F9FAFB]",
                      notReady && "opacity-60",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF3FF] text-sm font-semibold text-[#0052FF]">
                      {recipientInitials(recipient)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#101828]">
                        {recipientDisplayName(recipient)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#667085]">
                        {recipient.bankName} ••{recipient.last4} ·{" "}
                        {recipient.type === "business"
                          ? "Business"
                          : "Individual"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {recipient.rails.map((item) => (
                        <span
                          key={item}
                          className="rounded-md bg-[#F2F4F7] px-1.5 py-0.5 text-[11px] font-medium text-[#344054]"
                        >
                          {railShortLabel(item)}
                        </span>
                      ))}
                      {needsWire ? (
                        <span className="text-xs font-medium text-[#0052FF]">
                          Add wire details
                        </span>
                      ) : (
                        <RadioMark selected={selected} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={onContinue}
              disabled={!selectedId}
              className="h-11 rounded-lg bg-[#101828] px-6 text-white hover:bg-[#1D2939] disabled:opacity-50"
            >
              Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function NewRecipientStep({
  rail,
  onCancel,
  onSaved,
}: {
  rail: SendRail;
  onCancel: () => void;
  onSaved: (recipient: SendRecipient) => void;
}) {
  const [type, setType] = useState<SendRecipientType>("business");
  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("IL");
  const [postalCode, setPostalCode] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountKind, setAccountKind] = useState<SendAccountKind>("checking");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const bankLookup = lookupRoutingNumber(routingNumber);
  const bridgeRail = sendRailToBridge(rail);
  const streetAddress = addressLine1.trim();
  const stateCode = state.trim().toUpperCase();

  const submit = async () => {
    if (rail === "swift" || !bridgeRail) {
      toast.error(
        "International wire (SWIFT) is not available yet. Choose ACH or domestic wire.",
      );
      return;
    }
    if (type === "business") {
      const name = businessName.trim();
      if (name.length < 3 || name.length > 35) {
        toast.error("Business name must be 3 to 35 characters.");
        return;
      }
    }
    if (type === "individual") {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!firstName.trim() || !lastName.trim()) {
        toast.error("Enter first and last name.");
        return;
      }
      if (fullName.length < 3 || fullName.length > 35) {
        toast.error("Full name must be 3 to 35 characters.");
        return;
      }
    }
    if (!streetAddress || !city.trim() || !postalCode.trim()) {
      toast.error("Complete the address.");
      return;
    }
    if (streetAddress.length > 35) {
      toast.error("Street address must be 35 characters or fewer.");
      return;
    }
    if (!/^[A-Z]{2}$/.test(stateCode)) {
      toast.error("Select a valid US state.");
      return;
    }
    if (!/^\d{9}$/.test(routingNumber.trim())) {
      toast.error("Routing number must be 9 digits.");
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Account number is required.");
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      toast.error("Account numbers do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await createBridgePayoutRecipient(false, {
        currency: "USD",
        rail: bridgeRail,
        accountOwnerType: type,
        ...(type === "business"
          ? { businessName: businessName.trim() }
          : {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            }),
        ...(email.trim() ? { email: email.trim() } : {}),
        bankName: bankLookup?.bankName ?? "Bank",
        accountNumber: accountNumber.trim(),
        accountNumberConfirmation: confirmAccountNumber.trim(),
        routingNumber: routingNumber.trim(),
        accountKind: rail === "ach" ? accountKind : "checking",
        address: {
          line1: streetAddress,
          city: city.trim(),
          state: stateCode,
          postalCode: postalCode.trim(),
          country: "US",
        },
      });
      onSaved(bridgeRecipientToSend(saved));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save recipient",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#0B0F1A]">Recipient details</p>
        <div className="inline-flex rounded-lg bg-[#F3F4F6] p-1">
          {(
            [
              ["business", "Business", "/home/building.svg"],
              ["individual", "Individual", "/home/user.svg"],
            ] as const
          ).map(([value, label, icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                type === value
                  ? "bg-white text-[#0B0F1A] shadow-sm"
                  : "bg-transparent text-[#6B7280]",
              )}
            >
              <Image src={icon} alt="" width={15} height={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {type === "business" ? (
        <Field label="Legal business name">
          <Input
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
          />
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>
          <Field label="Last name">
            <Input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>
        </div>
      )}

      <Field label="Email (optional)">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field
        label={type === "individual" ? "Home address" : "Street address"}
        hint={`${streetAddress.length}/35`}
      >
        <Input
          value={addressLine1}
          maxLength={35}
          onChange={(event) => setAddressLine1(event.target.value)}
          placeholder="Street address"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="City">
          <Input
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </Field>
        <Field label="State">
          <Select
            value={stateCode}
            onValueChange={(value) => setState(value.toUpperCase())}
          >
            <SelectTrigger className="h-9 border-[#E4E7EC] w-full">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value} — {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="ZIP code">
          <Input
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-sm font-medium text-[#344054]">Bank details</p>
        <span className="rounded-md bg-[#F2F4F7] px-2 py-0.5 text-xs font-medium text-[#344054]">
          {railLabel(rail)}
        </span>
      </div>

      {rail === "swift" ? (
        <>
          <Field label="IBAN">
            <Input
              value={iban}
              onChange={(event) => setIban(event.target.value)}
            />
          </Field>
          <Field label="SWIFT / BIC">
            <Input
              value={bic}
              onChange={(event) => setBic(event.target.value)}
            />
          </Field>
        </>
      ) : (
        <>
          <Field
            label={
              rail === "wire"
                ? "Wire routing number (ABA)"
                : "Routing number (ABA)"
            }
          >
            <Input
              value={routingNumber}
              inputMode="numeric"
              maxLength={9}
              onChange={(event) => setRoutingNumber(event.target.value)}
            />
          </Field>
          {bankLookup ? (
            <div className="flex items-start gap-2 rounded-lg border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2.5 text-sm text-[#067647]">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">
                {bankLookup.bankName} {bankLookup.city}, {bankLookup.state} ·{" "}
                {bankLookup.accepts}
              </span>
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            </div>
          ) : null}
          <Field label="Account number">
            <Input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Confirm account number">
            <Input
              value={confirmAccountNumber}
              onChange={(event) => setConfirmAccountNumber(event.target.value)}
              autoComplete="off"
            />
          </Field>
          {rail === "ach" ? (
            <Field label="Account type">
              <Select
                value={accountKind}
                onValueChange={(value) =>
                  setAccountKind(value as SendAccountKind)
                }
              >
                <SelectTrigger className="h-9 border-[#E4E7EC]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => void submit()}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save & continue
        </Button>
      </div>
    </div>
  );
}

function WireDetailsStep({
  recipient,
  onCancel,
  onSaved,
}: {
  recipient: SendRecipient;
  onCancel: () => void;
  onSaved: (recipient: SendRecipient) => void;
}) {
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankName, setBankName] = useState(recipient.bankName || "");
  const [isSaving, setIsSaving] = useState(false);
  const bankLookup = lookupRoutingNumber(routingNumber);

  useEffect(() => {
    if (bankLookup?.bankName) {
      setBankName(bankLookup.bankName);
    }
  }, [bankLookup?.bankName]);

  const submit = async () => {
    if (!/^\d{9}$/.test(routingNumber.trim())) {
      toast.error("Wire routing number must be 9 digits.");
      return;
    }
    if (!bankName.trim()) {
      toast.error("Bank name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await addBridgePayoutWireDetails(false, recipient.id, {
        routingNumber: routingNumber.trim(),
        bankName: bankName.trim(),
      });
      onSaved(bridgeRecipientToSend(saved));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add wire details",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] px-4 py-3">
        <p className="text-sm font-semibold text-[#101828]">
          {recipientDisplayName(recipient)}
        </p>
        <p className="mt-0.5 text-xs text-[#667085]">
          {recipient.bankName} ••{recipient.last4}
        </p>
      </div>

      <Field label="Wire routing number (ABA)">
        <Input
          value={routingNumber}
          inputMode="numeric"
          maxLength={9}
          onChange={(event) => setRoutingNumber(event.target.value)}
        />
      </Field>

      {bankLookup ? (
        <div className="flex items-start gap-2 rounded-lg border border-[#ABEFC6] bg-[#ECFDF3] px-3 py-2.5 text-sm text-[#067647]">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">
            {bankLookup.bankName} {bankLookup.city}, {bankLookup.state} ·{" "}
            {bankLookup.accepts}
          </span>
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
        </div>
      ) : null}

      <Field label="Bank name">
        <Input
          value={bankName}
          onChange={(event) => setBankName(event.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => void submit()}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save & continue
        </Button>
      </div>
    </div>
  );
}

function AmountStep({
  rail,
  balance,
  amount,
  onAmountChange,
  purpose,
  onPurposeChange,
  reference,
  onReferenceChange,
  invoice,
  onInvoiceChange,
  feeUsdc,
  isQuoteLoading,
  onContinue,
}: {
  rail: SendRail;
  balance: number;
  amount: string;
  onAmountChange: (value: string) => void;
  purpose: string;
  onPurposeChange: (value: string) => void;
  reference: string;
  onReferenceChange: (value: string) => void;
  invoice: File | null;
  onInvoiceChange: (file: File | null) => void;
  feeUsdc: number;
  isQuoteLoading: boolean;
  onContinue: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cutoff = getWireCutoffInfo();
  const maxRef = rail === "ach" ? 10 : 140;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#0052FF] pt-3">
        <p className="px-4 text-sm font-medium text-[#667085]">Amount</p>
        <div className="mt-1 flex items-center gap-3 px-4">
          <span className="text-4xl font-semibold text-[#101828]">$</span>
          <Input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="0.00"
            className="h-14 border-0 bg-transparent px-0 text-4xl font-semibold text-[#101828] shadow-none focus-visible:ring-0 md:text-4xl"
            inputMode="decimal"
          />
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F3F4F6] border border-[#E4E7EC] px-2.5 py-1 text-sm font-medium text-[#344054]">
            <span className="text-sm">🇺🇸</span>
            USD
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[#667085] bg-[#F9FAFB] py-2 rounded-xl px-4">
          <span>Available: {formatUsd(balance)}</span>
          <span>Fee {isQuoteLoading ? "…" : formatUsd(feeUsdc || 0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Purpose of payment">
          <Select value={purpose} onValueChange={onPurposeChange}>
            <SelectTrigger className="h-10 border-[#E4E7EC] w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_PURPOSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Reference for recipient">
          <Input
            value={reference}
            maxLength={maxRef}
            onChange={(event) => onReferenceChange(event.target.value)}
            placeholder={
              rail === "ach" ? "Up to 10 characters" : "Invoice number"
            }
          />
        </Field>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-[#101828]">
          Invoice (required over $10,000)
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onInvoiceChange(event.target.files?.[0] ?? null);
          }}
        />
        {invoice ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#E4E7EC] px-3 py-3">
            <FileText className="h-5 w-5 text-[#667085]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#101828]">
                {invoice.name}
              </p>
              <p className="text-xs text-[#667085]">
                {(invoice.size / 1024).toFixed(0)} KB · Uploaded
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-[#0052FF]"
              onClick={() => fileRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="text-[#98A2B3]"
              onClick={() => onInvoiceChange(null)}
              aria-label="Remove invoice"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] px-3 py-6 text-sm text-[#667085] hover:bg-[#F9FAFB]"
          >
            Upload invoice PDF
          </button>
        )}
      </div>

      {rail === "wire" ? (
        <div className="flex items-start gap-2 rounded-xl border border-[#F9DBAF] bg-[#FFFAEB] px-3 py-3 text-sm text-[#B54708]">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {cutoff.beforeCutoff
              ? `Send by 4:00 PM ET (${cutoff.remainingLabel}) and it arrives today. After the cut-off, it goes out next business day.`
              : "Past the 4:00 PM ET cut-off — this wire goes out next business day."}
          </p>
        </div>
      ) : null}

      <div className="flex justify-end pt-1">
        <Button
          type="button"
          onClick={onContinue}
          className="h-11 rounded-lg bg-[#101828] px-5 text-white hover:bg-[#1D2939]"
        >
          Review transfer
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({
  rail,
  recipient,
  amount,
  purpose,
  reference,
  invoiceName,
  feeUsdc,
  confirmed,
  onConfirmedChange,
  onEditRecipient,
  onEditPayment,
  isSubmitting,
  onSend,
}: {
  rail: SendRail;
  recipient: SendRecipient;
  amount: number;
  purpose: string;
  reference: string;
  invoiceName?: string;
  feeUsdc: number;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  onEditRecipient: () => void;
  onEditPayment: () => void;
  isSubmitting: boolean;
  onSend: () => void;
}) {
  const cutoff = getWireCutoffInfo();
  const name = recipientDisplayName(recipient);
  const total = amount + feeUsdc;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#E4E7EC] bg-[#EEF3FF] p-4">
        <span className="text-sm font-normal text-[#6B7280]">
          You&apos;re sending
        </span>
        <p className="text-3xl font-semibold text-[#0B0F1A]">
          {formatUsd(amount)}
        </p>
        <p className="mt-1 text-sm text-[#374151]">to {name}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0052FF]">
            <Zap className="h-3 w-3" />
            {railLabel(rail)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0052FF]">
            <Clock className="h-3 w-3" />
            {rail === "wire"
              ? cutoff.beforeCutoff
                ? "Arrives today by 6:00 PM ET"
                : "Arrives next business day"
              : rail === "ach"
                ? "Arrives in 1–3 business days"
                : "Arrives in 1–3 business days"}
          </span>
        </div>
      </div>

      <SectionCard title="Recipient" onEdit={onEditRecipient}>
        <DetailRow label="Name" value={name} />
        <DetailRow
          label="Bank"
          value={`${recipient.bankName} ••${recipient.last4}`}
        />
        {recipient.routingNumber ? (
          <DetailRow label="Routing (ABA)" value={recipient.routingNumber} />
        ) : null}
        <DetailRow
          label="Address"
          value={`${recipient.addressLine1}, ${recipient.city}, ${recipient.state} ${recipient.postalCode}`}
        />
      </SectionCard>

      <SectionCard title="Payment" onEdit={onEditPayment}>
        <DetailRow label="From" value="USD wallet" />
        <DetailRow label="Purpose" value={purpose} />
        <DetailRow label="Reference" value={reference || "—"} />
        {invoiceName ? <DetailRow label="Invoice" value={invoiceName} /> : null}
      </SectionCard>

      <div className="space-y-2 rounded-xl border border-[#E4E7EC] bg-[#FAFAFB] px-4 py-3 text-sm">
        <div className="flex justify-between text-[#6B7280]">
          <span>Transfer fee</span>
          <span className="font-medium text-[#101828]">
            {formatUsd(feeUsdc)}
          </span>
        </div>
        <div className="flex justify-between text-[#6B7280]">
          <span>Total debited from your account</span>
          <span className="font-medium text-[#0B0F1A]">{formatUsd(total)}</span>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-[#101828]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => onConfirmedChange(event.target.checked)}
          className="mt-0.5 accent-[#0052FF] h-4 w-4 rounded-sm"
        />
        I&apos;ve confirmed these account details with {name}.
      </label>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!confirmed || isSubmitting}
          onClick={onSend}
          className="h-11 rounded-lg bg-[#0052FF] px-6 text-white hover:bg-[#0041CC]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending code...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  );
}

function EmailStep({
  email,
  code,
  onCodeChange,
  code2fa,
  onCode2faChange,
  requireAuthenticator,
  error,
  isSubmitting,
  onResend,
  onConfirm,
}: {
  email?: string;
  code: string[];
  onCodeChange: (code: string[]) => void;
  code2fa: string;
  onCode2faChange: (value: string) => void;
  requireAuthenticator: boolean;
  error: string;
  isSubmitting: boolean;
  onResend: () => void;
  onConfirm: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    onCodeChange(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = [...code];
    [...pasted].forEach((digit, i) => {
      next[i] = digit;
    });
    onCodeChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const ready =
    code.every(Boolean) &&
    (!requireAuthenticator || code2fa.trim().length >= 6);

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3FF]">
        <Mail className="h-6 w-6 text-[#0052FF]" />
      </div>
      <div>
        <DialogTitle className="text-3xl font-semibold text-[#101828]">
          Check your email
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-[#6B7280]">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-[#0B0F1A]">
            {email || "your email"}
          </span>
          .
        </DialogDescription>
      </div>

      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={digit}
            inputMode="numeric"
            maxLength={1}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="h-12 w-12 rounded-md border-[#D0D5DD] text-center text-lg font-semibold"
            disabled={isSubmitting}
          />
        ))}
      </div>

      {requireAuthenticator ? (
        <div className="mx-auto max-w-xs text-left">
          <label className="mb-1.5 block text-sm font-medium text-[#344054]">
            Authenticator or backup code
          </label>
          <Input
            value={code2fa}
            onChange={(event) => onCode2faChange(event.target.value)}
            placeholder="123456 or 7KQ2M-XW4PA"
            disabled={isSubmitting}
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-[#D92D20]">{error}</p> : null}

      <Button
        type="button"
        disabled={!ready || isSubmitting}
        onClick={onConfirm}
        className="h-11 w-full rounded-lg bg-[#101828] text-white hover:bg-[#1D2939]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : (
          "Confirm & send"
        )}
      </Button>

      <button
        type="button"
        onClick={onResend}
        disabled={isSubmitting}
        className="text-sm text-[#667085]"
      >
        Didn&apos;t get the email?{" "}
        <span className="font-medium text-[#0052FF]">Resend code</span>
      </button>
    </div>
  );
}

function SuccessStep({
  rail,
  recipient,
  amount,
  reference,
  feeUsdc,
  transferId,
  submittedAt,
  onDone,
  onViewTransactions,
}: {
  rail: SendRail;
  recipient: SendRecipient;
  amount: number;
  reference: string;
  feeUsdc: number;
  transferId: string;
  submittedAt: Date | null;
  onDone: () => void;
  onViewTransactions: () => void;
}) {
  const cutoff = getWireCutoffInfo();
  const name = recipientDisplayName(recipient);
  const timeLabel = submittedAt
    ? submittedAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const copyId = async () => {
    if (!transferId) return;
    try {
      await navigator.clipboard.writeText(transferId);
      toast.success("Transfer ID copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFAE6]">
        <Check className="h-7 w-7 text-[#079455]" strokeWidth={2.5} />
      </div>
      <div>
        <DialogTitle className="text-2xl font-bold text-[#0B0F1A]">
          Transfer submitted
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-[#6B7280]">
          Your {rail === "ach" ? "ACH" : rail === "wire" ? "wire" : "transfer"}{" "}
          to {name} is on its way.
        </DialogDescription>
      </div>

      <div>
        <p className="text-3xl font-semibold text-[#0B0F1A]">
          {formatUsd(amount)}
        </p>
        <p className="mt-1 text-sm font-medium text-[#0052FF]">
          {rail === "wire"
            ? cutoff.beforeCutoff
              ? "Arrives today by 6:00 PM ET"
              : "Arrives next business day"
            : "Arrives in 1–3 business days"}
        </p>
      </div>

      <div className="flex items-start justify-between gap-2 px-2 text-left text-xs">
        <StatusNode done label="Submitted" detail={timeLabel} />
        <div className="mt-2 h-px flex-1 bg-[#D0D5DD]" />
        <StatusNode
          current
          label="Processing"
          detail={
            rail === "wire"
              ? "Via Fedwire"
              : rail === "ach"
                ? "Via ACH"
                : "Via SWIFT"
          }
        />
        <div className="mt-2 h-px flex-1 bg-[#D0D5DD]" />
        <StatusNode
          label="Delivered"
          detail={
            rail === "wire"
              ? cutoff.beforeCutoff
                ? "By 6:00 PM ET"
                : "Next business day"
              : "1–3 business days"
          }
        />
      </div>

      <div className="space-y-2.5 rounded-xl border border-[#E4E7EC] px-4 py-3 text-left text-sm">
        <DetailRow label="Recipient" value={name} />
        <DetailRow
          label="Bank"
          value={`${recipient.bankName} ••${recipient.last4}`}
        />
        <DetailRow label="Method" value={railLabel(rail)} />
        <DetailRow label="Reference" value={reference || "—"} />
        <DetailRow label="Fee" value={formatUsd(feeUsdc)} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#667085]">Transfer ID</span>
          <button
            type="button"
            onClick={() => void copyId()}
            className="inline-flex items-center gap-1.5 font-medium text-[#101828]"
          >
            {transferId || "—"}
            {transferId ? (
              <Copy className="h-3.5 w-3.5 text-[#667085]" />
            ) : null}
          </button>
        </div>
      </div>

      <p className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
        <Mail className="h-4 w-4" />
        We&apos;ll email you and the recipient when it arrives.
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-lg border-[#D0D5DD]"
          onClick={() => toast.success("Receipt download coming soon")}
        >
          Download receipt
        </Button>
        <Button
          type="button"
          onClick={onDone}
          className="h-11 flex-1 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
        >
          Done
        </Button>
      </div>

      <button
        type="button"
        onClick={onViewTransactions}
        className="text-sm font-medium text-[#0052FF]"
      >
        View in Transactions
      </button>
    </div>
  );
}

function RadioMark({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0052FF]">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
    );
  }

  return (
    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-[#D0D5DD] bg-white" />
  );
}

function StatusNode({
  label,
  detail,
  done,
  current,
}: {
  label: string;
  detail: string;
  done?: boolean;
  current?: boolean;
}) {
  return (
    <div className="flex w-20 flex-col items-center text-center">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border",
          done && "border-[#079455] bg-[#079455]",
          current && "border-[#0052FF] bg-white",
          !done && !current && "border-[#D0D5DD] bg-white",
        )}
      >
        {done ? <Check className="h-3 w-3 text-white" /> : null}
      </span>
      <p className="mt-2 font-medium text-[#101828]">{label}</p>
      <p className="text-[#667085]">{detail}</p>
    </div>
  );
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] px-4 py-3 text-left">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#101828]">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-[#0052FF]"
        >
          Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-[#6B7280]">{label}</span>
      <span className="text-right font-medium text-[#0B0F1A]">{value}</span>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="text-left">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-[#0B0F1A]">
          {label}
        </label>
        {hint ? (
          <span className="text-xs text-[#98A2B3]">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
