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

export default function WalletPage() {
  const { setTitle } = useContext(PageTitleContext);

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
