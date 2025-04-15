import { BN, PositionDirection } from "@drift-labs/sdk";
import { TriggerCondition } from "@/app/hooks/usePerpOrder";
import { useTradingStore } from "@/app/stores/tradingStore";
import { OrderTypeOption, formatMarketName } from "../modal/TradingModal.util";
import { formatBN } from "@/app/utils/number";
import { useOrderExecution } from "@/app/hooks/trading";

interface OrderButtonProps {
  marketName: string;
  marketIndex: number;
  onOrderConfirmed: () => void;
}

export const OrderButton = ({
  marketName,
  marketIndex,
  onOrderConfirmed,
}: OrderButtonProps) => {
  const sizeBN = useTradingStore((state) => state.sizeBN);
  const priceBN = useTradingStore((state) => state.priceBN);
  const triggerPriceBN = useTradingStore((state) => state.triggerPriceBN);
  const triggerCondition = useTradingStore((state) => state.triggerCondition);
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );
  const orderSubmitted = useTradingStore((state) => state.orderSubmitted);
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const numScaleOrders = useTradingStore((state) => state.numScaleOrders);
  const scaleDistribution = useTradingStore((state) => state.scaleDistribution);

  const { isOrderLoading, txStatus, isButtonDisabled, handlePlaceOrder } =
    useOrderExecution(marketIndex, onOrderConfirmed);

  // Generate the button text
  const getOrderButtonText = () => {
    if (isOrderLoading || orderSubmitted) {
      if (txStatus) {
        if (txStatus.status === "processing") return "Processing...";
        if (txStatus.status === "confirmed") return "Order Confirmed!";
        if (txStatus.status === "failed") return "Order Failed";
        return "Submitting...";
      }
      return "Submitting...";
    }

    // Base button text
    let buttonText = `${
      selectedDirection === "long" ? "Buy" : "Sell"
    } ${formatBN(sizeBN.div(new BN(1e6)))} ${formatMarketName(marketName)}`;

    // Order type details
    if (
      useScaleOrders &&
      selectedCustomOrderType === OrderTypeOption.LIMIT &&
      priceBN
    ) {
      const distributionSymbol =
        scaleDistribution === "ascending"
          ? "↑"
          : scaleDistribution === "descending"
          ? "↓"
          : scaleDistribution === "random"
          ? "↔"
          : "=";
      buttonText += ` • Scale ${distributionSymbol} (${numScaleOrders})`;
    } else {
      switch (selectedCustomOrderType) {
        case OrderTypeOption.MARKET:
          buttonText += " at Market";
          break;
        case OrderTypeOption.LIMIT:
          buttonText += priceBN
            ? ` at ${parseFloat(priceBN.toString()) / 1e6}`
            : "";
          break;
        case OrderTypeOption.STOP_MARKET:
          buttonText += triggerPriceBN
            ? ` Stop ${
                triggerCondition === TriggerCondition.ABOVE ? "↑" : "↓"
              } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
            : "";
          break;
        case OrderTypeOption.STOP_LIMIT:
          buttonText +=
            triggerPriceBN && priceBN
              ? ` Stop ${parseFloat(priceBN.toString()) / 1e6} @ ${
                  triggerCondition === TriggerCondition.ABOVE ? "↑" : "↓"
                } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
              : "";
          break;
        case OrderTypeOption.TAKE_PROFIT:
          buttonText += triggerPriceBN
            ? ` TP ${triggerCondition === TriggerCondition.ABOVE ? "↑" : "↓"} ${
                parseFloat(triggerPriceBN.toString()) / 1e6
              }`
            : "";
          break;
        case OrderTypeOption.TAKE_PROFIT_LIMIT:
          buttonText +=
            triggerPriceBN && priceBN
              ? ` TP ${parseFloat(priceBN.toString()) / 1e6} @ ${
                  triggerCondition === TriggerCondition.ABOVE ? "↑" : "↓"
                } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
              : "";
          break;
        case OrderTypeOption.ORACLE_LIMIT:
          buttonText += " Oracle";
          break;
        default:
          break;
      }
    }

    return buttonText;
  };

  return (
    <>
      <button
        onClick={handlePlaceOrder}
        disabled={isButtonDisabled}
        className={`w-full py-3 mt-auto rounded-lg font-medium text-base transition-colors ${
          selectedDirection === "long"
            ? "bg-green-60 hover:bg-green-70"
            : "bg-red-60 hover:bg-red-70"
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {getOrderButtonText()}
      </button>

      {txStatus?.status === "failed" && (
        <div className="mt-2 text-red-500 text-sm text-center">
          Transaction failed: {txStatus.error || "Unknown error"}
        </div>
      )}
    </>
  );
};
