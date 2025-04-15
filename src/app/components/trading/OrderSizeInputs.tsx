import { formatNumber } from "@/app/utils/number";
import { formatMarketName } from "../modal/TradingModal.util";
import { PercentageSlider } from "../PercentageSlider";
import { useOrderSize } from "@/app/hooks/trading";
import { useTradingStore } from "@/app/stores/tradingStore";

interface OrderSizeInputsProps {
  marketName: string;
  marketIndex: number;
}

export const OrderSizeInputs = ({
  marketName,
  marketIndex,
}: OrderSizeInputsProps) => {
  const {
    size,
    usdValue,
    sizePercentage,
    maxPositionSize,
    atMaxValue,
    handleSetSizePercentage,
    handleSetMaxSize,
    handleSizeChange,
    handleUsdValueChange,
  } = useOrderSize(marketIndex);

  const price = useTradingStore((state) => state.price);
  const isDisabled = price === 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-neutrals-80 dark:text-neutrals-30">
          Size
        </div>
        <div
          className="text-xs px-2 py-0.5 bg-neutrals-10 dark:bg-neutrals-80 rounded-full border border-neutrals-30/30 text-neutrals-60 dark:text-neutrals-40 cursor-pointer"
          onClick={handleSetMaxSize}
        >
          Max: {maxPositionSize ? formatNumber(maxPositionSize, true) : "0.00"}{" "}
          USD
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`relative bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border ${
            atMaxValue
              ? "border-yellow-500 dark:border-yellow-500"
              : "border-neutrals-20 dark:border-neutrals-70"
          }`}
        >
          <input
            type="number"
            value={
              size !== null && size !== undefined ? size.toFixed(5) : "0.00000"
            }
            onChange={(e) => handleSizeChange(e.target.value)}
            className={`w-full h-10 px-3 py-2 bg-transparent text-sm ${
              atMaxValue
                ? "text-yellow-500 dark:text-yellow-400"
                : "text-neutrals-100 dark:text-neutrals-0"
            } focus:outline-none`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="flex items-center gap-1.5">
              <div className="bg-purple-50/20 rounded-full px-2 py-0.5 text-purple-50 text-xs font-medium">
                {formatMarketName(marketName) || "Asset"}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`relative bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border ${
            atMaxValue
              ? "border-yellow-500 dark:border-yellow-500"
              : "border-neutrals-20 dark:border-neutrals-70"
          }`}
        >
          <input
            type="number"
            value={
              usdValue !== null && usdValue !== undefined
                ? usdValue.toFixed(2)
                : "0.00"
            }
            onChange={(e) => handleUsdValueChange(e.target.value)}
            className={`w-full h-10 px-3 py-2 bg-transparent text-sm ${
              atMaxValue
                ? "text-yellow-500 dark:text-yellow-400"
                : "text-neutrals-100 dark:text-neutrals-0"
            } focus:outline-none`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="bg-blue-90/20 rounded-full px-2 py-0.5 text-blue-40 text-xs font-medium">
              USD
            </div>
          </div>
        </div>
      </div>

      {/* Size Percentage Slider */}
      <div className="mt-4">
        <PercentageSlider
          percentage={sizePercentage}
          onChange={handleSetSizePercentage}
          sliderHeight="md"
          className="mb-3"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
