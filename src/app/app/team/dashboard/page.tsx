"use client";

import { TeamPageTitleContext } from "./layout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import PaymentHistory from "@/components/team-dashboard/home/payment-history";
import { SendFundsModal } from "@/components/team-dashboard/home/send-funds-modal";
import toast from "react-hot-toast";
import { getTeamMe } from "@/lib/team/team-auth-service";
import { TeamMeResponse } from "@/store/team/team-auth-store";
import { TalentWithdrawFundsModal } from "@/components/team-dashboard/home/withdraw-funds-modal";
import { TeamFundWalletModal } from "@/components/team-dashboard/home/team-fund-wallet-modal";
import { TeamFundCryptoModal } from "@/components/team-dashboard/home/team-fund-crypto-modal";
import { TeamFundCardModal } from "@/components/team-dashboard/home/team-fund-card-modal";
import {
  getTeamTransactions,
  TeamTransactionData,
} from "@/lib/team/team-transaction-service";
import {
  useTeamKYCStore,
  isTeamMemberDataCached,
} from "@/store/team/team-kyc-store";
import { TeamKYCModal } from "@/components/team-dashboard/kyc/team-kyc-modal";
import { TeamBankDetailsModal } from "@/components/team-dashboard/kyc/team-bank-details-modal";
import { TeamWithdrawalModal } from "@/components/team-dashboard/home/team-withdrawal-modal";
import { useTeamAuthStore } from "@/store/team/team-auth-store";
import { useTeamWalletStore } from "@/store/team/team-wallet-store";
import { TeamBridgeVerificationStatus } from "@/components/team-dashboard/kyc/team-bridge-verification-status";
export default function TalentDashboardHomePage() {
  const { setTitle } = useContext(TeamPageTitleContext);
  const { setTeamMember } = useTeamKYCStore();
  const { setHasPin } = useTeamAuthStore();
  const { setTeamWalletBalance } = useTeamWalletStore();

  const [currency, setCurrency] = useState<string>("usd");
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const [sendFundsModalOpen, setSendFundsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamMeResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<
    TeamTransactionData[]
  >([]);
  const [withdrawFundsModalOpen, setWithdrawFundsModalOpen] =
    useState<boolean>(false);
  const [fundWalletOpen, setFundWalletOpen] = useState(false);
  const [fundCryptoOpen, setFundCryptoOpen] = useState(false);
  const [fundCardOpen, setFundCardOpen] = useState(false);

  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);

  const handleSelectCrypto = () => {
    setWithdrawFundsModalOpen(false);
    setSendFundsModalOpen(true);
  };

  const handleSelectCard = () => {
    setWithdrawFundsModalOpen(false);
    setWithdrawalModalOpen(true);
  };

  const handleFundSelectCrypto = () => {
    setFundWalletOpen(false);
    setFundCryptoOpen(true);
  };

  const handleFundSelectCard = () => {
    setFundWalletOpen(false);
    setFundCardOpen(true);
  };

  useEffect(() => {
    setTitle("Home");
    fetchTeamData();
    fetchTeamTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTitle]);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      // Check if we have cached data

      if (isTeamMemberDataCached()) {
        const cachedData = useTeamKYCStore.getState().teamMember;
        if (cachedData) {
          setTeamData(cachedData);
          setIsLoading(false);
          return;
        }
      }

      const data = await getTeamMe();
      setTeamData(data);
      setTeamMember(data);
      setHasPin(data.hasTransactionPin);
      setTeamWalletBalance(data.wallet.balance);

      // Auto-open KYC if KYC is not approved and the member hasn't opted
      // into the stablecoin-only (Bridge) flow
      const memberBridgeStarted =
        (data.bridgeKycStatus && data.bridgeKycStatus !== "not_started") ||
        (data.bridgeTosStatus && data.bridgeTosStatus !== "not_started");
      if (!data.kycStatus && !memberBridgeStarted) {
        setKycModalOpen(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch team data";
      toast.error(errorMessage);
      console.error("Team data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamTransactions = async () => {
    try {
      const transactions = await getTeamTransactions();
      setRecentTransactions(transactions);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch team transactions";
      toast.error(errorMessage);
      console.error("Team transactions fetch error:", error);
    }
  };

  const balance = teamData?.wallet.balance ?? 0;

  const selectedCurrency = currency.toUpperCase();

  const getCurrencySymbol = (currencyCode?: string) => {
    switch (currencyCode?.toUpperCase()) {
      case "USD":
      case "USDC":
      case "USDT":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return currencyCode ?? "";
    }
  };

  const formatIncomingAmount = (amount?: number, currencyCode?: string) => {
    if (typeof amount !== "number") return "--";

    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  };

  const payrollData = [
    {
      label: "Incoming",
      value: formatIncomingAmount(
        teamData?.companies[0]?.incomingPayrollAmount,
        selectedCurrency,
      ),
    },
    {
      label: "Next Payroll",
      value: teamData?.companies[0]?.incomingPayrollDate
        ? format(
            new Date(teamData.companies[0].incomingPayrollDate),
            "MMM d, yyyy",
          )
        : "",
    },
  ];

  const kycNotApproved = !teamData?.kycStatus;
  const bankDetailsNotAdded = !teamData?.bankPayoutStatus;
  // Stablecoin-only members (unsupported offramp countries) go straight to
  // Bridge KYC and never complete local KYC or add bank details
  const bridgeStarted = Boolean(
    (teamData?.bridgeKycStatus &&
      teamData.bridgeKycStatus !== "not_started") ||
      (teamData?.bridgeTosStatus && teamData.bridgeTosStatus !== "not_started"),
  );
  const bridgeApproved =
    teamData?.bridgeKycStatus === "approved" &&
    teamData?.bridgeTosStatus === "approved";

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#F2F2F2] bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-6 xl:max-w-sm">
            <div className="flex items-center justify-between">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-10 w-full max-w-64 border-[#d1d5db] text-sm font-medium rounded-lg">
                  <SelectValue className="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">
                    <span className="flex items-center gap-2">
                      <Image
                        src="/home/usa.svg"
                        alt="USD"
                        width={16}
                        height={16}
                        priority
                        className="h-4 w-4"
                      />
                      <span className="mt-1">US Dollars (USD)</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="eur">
                    <span className="flex items-center gap-2">Euro (EUR)</span>
                  </SelectItem>
                  <SelectItem value="gbp">
                    <span className="flex items-center gap-2">
                      British Pound (GBP)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-[#475367]">
                Available Balance
              </p>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="h-12 w-40 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  <>
                    <div className="text-[1.75rem] font-bold text-[#1C232D] sm:text-[2rem]">
                      {showBalance
                        ? `${getCurrencySymbol(selectedCurrency)}${balance.toFixed(2)}`
                        : "••••••"}
                    </div>

                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-[#141B34] transition-colors hover:text-[#667085]"
                    >
                      {showBalance ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid w-full gap-6 sm:grid-cols-2 xl:w-auto xl:gap-12">
            {payrollData.map((metric) => (
              <div key={metric.label} className="text-left sm:text-right">
                <div className="text-sm font-medium text-[#475367]">
                  {metric.label}
                </div>
                <div className="mt-2 text-[1.75rem] font-bold text-[#1C232D] sm:text-[2rem]">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => setFundWalletOpen(true)}
            className="w-full items-center rounded-lg bg-[#0052FF] font-medium text-white hover:bg-[#0052FF]/90 sm:w-auto"
          >
            <Image
              src="/home/arrow-narrow-up-right-white.svg"
              alt="fund"
              className="rotate-180"
              width={16}
              height={16}
            />
            Fund wallet
          </Button>
          <Button
            onClick={() => setWithdrawFundsModalOpen(true)}
            variant="outline"
            className="w-full items-center sm:w-auto border border-[#0052FF] rounded-lg text-[#0052FF]"
            disabled={isLoading || !bridgeApproved}
          >
            <Image
              src="/wallet/arrow-narrow-up-right-blue.svg"
              alt="icon"
              width={16}
              height={16}
            />
            Withdraw funds
          </Button>
        </div>

        {kycNotApproved && !bridgeStarted && !isLoading && (
          <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 flex items-start gap-3 mt-10">
            <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#92400E]">
                KYC Verification Required
              </p>
              <p className="text-sm text-[#B45309] mt-1">
                Complete your KYC verification to access full features and
                withdraw funds.
              </p>
            </div>
            <Button
              onClick={() => setKycModalOpen(true)}
              className="bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 h-9 text-sm shrink-0"
            >
              Complete KYC
            </Button>
          </div>
        )}

        {/* Bank Details Alert */}
        {bankDetailsNotAdded && kycNotApproved === false && (
          <div className="bg-[#DBEAFE] border border-[#0084FD] rounded-lg p-4 flex items-start gap-3 mt-10">
            <AlertCircle className="h-5 w-5 text-[#0084FD] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#003DA5]">
                Bank Details Required
              </p>
              <p className="text-sm text-[#0084FD] mt-1">
                Add your bank details to enable withdrawals and complete your
                setup.
              </p>
            </div>
            <Button
              onClick={() => setBankModalOpen(true)}
              className="bg-[#0084FD] text-white hover:bg-[#0084FD]/90 h-9 text-sm shrink-0"
            >
              Add Bank Details
            </Button>
          </div>
        )}

        {/* Bridge Verification Status */}
        {((!bankDetailsNotAdded && kycNotApproved === false) ||
          bridgeStarted) && (
          <TeamBridgeVerificationStatus
            bankPayoutStatus={teamData?.bankPayoutStatus}
            bridgeKycStatus={teamData?.bridgeKycStatus}
            bridgeTosStatus={teamData?.bridgeTosStatus}
          />
        )}
      </div>

      <PaymentHistory payments={recentTransactions} />

      {/* Handles cypto withdrawals */}
      <SendFundsModal
        open={sendFundsModalOpen}
        onOpenChange={setSendFundsModalOpen}
      />

      <TalentWithdrawFundsModal
        open={withdrawFundsModalOpen}
        onOpenChange={setWithdrawFundsModalOpen}
        onSelectCrypto={handleSelectCrypto}
        onSelectCard={handleSelectCard}
        showLocalOption={!bankDetailsNotAdded}
      />

      {/* Fund Wallet Modals */}
      <TeamFundWalletModal
        open={fundWalletOpen}
        onOpenChange={setFundWalletOpen}
        onSelectCrypto={handleFundSelectCrypto}
        onSelectCard={handleFundSelectCard}
      />

      <TeamFundCryptoModal
        open={fundCryptoOpen}
        onOpenChange={setFundCryptoOpen}
        teamData={teamData}
      />

      <TeamFundCardModal
        open={fundCardOpen}
        onOpenChange={setFundCardOpen}
        teamData={teamData}
      />

      <TeamKYCModal
        open={kycModalOpen}
        onOpenChange={setKycModalOpen}
        onSuccess={() => fetchTeamData()}
      />

      <TeamBankDetailsModal
        open={bankModalOpen}
        onOpenChange={setBankModalOpen}
        onSuccess={() => fetchTeamData()}
        kycStatus={teamData?.bridgeKycStatus}
        tosStatus={teamData?.bridgeTosStatus}
      />

      {/* Handles local bank withdrawals */}
      <TeamWithdrawalModal
        open={withdrawalModalOpen}
        onOpenChange={setWithdrawalModalOpen}
        onSuccess={() => {
          fetchTeamData();
        }}
      />
    </div>
  );
}
