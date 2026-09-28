"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LocalAccount } from "@/lib/local-accounts";

interface AccountLiveDialogProps {
  account: LocalAccount | null;
  companyName: string;
  onOpenChange: (open: boolean) => void;
}

export function AccountLiveDialog({
  account,
  companyName,
  onOpenChange,
}: AccountLiveDialogProps) {
  const router = useRouter();

  if (!account) return null;

  const fields = account.fields.map((field) =>
    field.label === "Account name"
      ? { ...field, value: `${companyName} Ltd` }
      : field,
  );

  const share = async () => {
    const text = fields
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Account details copied");
  };

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/account/success.svg"
            alt="Check"
            width={64}
            height={64}
          />

          <DialogTitle className="mt-4 text-xl font-semibold text-[#101828]">
            Your {account.name} account is live
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-[#667085]">
            Share these details with clients to receive {account.code}. Money
            lands in your balance within minutes.
          </DialogDescription>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-[#EAECF0]">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-3 items-center border-b border-[#EAECF0] px-4 py-3 last:border-b-0"
            >
              <span className="text-sm text-[#667085]">{field.label}</span>
              <span className="text-sm font-medium text-[#101828]">
                {field.value}
              </span>
              <button
                type="button"
                className="justify-self-end text-sm font-semibold text-[#0052FF]"
                onClick={() => copyValue(field.value)}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-[#D0D5DD]"
            onClick={share}
          >
            Share details
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#0052FF] text-white hover:bg-[#0041CC]"
            onClick={() => {
              onOpenChange(false);
              router.push(`/dashboard/accounts/${account.code.toLowerCase()}`);
            }}
          >
            Go to {account.code} account
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-[#667085]">
          Tip: set {account.code} as the payout currency for your{" "}
          {account.code === "GHS" ? "Ghana" : account.name}-based team in
          Payroll.
        </p>
      </DialogContent>
    </Dialog>
  );
}
