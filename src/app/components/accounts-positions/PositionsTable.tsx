import { formatBN } from "../../utils/number";
import { getTokenIconUrl } from "../../utils/url";
import { PerpPositionWithPNL } from "../../hooks/usePNLUserData";
import {
  BASE_PRECISION,
  BN,
  OrderType,
  PositionDirection,
} from "@drift-labs/sdk";
import { usePerpOrder } from "../../hooks/usePerpOrder";
import { useTransactions } from "../../hooks/useTransactions";
import { useState } from "react";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { ConfirmCloseModal } from "./ConfirmCloseModal";

interface PositionsTableProps {
  positions: PerpPositionWithPNL[];
  markets: any;
  isLoadingMarkets: boolean;
}

export function PositionsTable({
  positions,
  markets,
  isLoadingMarkets,
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
      <div className="py-4 text-center text-neutrals-60 dark:text-neutrals-40">
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
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-neutrals-60 dark:text-neutrals-40 border-b border-neutrals-30 dark:border-neutrals-60">
            <th className="text-left py-2 px-4">Market</th>
            <th className="text-left py-2 px-4">Size</th>
            <th className="text-left py-2 px-4">Entry/Oracle</th>
            <th className="text-left py-2 px-4">P&L</th>
            <th className="text-right py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const marketData = markets[position.marketIndex];
            const isLong = position.baseAssetAmount.gt(0);
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
                className="border-b border-neutrals-30/30 dark:border-neutrals-60/30"
              >
                <td className="py-3 px-4">
                  {isLoadingMarkets ? (
                    `Loading market #${position.marketIndex}...`
                  ) : (
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2 flex-shrink-0">
                        <img
                          src={getTokenIconUrl(marketData?.name?.split("-")[0])}
                          alt={
                            marketData?.name ||
                            `Market #${position.marketIndex}`
                          }
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/${marketData?.name
                              ?.split("-")[0]
                              .toLowerCase()}.svg`;
                          }}
                        />
                      </div>
                      {marketData?.name || `Market #${position.marketIndex}`}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-left">
                  <div className={isLong ? "text-green-50" : "text-red-50"}>
                    {isLong ? "Long" : "Short"}{" "}
                    {formatBN(position.baseAssetAmount.abs(), false, 4)}
                  </div>
                  <div className="text-xs text-neutrals-60 dark:text-neutrals-40">
                    $ {formatBN(position.quoteAssetAmount.abs(), true, 2)}
                  </div>
                </td>
                <td className="py-3 px-4 text-left">
                  <div>${entryPrice}</div>
                  <div className="text-xs text-neutrals-60 dark:text-neutrals-40">
                    ${oraclePrice}
                  </div>
                </td>
                <td className={`py-3 px-4 text-left ${pnlClass}`}>
                  {position.unsettledPnl
                    ? `$${formatBN(position.unsettledPnl, true)}`
                    : "N/A"}
                  <div className="text-xs text-neutrals-60 dark:text-neutrals-40">
                    {position.unsettledPnl && position.quoteAssetAmount
                      ? `${(
                          (position.unsettledPnl.toNumber() /
                            Math.abs(position.quoteAssetAmount.toNumber())) *
                          100
                        ).toFixed(2)}%`
                      : "N/A"}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-2 bg-neutrals-10 dark:bg-neutrals-60 rounded hover:bg-red-50/20"
                      onClick={() => handleOpenCloseModal(position)}
                      disabled={
                        isLoading &&
                        closingPositionMarketIndex === position.marketIndex
                      }
                    >
                      <img
                        src="/icons/trash.svg"
                        alt="Close position"
                        width={16}
                        height={16}
                        className={
                          isLoading &&
                          closingPositionMarketIndex === position.marketIndex
                            ? "animate-pulse"
                            : ""
                        }
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmCloseModal
        isOpen={closeModalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmClose}
        isLoading={isLoading}
        positionDetails={closeModalState.positionDetails}
      />
    </>
  );
}
