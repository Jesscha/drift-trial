import { formatBN } from "@/utils/formatting";
import { getTokenIconUrl } from "@/utils/assets";
import { PerpPositionWithPNL } from "../../hooks/usePNLUserData";
import { BASE_PRECISION, PositionDirection } from "@drift-labs/sdk";
import { usePerpOrder } from "../../hooks/usePerpOrder";
import { useTransactions } from "../../hooks/useTransactions";
import { useState } from "react";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { ConfirmCloseModal } from "./ConfirmCloseModal";
import { TrashIcon } from "../../assets/icons";
import { MarketData } from "../../hooks/usePerpMarketAccounts";

interface PositionsTableProps {
  positions: PerpPositionWithPNL[];
  markets: Record<number, MarketData>;
  isLoadingMarkets: boolean;
  viewOnly?: boolean;
}

export function PositionsTable({
  positions,
  markets,
  isLoadingMarkets,
  viewOnly = false,
}: PositionsTableProps) {
  const { placeMarketOrder, isLoading } = usePerpOrder();
  const { trackTransaction } = useTransactions();
  const [closingPositionMarketIndex, setClosingPositionMarketIndex] = useState<
    number | null
  >(null);
  const [closeModalState, setCloseModalState] = useState({
    isOpen: false,
    position: null as PerpPositionWithPNL | null,
    positionDetails: null as {
      marketName: string;
      direction: string;
      size: string;
      pnl: string;
      pnlClass: string;
    } | null,
  });

  if (positions.length === 0) {
    return (
      <div className="py-6 text-center text-neutrals-60 dark:text-neutrals-40">
        <p>No open positions for this account.</p>
      </div>
    );
  }

  const handleOpenCloseModal = (position: PerpPositionWithPNL) => {
    const isLong = position.baseAssetAmount.gt(0);
    const pnlClass = position.unsettledPnl?.isNeg()
      ? "text-red-50"
      : !position.unsettledPnl?.isZero()
      ? "text-green-50"
      : "";

    const marketName =
      markets[position.marketIndex]?.name || `Market #${position.marketIndex}`;

    setCloseModalState({
      isOpen: true,
      position,
      positionDetails: {
        marketName,
        direction: isLong ? "Long" : "Short",
        size: formatBN(position.baseAssetAmount.abs(), false, 4),
        pnl: position.unsettledPnl
          ? `$${formatBN(position.unsettledPnl, true)}`
          : "N/A",
        pnlClass,
      },
    });
  };

  const handleCloseModal = () => {
    setCloseModalState({
      isOpen: false,
      position: null,
      positionDetails: null,
    });
  };

  const handleConfirmClose = async () => {
    if (!closeModalState.position) return;

    try {
      const position = closeModalState.position;
      setClosingPositionMarketIndex(position.marketIndex);

      // To close a position, we place a market order in the opposite direction with the same size
      const closeDirection = position.baseAssetAmount.gt(0)
        ? PositionDirection.SHORT
        : PositionDirection.LONG;

      // Get the size without the negative sign
      const size = position.baseAssetAmount.abs().toString();

      const result = await placeMarketOrder(
        position.marketIndex,
        closeDirection,
        parseFloat(size) / 1e9 // Adjust for decimal precision
      );

      if (result.success && result.txid) {
        trackTransaction(result.txid, "Close Position", [
          { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
          { type: TransactionSuccessActionType.REFRESH_ALL },
        ]);

        // Close the modal after successful position closure
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error closing position:", error);
    } finally {
      setClosingPositionMarketIndex(null);
    }
  };

  return (
    <>
      <table className="min-w-full">
        <thead>
          <tr className="text-neutrals-60 dark:text-neutrals-40 border-b border-neutrals-20 dark:border-neutrals-70">
            <th className="text-left py-3 px-4 font-medium text-xs">Market</th>
            <th className="text-left py-3 px-4 font-medium text-xs">Size</th>
            <th className="text-left py-3 px-4 font-medium text-xs">
              Entry/Oracle
            </th>
            <th className="text-left py-3 px-4 font-medium text-xs">P&L</th>
            {!viewOnly && (
              <th className="text-right py-3 px-4 font-medium text-xs">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="text-sm">
          {positions.map((position) => {
            const marketData = markets[position.marketIndex];
            const isLong = !position.baseAssetAmount.isNeg();
            const pnlClass = position.unsettledPnl?.isNeg()
              ? "text-red-50"
              : !position.unsettledPnl?.isZero()
              ? "text-green-50"
              : "";

            const entryPrice = formatBN(
              position.quoteEntryAmount
                .abs()
                .mul(BASE_PRECISION)
                .div(position.baseAssetAmount),
              true,
              2
            );

            const oraclePrice = position.oraclePrice
              ? formatBN(position.oraclePrice, true, 2)
              : "N/A";

            return (
              <tr
                key={position.marketIndex}
                className="border-b border-neutrals-20/20 dark:border-neutrals-70/20 hover:bg-neutrals-10/50 dark:hover:bg-neutrals-80/50"
              >
                <td className="py-3 px-4">
                  {isLoadingMarkets ? (
                    <div className="animate-pulse h-6 w-24 bg-neutrals-20 dark:bg-neutrals-70 rounded"></div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-7 h-7 mr-2.5 flex-shrink-0 bg-neutrals-5 dark:bg-neutrals-90 rounded-full flex items-center justify-center">
                        <img
                          src={getTokenIconUrl(marketData?.name?.split("-")[0])}
                          alt={
                            marketData?.name ||
                            `Market #${position.marketIndex}`
                          }
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/${marketData?.name
                              ?.split("-")[0]
                              .toLowerCase()}.svg`;
                          }}
                        />
                      </div>
                      <span className="font-medium">
                        {marketData?.name || `Market #${position.marketIndex}`}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-left">
                  <div
                    className={
                      isLong
                        ? "text-green-50 font-medium"
                        : "text-red-50 font-medium"
                    }
                  >
                    {isLong ? "Long" : "Short"}{" "}
                    {formatBN(position.baseAssetAmount.abs(), false, 4)}
                  </div>
                  <div className="text-xs text-neutrals-60 dark:text-neutrals-40 mt-0.5">
                    ${formatBN(position.quoteAssetAmount.abs(), true, 2)}
                  </div>
                </td>
                <td className="py-3 px-4 text-left">
                  <div className="font-medium">${entryPrice}</div>
                  <div className="text-xs text-neutrals-60 dark:text-neutrals-40 mt-0.5">
                    ${oraclePrice}
                  </div>
                </td>
                <td className={`py-3 px-4 text-left ${pnlClass} font-medium`}>
                  {position.unsettledPnl
                    ? `$${formatBN(position.unsettledPnl, true)}`
                    : "N/A"}
                  <div className="text-xs text-neutrals-60 dark:text-neutrals-40 mt-0.5 font-normal">
                    {position.unsettledPnl && position.quoteAssetAmount
                      ? `${(
                          (position.unsettledPnl.toNumber() /
                            Math.abs(position.quoteAssetAmount.toNumber())) *
                          100
                        ).toFixed(2)}%`
                      : "N/A"}
                  </div>
                </td>
                {!viewOnly && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="p-2 bg-neutrals-5 dark:bg-neutrals-90 rounded hover:bg-red-50/10 transition-colors"
                        onClick={() => handleOpenCloseModal(position)}
                        disabled={
                          isLoading &&
                          closingPositionMarketIndex === position.marketIndex
                        }
                      >
                        <div className="relative w-4 h-4">
                          <TrashIcon
                            size="sm"
                            className={`text-red-50 ${
                              isLoading &&
                              closingPositionMarketIndex ===
                                position.marketIndex
                                ? "animate-pulse"
                                : ""
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {!viewOnly && (
        <ConfirmCloseModal
          isOpen={closeModalState.isOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmClose}
          isLoading={isLoading}
          positionDetails={closeModalState.positionDetails}
        />
      )}
    </>
  );
}
