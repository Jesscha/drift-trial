import { useState } from "react";
import { usePNLUserData } from "../../hooks/usePNLUserData";
import { usePerpMarketAccounts } from "../../hooks/usePerpMarketAccounts";
import { DepositWithdrawModal } from "../modal/DepositWithdrawModal";
import { useWallet } from "@solana/wallet-adapter-react";
import { PortfolioSummary } from "./PortfolioSummary";
import { AccountCard } from "./AccountCard";
import { PublicKey } from "@solana/web3.js";
import {
  AlertCircleIcon,
  InfoIcon,
  LoadingSpinnerIcon,
} from "../../assets/icons";

interface AccountsPositionsPanelProps {
  publicKeyOverride?: PublicKey;
}

export function AccountsPositionsPanel({
  publicKeyOverride,
}: AccountsPositionsPanelProps) {
  const { publicKey: walletPublicKey } = useWallet();
  const publicKey = publicKeyOverride || walletPublicKey;

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

  // Show a different message for search results
  if (isLoading) {
    return (
      <div className="bg-neutrals-5 dark:bg-neutrals-90 rounded-lg p-6 text-neutrals-100 dark:text-neutrals-10 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="relative w-8 h-8">
            <LoadingSpinnerIcon size="lg" className="text-purple-50" />
          </div>
        </div>
        <p className="text-center text-neutrals-60 dark:text-neutrals-40">
          Loading accounts and positions data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutrals-5 dark:bg-neutrals-90 rounded-lg p-6 text-red-50 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <div className="relative w-10 h-10">
            <AlertCircleIcon size="lg" className="text-red-50" />
          </div>
        </div>
        <p className="text-center">
          Error loading accounts data: {error.toString()}
        </p>
      </div>
    );
  }

  if (!subaccounts || subaccounts.length === 0) {
    return (
      <div className="bg-neutrals-5 dark:bg-neutrals-90 rounded-lg p-6 text-neutrals-100 dark:text-neutrals-10 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-full h-12 w-12 flex items-center justify-center">
            <div className="relative w-6 h-6">
              <InfoIcon size="md" className="text-purple-50" />
            </div>
          </div>
        </div>
        <p className="text-center font-medium">
          {publicKeyOverride
            ? "No accounts found for this wallet address."
            : "No accounts found. Please connect your wallet and create an account."}
        </p>
      </div>
    );
  }

  // Determine if this is a view-only mode
  const isViewOnly = !!publicKeyOverride;

  return (
    <div className="bg-neutrals-5 dark:bg-neutrals-90 rounded-lg p-6 text-neutrals-100 dark:text-neutrals-10 shadow-sm">
      {/* Overall Account Summary */}
      <div className="mb-6">
        <PortfolioSummary
          totalDepositAmount={totalDepositAmount}
          totalUnsettledPnl={totalUnsettledPnl}
          totalNetValue={totalNetValue}
        />
      </div>

      {/* All Subaccounts */}
      <div>
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-medium">Subaccounts</h2>
          <div className="ml-2 bg-neutrals-10 dark:bg-neutrals-80 rounded-full px-2 py-0.5 text-xs text-neutrals-60 dark:text-neutrals-40">
            {subaccounts.length}
          </div>
        </div>
        <div className="space-y-4">
          {subaccounts.map((account) => (
            <AccountCard
              key={account.subAccountId}
              account={account}
              markets={markets}
              isLoadingMarkets={isLoadingMarkets}
              processingTx={processingTx}
              onDeposit={isViewOnly ? undefined : openDeposit}
              onWithdraw={isViewOnly ? undefined : openWithdraw}
              viewOnly={isViewOnly}
            />
          ))}
        </div>
      </div>

      {!isViewOnly && (
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
      )}
    </div>
  );
}
