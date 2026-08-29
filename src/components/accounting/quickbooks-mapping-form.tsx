"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getQuickBooksAccounts,
  type QuickBooksAccount,
  type QuickBooksMapping,
  type QuickBooksMappingPayload,
  updateQuickBooksMapping,
} from "@/lib/quickbooks-service";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface QuickBooksMappingFormProps {
  initialMapping?: QuickBooksMapping;
  onSaved: () => void;
  canManage?: boolean;
}

type MappingField =
  | "bankAccountId"
  | "payrollExpenseAccountId"
  | "feeExpenseAccountId"
  | "incomeAccountId"
  | "withdrawalAccountId";

const FIELD_CONFIG: Array<{
  idKey: MappingField;
  nameKey: keyof QuickBooksMapping;
  label: string;
  required?: boolean;
  helper?: string;
  filter: (account: QuickBooksAccount) => boolean;
}> = [
  {
    idKey: "bankAccountId",
    nameKey: "bankAccountName",
    label: "Bank account",
    required: true,
    helper: "Used for pay-ins, payroll, and withdrawals.",
    filter: (account) => account.accountType === "Bank",
  },
  {
    idKey: "payrollExpenseAccountId",
    nameKey: "payrollExpenseAccountName",
    label: "Payroll expense account",
    required: true,
    helper: "Used for payroll journal entries.",
    filter: (account) => account.accountType === "Expense",
  },
  {
    idKey: "feeExpenseAccountId",
    nameKey: "feeExpenseAccountName",
    label: "Fee expense account",
    helper: "Optional. Falls back to payroll expense if empty.",
    filter: (account) => account.accountType === "Expense",
  },
  {
    idKey: "incomeAccountId",
    nameKey: "incomeAccountName",
    label: "Income account",
    helper: "Optional. Used for pay-in transactions.",
    filter: (account) => account.accountType === "Income",
  },
  {
    idKey: "withdrawalAccountId",
    nameKey: "withdrawalAccountName",
    label: "Withdrawal account",
    helper: "Optional. Used for crypto withdrawals.",
    filter: (account) =>
      account.accountType === "Equity" || account.accountType === "Expense",
  },
];

function getAccountLabel(account: QuickBooksAccount) {
  return account.fullyQualifiedName || account.name;
}

export function QuickBooksMappingForm({
  initialMapping,
  onSaved,
  canManage = true,
}: QuickBooksMappingFormProps) {
  const [accounts, setAccounts] = useState<QuickBooksAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [values, setValues] = useState<Record<MappingField, string>>({
    bankAccountId: initialMapping?.bankAccountId ?? "",
    payrollExpenseAccountId: initialMapping?.payrollExpenseAccountId ?? "",
    feeExpenseAccountId: initialMapping?.feeExpenseAccountId ?? "",
    incomeAccountId: initialMapping?.incomeAccountId ?? "",
    withdrawalAccountId: initialMapping?.withdrawalAccountId ?? "",
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        const data = await getQuickBooksAccounts();
        setAccounts(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load QuickBooks accounts",
        );
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    void loadAccounts();
  }, []);

  const accountOptions = useMemo(() => {
    return FIELD_CONFIG.reduce(
      (acc, field) => {
        acc[field.idKey] = accounts.filter(field.filter);
        return acc;
      },
      {} as Record<MappingField, QuickBooksAccount[]>,
    );
  }, [accounts]);

  const handleSelectChange = (field: MappingField, accountId: string) => {
    setValues((current) => ({ ...current, [field]: accountId }));
  };

  const handleSubmit = async () => {
    if (!values.bankAccountId || !values.payrollExpenseAccountId) {
      toast.error("Bank account and payroll expense account are required.");
      return;
    }

    const findAccount = (id: string) =>
      accounts.find((account) => account.id === id);

    const bankAccount = findAccount(values.bankAccountId);
    const payrollExpenseAccount = findAccount(values.payrollExpenseAccountId);

    if (!bankAccount || !payrollExpenseAccount) {
      toast.error("Please select valid accounts.");
      return;
    }

    const payload: QuickBooksMappingPayload = {
      bankAccountId: bankAccount.id,
      bankAccountName: getAccountLabel(bankAccount),
      payrollExpenseAccountId: payrollExpenseAccount.id,
      payrollExpenseAccountName: getAccountLabel(payrollExpenseAccount),
    };

    const optionalFields: Array<{
      idKey: MappingField;
      nameKey: keyof QuickBooksMapping;
    }> = [
      { idKey: "feeExpenseAccountId", nameKey: "feeExpenseAccountName" },
      { idKey: "incomeAccountId", nameKey: "incomeAccountName" },
      { idKey: "withdrawalAccountId", nameKey: "withdrawalAccountName" },
    ];

    for (const field of optionalFields) {
      const accountId = values[field.idKey];
      if (!accountId) continue;

      const account = findAccount(accountId);
      if (!account) continue;

      if (field.idKey === "feeExpenseAccountId") {
        payload.feeExpenseAccountId = account.id;
        payload.feeExpenseAccountName = getAccountLabel(account);
      } else if (field.idKey === "incomeAccountId") {
        payload.incomeAccountId = account.id;
        payload.incomeAccountName = getAccountLabel(account);
      } else if (field.idKey === "withdrawalAccountId") {
        payload.withdrawalAccountId = account.id;
        payload.withdrawalAccountName = getAccountLabel(account);
      }
    }

    try {
      setIsSaving(true);
      await updateQuickBooksMapping(payload);
      toast.success("QuickBooks account mapping saved.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save account mapping",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#0052FF]" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#101828]">
          Map QuickBooks accounts
        </h3>
        <p className="mt-1 text-sm text-[#667085]">
          Choose which QuickBooks accounts Helicode should use before syncing
          transactions.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {FIELD_CONFIG.map((field) => (
          <div key={field.idKey}>
            <label className="mb-1.5 block text-sm font-medium text-[#0F112A]">
              {field.label}
              {field.required && <span className="text-[#FF3F3F]"> *</span>}
            </label>
            <Select
              value={values[field.idKey] || undefined}
              onValueChange={(value) => handleSelectChange(field.idKey, value)}
              disabled={!canManage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {accountOptions[field.idKey].map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {getAccountLabel(account)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helper && (
              <p className="mt-1 text-xs text-[#667085]">{field.helper}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canManage || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save mapping"
          )}
        </Button>
      </div>
    </div>
  );
}
