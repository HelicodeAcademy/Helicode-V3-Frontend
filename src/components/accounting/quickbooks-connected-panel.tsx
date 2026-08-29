"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuickBooksMappingForm } from "@/components/accounting/quickbooks-mapping-form";
import {
  disconnectQuickBooks,
  syncQuickBooks,
  type QuickBooksStatus,
} from "@/lib/quickbooks-service";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface QuickBooksConnectedPanelProps {
  status: QuickBooksStatus;
  onRefresh: () => Promise<unknown>;
  canManage?: boolean;
}

function formatDate(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusBadgeClass(status: QuickBooksStatus["status"]) {
  switch (status) {
    case "CONNECTED":
      return "bg-[#ECFDF3] text-[#12B76A] border-[#CAEFDC]";
    case "EXPIRED":
      return "bg-[#FFEFE2] text-[#EE7D1F] border-[#E5D7CB]";
    default:
      return "bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]";
  }
}

export function QuickBooksConnectedPanel({
  status,
  onRefresh,
  canManage = true,
}: QuickBooksConnectedPanelProps) {
  const [isEditingMapping, setIsEditingMapping] = useState(
    !status.mappingComplete,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [syncFrom, setSyncFrom] = useState("");
  const [syncTo, setSyncTo] = useState("");

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncQuickBooks({
        ...(syncFrom ? { from: syncFrom } : {}),
        ...(syncTo ? { to: syncTo } : {}),
      });
      toast.success(
        result.queued > 0
          ? `Queued ${result.queued} transactions for QuickBooks sync.`
          : "No new transactions to sync.",
      );
      await onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to queue QuickBooks sync",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnectQuickBooks();
      toast.success("QuickBooks disconnected.");
      setShowDisconnectDialog(false);
      await onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to disconnect QuickBooks",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-6">
      <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Image
              src="/home/quickbooks.svg"
              alt="QuickBooks"
              width={56}
              height={56}
              className="h-14 w-14"
            />
            <div>
              <h2 className="text-2xl font-semibold text-[#101828]">
                QuickBooks Online
              </h2>
              <p className="mt-1 text-sm text-[#475367] font-medium">
                {status.companyName || "Connected company"}
                {status.environment ? ` · ${status.environment}` : ""}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClass(status.status)}`}
              >
                {status.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {status.mappingComplete && (
              <Button
                variant="outline"
                onClick={() => setIsEditingMapping((current) => !current)}
                disabled={!canManage}
              >
                {isEditingMapping ? "Hide mapping" : "Edit mapping"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(true)}
              disabled={!canManage || isDisconnecting}
            >
              Disconnect
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] p-4">
            <p className="text-sm text-[#475367]">Synced</p>
            <p className="mt-2 text-2xl font-semibold text-[#101828]">
              {status.sync.synced}
            </p>
          </div>
          <div className="rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] p-4">
            <p className="text-sm text-[#475367]">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-[#101828]">
              {status.sync.pending}
            </p>
          </div>
          <div className="rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] p-4">
            <p className="text-sm text-[#475367]">Failed</p>
            <p className="mt-2 text-2xl font-semibold text-[#101828]">
              {status.sync.failed}
            </p>
          </div>
          <div className="rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] p-4">
            <p className="text-sm text-[#475367]">Last sync</p>
            <p className="mt-2 text-sm font-semibold text-[#101828]">
              {formatDate(status.lastSyncAt)}
            </p>
          </div>
        </div>

        {status.lastError && (
          <div className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
            Last sync error: {status.lastError}
          </div>
        )}
      </div>

      {(isEditingMapping || !status.mappingComplete) && (
        <QuickBooksMappingForm
          initialMapping={status.mapping}
          onSaved={async () => {
            setIsEditingMapping(false);
            await onRefresh();
          }}
          canManage={canManage}
        />
      )}

      {!isEditingMapping && status.mappingComplete && (
        <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
          <h3 className="text-lg font-semibold text-[#101828]">
            Account mapping
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ["Bank account", status.mapping.bankAccountName],
              ["Payroll expense", status.mapping.payrollExpenseAccountName],
              ["Fee expense", status.mapping.feeExpenseAccountName],
              ["Income account", status.mapping.incomeAccountName],
              ["Withdrawal account", status.mapping.withdrawalAccountName],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[#E4E7EC] px-4 py-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-[#101828]">
                  {value || "Not set"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#101828]">
              Sync transactions
            </h3>
            <p className="mt-1 text-sm text-[#667085]">
              Queue successful wallet transactions to post as QuickBooks journal
              entries.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#667085]">
                From
              </label>
              <Input
                type="date"
                value={syncFrom}
                onChange={(event) => setSyncFrom(event.target.value)}
                className="w-full sm:w-40"
                disabled={!canManage}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#667085]">
                To
              </label>
              <Input
                type="date"
                value={syncTo}
                onChange={(event) => setSyncTo(event.target.value)}
                className="w-full sm:w-40"
                disabled={!canManage}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSync}
              disabled={!canManage || !status.mappingComplete || isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync now"
              )}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect QuickBooks?</AlertDialogTitle>
            <AlertDialogDescription>
              This revokes the Intuit connection for your company. Sync history
              is kept, but new transactions will not post until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDisconnect();
              }}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
