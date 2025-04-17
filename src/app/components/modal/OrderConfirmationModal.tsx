import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { useCallback } from "react";
import { formatNumber } from "@/app/utils/number";
import { formatMarketName, isTriggerOrderType } from "./TradingModal.util";
import { useTradingStore } from "@/app/stores/tradingStore";
import { MarketData } from "@/app/hooks/usePerpMarketAccounts";
import { TriggerCondition } from "@/types";

interface OrderConfirmationModalProps {
  showConfirmation: boolean;
  onClose: () => void;
  onConfirm: () => void;
  marketsList: Array<MarketData>;
  marketIndex: number;
}

/**
 * OrderConfirmationModal - Displays a confirmation dialog before placing an order
 *
 * This component handles the confirmation UI for all order types including:
 * - Market orders
 * - Limit orders with scale distribution
 * - Stop orders and take profit orders
 * - Orders with TP/SL
 */
export const OrderConfirmationModal = ({
  showConfirmation,
  onClose,
  onConfirm,
  marketsList,
  marketIndex,
}: OrderConfirmationModalProps) => {
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const size = useTradingStore((state) => state.size);
  const price = useTradingStore((state) => state.price);
  const triggerPrice = useTradingStore((state) => state.triggerPrice);
  const triggerCondition = useTradingStore((state) => state.triggerCondition);
  const enableTakeProfit = useTradingStore((state) => state.enableTakeProfit);
  const takeProfitPrice = useTradingStore((state) => state.takeProfitPrice);
  const enableStopLoss = useTradingStore((state) => state.enableStopLoss);
  const stopLossPrice = useTradingStore((state) => state.stopLossPrice);
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const numScaleOrders = useTradingStore((state) => state.numScaleOrders);
  const minPrice = useTradingStore((state) => state.minPrice);
  const maxPrice = useTradingStore((state) => state.maxPrice);
  const scaleDistribution = useTradingStore((state) => state.scaleDistribution);
  const selectedOrderType = useTradingStore((state) => state.selectedOrderType);
  const activeTab = useTradingStore((state) => state.activeTab);
  const usdValue = useTradingStore((state) => state.usdValue);

  // Function to get formatted order type description for confirmation modal
  const getOrderDescription = useCallback(() => {
    const baseDescription = `${
      selectedDirection === PositionDirection.LONG ? "Buy" : "Sell"
    } ${size.toFixed(5)} ${formatMarketName(marketsList[marketIndex]?.name)}`;

    let detailDescription = "";
    let additionalNotes = "";

    if (useScaleOrders && selectedOrderType === OrderType.LIMIT && price) {
      const priceVal = price;
      const minPriceVal = minPrice !== null ? minPrice : priceVal * 0.95;
      const maxPriceVal = maxPrice !== null ? maxPrice : priceVal * 1.05;

      const distributionText =
        scaleDistribution === "ascending"
          ? "Low to High"
          : scaleDistribution === "descending"
          ? "High to Low"
          : scaleDistribution === "random"
          ? "Random"
          : "Flat";

      detailDescription = `Scale Orders (${numScaleOrders}) from ${minPriceVal} to ${maxPriceVal} - ${distributionText}`;
    } else {
      switch (activeTab) {
        case "market":
          detailDescription = "at Market";
          break;
        case "limit":
          detailDescription = price ? `Limit at ${price}` : "";
          break;
        case "stop-loss-market":
          detailDescription =
            triggerPrice && triggerCondition !== undefined
              ? `Stop Market when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${triggerPrice}`
              : "";
          break;
        case "stop-loss-limit":
          detailDescription =
            triggerPrice && price
              ? `Stop Limit ${price} when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${triggerPrice}`
              : "";
          break;
        case "take-profit-market":
          detailDescription =
            triggerPrice && triggerCondition !== undefined
              ? `Take Profit when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${triggerPrice}`
              : "";
          break;
        case "take-profit-limit":
          detailDescription =
            triggerPrice && price
              ? `Take Profit Limit ${price} when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${triggerPrice}`
              : "";
          break;
        default:
          detailDescription = "";
      }
    }

    // Add TP/SL information if enabled
    if (
      (enableTakeProfit || enableStopLoss) &&
      !isTriggerOrderType(selectedOrderType)
    ) {
      if (enableTakeProfit) {
        const tpPrice =
          takeProfitPrice !== null
            ? takeProfitPrice
            : price && selectedDirection === PositionDirection.LONG
            ? price * 1.1
            : price
            ? price * 0.9
            : 0;

        additionalNotes += ` with Take Profit at ${tpPrice}`;
      }

      if (enableStopLoss) {
        const slPrice =
          stopLossPrice !== null
            ? stopLossPrice
            : price && selectedDirection === PositionDirection.LONG
            ? price * 0.9
            : price
            ? price * 1.1
            : 0;

        additionalNotes += `${
          enableTakeProfit ? " and" : " with"
        } Stop Loss at ${slPrice}`;
      }
    }

    return `${baseDescription} ${detailDescription}${additionalNotes}`;
  }, [
    selectedDirection,
    size,
    marketsList,
    marketIndex,
    selectedOrderType,
    price,
    triggerPrice,
    triggerCondition,
    enableTakeProfit,
    takeProfitPrice,
    enableStopLoss,
    stopLossPrice,
    useScaleOrders,
    numScaleOrders,
    minPrice,
    maxPrice,
    scaleDistribution,
  ]);

  // Get notional value in USD
  const getNotionalValue = useCallback(() => {
    return `${formatNumber(usdValue, 2)} USD`;
  }, [usdValue]);

  if (!showConfirmation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutrals-100/30 dark:bg-black/50"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg shadow-xl w-96 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutrals-20 dark:border-neutrals-70">
          <h2 className="text-lg font-bold text-neutrals-100 dark:text-neutrals-0 flex items-center">
            Confirm Order
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-neutrals-60 hover:text-neutrals-100 dark:text-neutrals-40 dark:hover:text-neutrals-0 focus:outline-none transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-neutrals-100 dark:text-neutrals-10">
          <div className="mb-5">
            <div className="text-sm text-neutrals-60 dark:text-neutrals-40 mb-1">
              Order Summary
            </div>
            <div className="text-base font-medium">{getOrderDescription()}</div>
          </div>

          <div className="mb-5">
            <div className="text-sm text-neutrals-60 dark:text-neutrals-40 mb-1">
              Notional Value
            </div>
            <div className="text-base font-medium">{getNotionalValue()}</div>
          </div>

          <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
            <div className="flex items-start gap-2">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
                  fill="currentColor"
                />
              </svg>
              <span>
                Please review your order details before confirming. This action
                cannot be undone.
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex-1 py-3 rounded-lg font-medium bg-neutrals-10 dark:bg-neutrals-70 text-neutrals-80 dark:text-neutrals-20 hover:bg-neutrals-20 dark:hover:bg-neutrals-60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              className={`flex-1 py-3 rounded-lg font-medium text-white transition-colors ${
                selectedDirection === PositionDirection.LONG
                  ? "bg-green-60 hover:bg-green-70"
                  : "bg-red-60 hover:bg-red-70"
              }`}
            >
              Confirm{" "}
              {selectedDirection === PositionDirection.LONG ? "Buy" : "Sell"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
