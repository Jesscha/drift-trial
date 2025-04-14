import { useState } from "react";
import {
  useParsedUserData,
  ParsedSubaccountData,
} from "../hooks/useParsedUserData";
import { formatBN } from "../utils/number";
import { usePerpMarketAccounts } from "../hooks/usePerpMarketAccounts";
import { DepositWithdrawModal } from "./modal/DepositWithdrawModal";

export function AccountsPositionsPanel() {
  const {
    subaccounts,
    totalDepositAmount,
    totalUnsettledPnl,
    totalNetValue,
    isLoading,
    error,
  } = useParsedUserData();

  const { markets, isLoading: isLoadingMarkets } = usePerpMarketAccounts();

  // State for modal handling
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "deposit" as "deposit" | "withdraw",
    subaccountId: 0,
  });
  const [processingTx, setProcessingTx] = useState<number | null>(null);

  // Modal control functions
  const openDeposit = (subaccount: ParsedSubaccountData) => {
    setModalState({
      isOpen: true,
      mode: "deposit",
      subaccountId: subaccount.subaccountId,
    });
  };

  const openWithdraw = (subaccount: ParsedSubaccountData) => {
    setModalState({
      isOpen: true,
      mode: "withdraw",
      subaccountId: subaccount.subaccountId,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Handler for when deposit/withdraw transaction is initiated
  const handleTxStart = () => {
    if (modalState.subaccountId !== null) {
      setProcessingTx(modalState.subaccountId);
    }
  };

  // Handler for when deposit/withdraw transaction is completed
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
      <h2 className="text-xl font-bold mb-4">Accounts & Positions</h2>

      {/* Overall Summary */}
      <div className="bg-neutrals-20 dark:bg-neutrals-70 rounded-lg p-3 mb-4">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-neutrals-60 dark:text-neutrals-40">
              Total Deposits
            </p>
            <p className="font-bold">{formatBN(totalDepositAmount, true)}</p>
          </div>
          <div>
            <p className="text-neutrals-60 dark:text-neutrals-40">
              Unsettled PnL
            </p>
            <p className="font-bold">{formatBN(totalUnsettledPnl, true)}</p>
          </div>
          <div>
            <p className="text-neutrals-60 dark:text-neutrals-40">Net Value</p>
            <p className="font-bold">{formatBN(totalNetValue, true)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {subaccounts.map((subaccountData) => (
          <div
            key={subaccountData.subaccountId}
            className="bg-neutrals-20 dark:bg-neutrals-70 rounded-lg p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                Subaccount #{subaccountData.subaccountId}
              </h3>
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => openDeposit(subaccountData)}
                  disabled={processingTx === subaccountData.subaccountId}
                  className={`px-3 py-1 text-sm rounded ${
                    processingTx === subaccountData.subaccountId
                      ? "bg-green-60 opacity-70 cursor-not-allowed"
                      : "bg-green-50 hover:bg-green-60"
                  } text-white transition-colors`}
                >
                  {processingTx === subaccountData.subaccountId ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing
                    </span>
                  ) : (
                    "Deposit"
                  )}
                </button>
                <button
                  onClick={() => openWithdraw(subaccountData)}
                  disabled={processingTx === subaccountData.subaccountId}
                  className={`px-3 py-1 text-sm rounded ${
                    processingTx === subaccountData.subaccountId
                      ? "bg-red-60 opacity-70 cursor-not-allowed"
                      : "bg-red-50 hover:bg-red-60"
                  } text-white transition-colors`}
                >
                  {processingTx === subaccountData.subaccountId ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing
                    </span>
                  ) : (
                    "Withdraw"
                  )}
                </button>
                <div className="text-right">
                  <p className="text-sm text-neutrals-60 dark:text-neutrals-40">
                    Net Value
                  </p>
                  <p className="font-bold">
                    {formatBN(subaccountData.netTotal, true)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Deposits
                </p>
                <p className="font-medium">
                  {formatBN(subaccountData.depositAmount, true)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Unsettled PnL
                </p>
                <p className="font-medium">
                  {formatBN(subaccountData.netUnsettledPnl, true)}
                </p>
              </div>
            </div>

            {/* Positions */}
            {subaccountData.positions.length > 0 ? (
              <div>
                <h4 className="font-medium border-b border-neutrals-30 dark:border-neutrals-60 pb-1 mb-2">
                  Positions
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-neutrals-60 dark:text-neutrals-40">
                        <th className="text-left py-1">Market</th>
                        <th className="text-right py-1">Base</th>
                        <th className="text-right py-1">Quote</th>
                        <th className="text-right py-1">Oracle Price</th>
                        <th className="text-right py-1">Unsettled PnL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subaccountData.positions.map((position) => {
                        const oraclePrice = position.oraclePrice;
                        const marketData = markets[position.marketIndex];

                        return (
                          <tr
                            key={position.marketIndex}
                            className="border-b border-neutrals-30/30 dark:border-neutrals-60/30"
                          >
                            <td className="py-2">
                              {isLoadingMarkets
                                ? `Loading market #${position.marketIndex}...`
                                : marketData?.name ||
                                  `Market #${position.marketIndex}`}
                            </td>
                            <td className="text-right py-2">
                              {formatBN(position.baseAmount, false, 5)}
                            </td>
                            <td className="text-right py-2">
                              {formatBN(position.quoteAmount)}
                            </td>
                            <td className="text-right py-2">
                              {oraclePrice
                                ? formatBN(oraclePrice, true)
                                : "N/A"}
                            </td>
                            <td className="text-right py-2">
                              {position.unsettledPnl
                                ? formatBN(position.unsettledPnl, true)
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-neutrals-60 dark:text-neutrals-40 text-sm italic">
                No open positions
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Deposit and Withdraw Modal */}
      <DepositWithdrawModal
        isOpen={modalState.isOpen}
        onClose={() => {
          closeModal();
          handleTxComplete();
        }}
        initialMode={modalState.mode}
        marketIndex={0} // Default to USDC market
        initialSubaccountId={modalState.subaccountId}
        onTxStart={handleTxStart}
        onTxComplete={handleTxComplete}
        walletBalance={18.3255} // Example wallet balance
      />
    </div>
  );
}
