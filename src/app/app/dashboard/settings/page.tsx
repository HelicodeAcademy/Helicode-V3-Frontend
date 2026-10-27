"use client";

import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { PageTitleContext } from "../layout";
import {
  CompanyDetailsResponse,
  getCompanyDetails,
} from "@/lib/company-details";
import toast from "react-hot-toast";
import { useKYCStore } from "@/store/kyc-store";
import { getKYCStatus } from "@/lib/kyc-service";
import { cn } from "@/lib/utils";
import { GeneralSettingsTab } from "@/components/settings/general-settings-tab";
import { MyAccountSettingsTab } from "@/components/settings/my-account-settings-tab";
import { MembersSettingsTab } from "@/components/settings/members-settings-tab";
import { SecuritySettingsTab } from "@/components/settings/security-settings-tab";

type SettingsTab = "general" | "account" | "members" | "security";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "account", label: "My account" },
  { id: "members", label: "Members" },
  { id: "security", label: "Security" },
];

function SettingsPageContent() {
  const { setTitle } = useContext(PageTitleContext);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    searchParams.get("tab") === "security" ? "security" : "general",
  );
  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setKYCStatus } = useKYCStore();

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCompanyDetails();
      setCompanyDetails(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch company details";
      toast.error(errorMessage);
      console.error("Failed to fetch company details", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchKyc = useEffectEvent(async () => {
    try {
      const status = await getKYCStatus();
      setKYCStatus(status);
    } catch (error) {
      console.error("Failed to fetch KYC status", error);
    }
  });

  useEffect(() => {
    setTitle("Settings");
    void fetchCompanyDetails();
    fetchKyc();
  }, [setTitle, fetchCompanyDetails]);

  useEffect(() => {
    if (searchParams.get("tab") === "security") {
      setActiveTab("security");
    }
  }, [searchParams]);

  return (
    <div className="px-4 py-6 sm:px-8 space-y-6">
      <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#EFF4FF] text-[#0052FF]"
                : "bg-[#EEEEEE] text-[#B6B6B6] hover:bg-[#E4E7EC]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && activeTab !== "security" ? (
        <div className="space-y-4 max-w-3xl">
          <div className="h-24 rounded-2xl bg-[#F2F4F7] animate-pulse" />
          <div className="h-28 rounded-2xl bg-[#F2F4F7] animate-pulse" />
        </div>
      ) : (
        <>
          {activeTab === "general" && (
            <GeneralSettingsTab
              companyDetails={companyDetails}
              onRefreshCompanyDetails={fetchCompanyDetails}
            />
          )}
          {activeTab === "account" && (
            <MyAccountSettingsTab companyDetails={companyDetails} />
          )}
          {activeTab === "members" && (
            <MembersSettingsTab companyDetails={companyDetails} />
          )}
          {activeTab === "security" && <SecuritySettingsTab />}
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 sm:px-8 space-y-6">
          <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
            <div className="h-9 w-20 rounded-full bg-[#F2F4F7] animate-pulse" />
            <div className="h-9 w-28 rounded-full bg-[#F2F4F7] animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-[#F2F4F7] animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-[#F2F4F7] animate-pulse" />
          </div>
          <div className="space-y-4 max-w-3xl">
            <div className="h-24 rounded-2xl bg-[#F2F4F7] animate-pulse" />
            <div className="h-28 rounded-2xl bg-[#F2F4F7] animate-pulse" />
          </div>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
