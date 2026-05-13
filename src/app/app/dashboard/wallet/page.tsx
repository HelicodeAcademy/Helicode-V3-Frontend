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
import { useKYCStore } from "@/store/kyc-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WalletPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { kycStatus } = useKYCStore();
  // Modal states
  const [fundWalletOpen, setFundWalletOpen] = useState(false);
  const [fundCryptoOpen, setFundCryptoOpen] = useState(false);
  const [fundCardOpen, setFundCardOpen] = useState(false);
  const [fundedSuccessOpen, setFundedSuccessOpen] = useState(false);
  const [withdrawFundsOpen, setWithdrawFundsOpen] = useState(false);

  useEffect(() => {
    setTitle("Wallet");
  }, [setTitle]);

  const handleFundWallet = () => {
    setFundWalletOpen(true);
  };

  const handleWithdraw = () => {
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

  if (kycStatus?.kycStatus !== "approved") {
    return (
      <div className="space-y-6 py-4 px-8 mt-10">
        <div className="rounded-lg border border-[#eaeaea] bg-[#f9fafb] p-6 text-center">
          <h2 className="text-lg font-semibold">KYC Verification Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please complete your KYC verification to access payroll features.
          </p>

          {kycStatus?.kycStatus === "pending" && !kycStatus.kycLink && (
            <Link href="/dashboard/setup-account">
              <Button className="mt-3 bg-[#0166f4] text-white text-xs h-7 hover:bg-[#0166f4]/90">
                Start KYC
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 md:px-12 mt-6">
      {/* Balance Card and Actions */}
      <WalletBalanceCard
        onFundWallet={handleFundWallet}
        onWithdraw={handleWithdraw}
      />

      {/* Transactions Table */}
      <TransactionsTable />

      {/* Modals */}
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
