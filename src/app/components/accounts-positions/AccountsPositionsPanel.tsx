import { useState } from "react";
import { usePNLUserData } from "../../hooks/usePNLUserData";
import { usePerpMarketAccounts } from "../../hooks/usePerpMarketAccounts";
import { DepositWithdrawModal } from "../modal/DepositWithdrawModal";
import { useWallet } from "@solana/wallet-adapter-react";
import { PortfolioSummary } from "./PortfolioSummary";
import { AccountCard } from "./AccountCard";

export function AccountsPositionsPanel() {
  const { publicKey } = useWallet();
  const {
    subaccounts,
    totalDepositAmount,
    totalUnsettledPnl,
    totalNetValue,
    isLoading,
    error,
  } = usePNLUserData(publicKey);

  const { markets, isLoading: isLoadingMarkets } = usePerpMarketAccounts();

  // State for modal handling
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "deposit" as "deposit" | "withdraw",
    subaccountId: 0,
  });
  const [processingTx, setProcessingTx] = useState<number | null>(null);

  // Modal control functions
  const openDeposit = (subaccount: any) => {
    setModalState({
      isOpen: true,
      mode: "deposit",
      subaccountId: subaccount.subAccountId,
    });
  };

  const openWithdraw = (subaccount: any) => {
    setModalState({
      isOpen: true,
      mode: "withdraw",
      subaccountId: subaccount.subAccountId,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleTxComplete = () => {
    setProcessingTx(null);
  };

  if (isLoading) {
    return (
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 text-neutrals-100 dark:text-neutrals-10">
        <p>Loading accounts and positions data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-10 dark:bg-red-90 rounded-lg p-4 text-red-70 dark:text-red-20">
        <p>Error loading accounts data: {error.toString()}</p>
      </div>
    );
  }

  if (!subaccounts || subaccounts.length === 0) {
    return (
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 text-neutrals-100 dark:text-neutrals-10">
        <p>
          No accounts found. Please connect your wallet and create an account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 text-neutrals-100 dark:text-neutrals-10">
      {/* Overall Account Summary */}
      <PortfolioSummary
        totalDepositAmount={totalDepositAmount}
        totalUnsettledPnl={totalUnsettledPnl}
        totalNetValue={totalNetValue}
      />

      {/* All Subaccounts */}
      <div>
        <h2 className="text-xl font-bold mb-3">Subaccounts</h2>
        <div className="space-y-4">
          {subaccounts.map((account) => (
            <AccountCard
              key={account.subAccountId}
              account={account}
              markets={markets}
              isLoadingMarkets={isLoadingMarkets}
              processingTx={processingTx}
              onDeposit={openDeposit}
              onWithdraw={openWithdraw}
            />
          ))}
        </div>
      </div>

      <DepositWithdrawModal
        isOpen={modalState.isOpen}
        onClose={() => {
          closeModal();
          handleTxComplete();
        }}
        initialMode={modalState.mode}
        marketIndex={0} // Default to USDC market
        initialSubaccountId={modalState.subaccountId}
      />
    </div>
  );
}
