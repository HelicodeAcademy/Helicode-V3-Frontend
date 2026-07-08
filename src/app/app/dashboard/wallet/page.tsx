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
// import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KYCStage2Modal } from "@/components/dashboard-home/kyc/kyc-stage2-modal";
import { AlertCircle } from "lucide-react";

export default function WalletPage() {
  const { setTitle } = useContext(PageTitleContext);
  const { kycStatus } = useKYCStore();
  // Modal states
  const [fundWalletOpen, setFundWalletOpen] = useState(false);
  const [fundCryptoOpen, setFundCryptoOpen] = useState(false);
  const [fundCardOpen, setFundCardOpen] = useState(false);
  const [fundedSuccessOpen, setFundedSuccessOpen] = useState(false);
  const [withdrawFundsOpen, setWithdrawFundsOpen] = useState(false);
  const [stage2ModalOpen, setStage2ModalOpen] = useState(false);

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

  const isEmployerKycPending =
    !kycStatus || kycStatus.employerKycStatus !== "submitted";

  if (isEmployerKycPending) {
    return (
      <div className="max-w-2xl">
        <div className="border border-[#FCD34D] rounded-lg p-6 bg-[#FFFBEB] space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#101828] text-lg">
                Complete Your Verification
              </h3>
              <p className="text-[#667085] mt-2">
                To access payroll features, you need to complete your employer
                verification. This helps us ensure compliance and security.
              </p>
              <p className="text-sm text-[#92400E] mt-3">
                Your company information has already been verified. We just need
                a few personal details to complete the process.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setStage2ModalOpen(true)}
            className="bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 mt-4"
          >
            Complete Employer Verification
          </Button>
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

      <KYCStage2Modal
        open={stage2ModalOpen}
        onOpenChange={setStage2ModalOpen}
        onSuccess={() => {
          setStage2ModalOpen(false);
        }}
      />
    </div>
  );
}
