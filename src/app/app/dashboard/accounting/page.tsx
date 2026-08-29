"use client";

import { Suspense, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleContext } from "../layout";
import { QuickBooksConnectCard } from "@/components/accounting/quickbooks-connect-card";
import { QuickBooksConnectedPanel } from "@/components/accounting/quickbooks-connected-panel";
import { hasCompanyAdminPermission } from "@/lib/permissions";
import {
  disconnectQuickBooks,
  getQuickBooksConnectUrl,
  getQuickBooksStatus,
  type QuickBooksStatus,
} from "@/lib/quickbooks-service";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function AccountingPageContent() {
  const { setTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<QuickBooksStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const handledQueryRef = useRef<string | null>(null);

  const canReadQuickBooks = hasCompanyAdminPermission("QUICKBOOKS_MANAGE", "READ");
  const canManageQuickBooks = hasCompanyAdminPermission(
    "QUICKBOOKS_MANAGE",
    "WRITE",
  );

  const clearQueryParams = useCallback(() => {
    router.replace("/dashboard/accounting");
  }, [router]);

  const loadStatus = useCallback(async () => {
    const data = await getQuickBooksStatus();
    setStatus(data);
    return data;
  }, []);

  const handleConnect = useCallback(async () => {
    if (!canManageQuickBooks) {
      toast.error("You do not have permission to connect QuickBooks.");
      return;
    }

    try {
      setIsConnecting(true);
      const { authorizeUrl } = await getQuickBooksConnectUrl();
      window.location.href = authorizeUrl;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start QuickBooks connection",
      );
      setIsConnecting(false);
    }
  }, [canManageQuickBooks]);

  useEffect(() => {
    setTitle("Accounting");
  }, [setTitle]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        await loadStatus();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load QuickBooks status",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStatus();
  }, [loadStatus]);

  useEffect(() => {
    const qbo = searchParams.get("qbo");
    const message = searchParams.get("message");
    const queryKey = `${qbo ?? ""}:${message ?? ""}`;

    if (!qbo || handledQueryRef.current === queryKey) {
      return;
    }

    handledQueryRef.current = queryKey;

    const handleQuery = async () => {
      if (qbo === "connected") {
        toast.success("QuickBooks connected successfully.");
        try {
          await loadStatus();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Connected, but failed to refresh QuickBooks status",
          );
        }
        clearQueryParams();
        return;
      }

      if (qbo === "error") {
        toast.error(
          message
            ? decodeURIComponent(message)
            : "QuickBooks connection failed.",
        );
        clearQueryParams();
        return;
      }

      if (qbo === "connect") {
        clearQueryParams();
        await handleConnect();
        return;
      }

      if (qbo === "disconnect") {
        if (!canManageQuickBooks) {
          toast.error("You do not have permission to disconnect QuickBooks.");
          clearQueryParams();
          return;
        }

        try {
          await disconnectQuickBooks();
          toast.success("QuickBooks disconnected.");
          await loadStatus();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to disconnect QuickBooks",
          );
        } finally {
          clearQueryParams();
        }
      }
    };

    void handleQuery();
  }, [
    canManageQuickBooks,
    clearQueryParams,
    handleConnect,
    loadStatus,
    searchParams,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0052FF]" />
      </div>
    );
  }

  if (!canReadQuickBooks) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-8">
        <div className="max-w-lg rounded-2xl border border-[#E4E7EC] bg-white px-8 py-10 text-center">
          <h2 className="text-xl font-semibold text-[#101828]">
            QuickBooks access required
          </h2>
          <p className="mt-3 text-sm text-[#667085]">
            Your account does not have permission to view or manage the
            QuickBooks integration. Ask a company owner to grant QuickBooks
            manage access.
          </p>
        </div>
      </div>
    );
  }

  const showConnected =
    status?.connected && status.status !== "DISCONNECTED" && status.status !== "EXPIRED";

  if (!showConnected) {
    return (
      <QuickBooksConnectCard
        onConnect={handleConnect}
        isConnecting={isConnecting}
        canManage={canManageQuickBooks}
        isReconnect={status?.status === "EXPIRED"}
      />
    );
  }

  return (
    <QuickBooksConnectedPanel
      status={status!}
      onRefresh={async () => {
        await loadStatus();
      }}
      canManage={canManageQuickBooks}
    />
  );
}

export default function AccountingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0052FF]" />
        </div>
      }
    >
      <AccountingPageContent />
    </Suspense>
  );
}
