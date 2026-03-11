"use client";

import { useContext, useEffect, useState } from "react";
import { PageTitleContext } from "../layout";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import {
  TransactionsTable,
  Transaction,
} from "@/components/wallet/transactions-table";
import { FundWalletModal } from "@/components/wallet/fund-wallet-modal";
import { FundCryptoModal } from "@/components/wallet/fund-crypto-modal";
import { FundCardModal } from "@/components/wallet/fund-card-modal";
import { WalletFundedModal } from "@/components/wallet/wallet-funded-modal";

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "Deposit",
    amount: "$10,000",
    date: "19 May 07:23 AM",
    method: "Fiat",
    status: "Paid",
  },
  {
    id: "2",
    type: "Deposit",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Stablecoin",
    status: "Failed",
  },
  {
    id: "3",
    type: "Withdraw",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Fiat",
    status: "Pending",
  },
  {
    id: "4",
    type: "Deposit",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Stablecoin",
    status: "Paid",
  },
  {
    id: "5",
    type: "Withdraw",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Stablecoin",
    status: "Paid",
  },
  {
    id: "6",
    type: "Deposit",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Stablecoin",
    status: "Paid",
  },
  {
    id: "7",
    type: "Deposit",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Fiat",
    status: "Pending",
  },
  {
    id: "8",
    type: "Withdraw",
    amount: "$12,000",
    date: "19 May 07:23 AM",
    method: "Fiat",
    status: "Failed",
  },
];

export default function WalletPage() {
  const { setTitle } = useContext(PageTitleContext);

  // Modal states
  const [fundWalletOpen, setFundWalletOpen] = useState(false);
  const [fundCryptoOpen, setFundCryptoOpen] = useState(false);
  const [fundCardOpen, setFundCardOpen] = useState(false);
  const [fundedSuccessOpen, setFundedSuccessOpen] = useState(false);

  useEffect(() => {
    setTitle("Wallet");
  }, [setTitle]);

  const handleFundWallet = () => {
    setFundWalletOpen(true);
  };

  const handleWithdraw = () => {
    // TODO: Implement withdraw flow
    console.log("Withdraw funds");
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
      <TransactionsTable transactions={mockTransactions} membersCount={8} />

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
    </div>
  );
}
