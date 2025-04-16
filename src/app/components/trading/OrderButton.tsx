import { PositionDirection } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import { formatMarketName } from "../modal/TradingModal.util";
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
  const size = useTradingStore((state) => state.size);
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const orderSubmitted = useTradingStore((state) => state.orderSubmitted);

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

    const buttonText = `${
      selectedDirection === PositionDirection.LONG ? "Buy" : "Sell"
    } ${
      size !== null && size !== undefined ? size.toFixed(2) : "0.00"
    } ${formatMarketName(marketName)}`;

    return buttonText;
  };

  return (
    <>
      <button
        onClick={handlePlaceOrder}
        disabled={isButtonDisabled}
        className={`w-full py-3 mt-auto rounded-lg font-medium text-base transition-colors ${
          selectedDirection === PositionDirection.LONG
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
