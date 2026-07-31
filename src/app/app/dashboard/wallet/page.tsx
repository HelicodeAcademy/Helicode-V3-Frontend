"use client";

import { useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../layout";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { TransactionsTable } from "@/components/wallet/transactions-table";
import { FundWalletModal } from "@/components/wallet/fund-wallet-modal";
import { FundCryptoModal } from "@/components/wallet/fund-crypto-modal";
import { FundCardModal } from "@/components/wallet/fund-card-modal";
import { WalletFundedModal } from "@/components/wallet/wallet-funded-modal";
import { WithdrawFundsModal } from "@/components/wallet/withdraw-funds-modal";
import {
  formatKycStatusLabel,
  isKycFullyApproved,
  needsUserKycAction,
  useKYCStore,
} from "@/store/kyc-store";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { getKYCStatus } from "@/lib/kyc-service";
import { getCompanyDetails } from "@/lib/company-details";
import toast from "react-hot-toast";

export default function WalletPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { kycStatus, setKYCStatus } = useKYCStore();
  const [fundWalletOpen, setFundWalletOpen] = useState(false);
  const [fundCryptoOpen, setFundCryptoOpen] = useState(false);
  const [fundCardOpen, setFundCardOpen] = useState(false);
  const [fundedSuccessOpen, setFundedSuccessOpen] = useState(false);
  const [withdrawFundsOpen, setWithdrawFundsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canFund, setCanFund] = useState<boolean | null>(null);

  useEffect(() => {
    setTitle("Wallet");
  }, [setTitle]);

  useEffect(() => {
    const load = async () => {
      try {
        const [status, company] = await Promise.all([
          getKYCStatus(),
          getCompanyDetails(),
        ]);
        setKYCStatus(status);
        setCanFund(
          company.kyc?.canCreateActivePayrollGroup ??
            isKycFullyApproved(status),
        );
      } catch (error) {
        console.error("Failed to load wallet eligibility", error);
      }
    };
    void load();
  }, [setKYCStatus]);

  const verificationApproved = isKycFullyApproved(kycStatus);
  const fundingLocked =
    canFund === false || (canFund === null && !verificationApproved);

  const handleFundWallet = () => {
    if (fundingLocked) {
      toast.error("Complete account verification before funding your wallet.");
      return;
    }
    setFundWalletOpen(true);
  };

  const handleWithdraw = () => {
    if (fundingLocked) {
      toast.error("Complete account verification before withdrawing funds.");
      return;
    }
    setWithdrawFundsOpen(true);
  };

  const handleSelectCrypto = () => {
    setFundWalletOpen(false);
    setFundCryptoOpen(true);
  };

  const handleSelectCard = () => {
    setFundWalletOpen(false);
    setFundCardOpen(true);
  };

  const openLink = async (type: "kyc" | "tos") => {
    try {
      setIsRefreshing(true);
      const latest = await getKYCStatus();
      setKYCStatus(latest);
      const link = type === "kyc" ? latest.kycLink : latest.tosLink;
      if (!link) {
        toast.error(
          type === "kyc"
            ? "Identity verification link is not available yet."
            : "Terms of service link is not available yet.",
        );
        return;
      }
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to open link",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 px-6 md:px-12 mt-6">
      {fundingLocked && (
        <div className="border border-[#FCD34D] rounded-lg p-4 bg-[#FFFBEB] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#92400E]">
                Verification required to fund or withdraw
              </p>
              <p className="text-sm text-[#B45309] mt-1">
                Status: {formatKycStatusLabel(kycStatus?.kycStatus)}. You can
                still view your wallet.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {kycStatus?.tosStatus !== "approved" && (
              <Button
                onClick={() => openLink("tos")}
                disabled={isRefreshing}
                className="h-9 bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Accept terms
                  </>
                )}
              </Button>
            )}
            {(needsUserKycAction(kycStatus?.kycStatus) ||
              kycStatus?.kycStatus === "rejected") && (
              <Button
                onClick={() => openLink("kyc")}
                disabled={isRefreshing}
                variant="outline"
                className="h-9 border-[#F59E0B] text-[#92400E]"
              >
                Continue verification
              </Button>
            )}
          </div>
        </div>
      )}

      <WalletBalanceCard
        onFundWallet={handleFundWallet}
        onWithdraw={handleWithdraw}
      />

      <TransactionsTable />

      <FundWalletModal
        open={fundWalletOpen}
        onOpenChange={setFundWalletOpen}
        onSelectCrypto={handleSelectCrypto}
        onSelectCard={handleSelectCard}
      />

      <FundCryptoModal open={fundCryptoOpen} onOpenChange={setFundCryptoOpen} />

      <FundCardModal open={fundCardOpen} onOpenChange={setFundCardOpen} />

      <WalletFundedModal
        open={fundedSuccessOpen}
        onOpenChange={setFundedSuccessOpen}
      />

      <WithdrawFundsModal
        open={withdrawFundsOpen}
        onOpenChange={setWithdrawFundsOpen}
      />
    </div>
  );
}
