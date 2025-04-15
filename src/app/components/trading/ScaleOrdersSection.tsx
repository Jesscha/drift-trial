import { BN, OrderType } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import { CustomDropdown } from "../CustomDropdown";
import { useOrderFeatures } from "@/app/hooks/trading";

interface ScaleOrdersSectionProps {
  marketIndex: number;
}

export const ScaleOrdersSection = ({}: ScaleOrdersSectionProps) => {
  // Get scale orders related state and functions directly from the store
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const setUseScaleOrders = useTradingStore((state) => state.setUseScaleOrders);
  const numScaleOrders = useTradingStore((state) => state.numScaleOrders);
  const setNumScaleOrders = useTradingStore((state) => state.setNumScaleOrders);
  const minPrice = useTradingStore((state) => state.minPrice);
  const setMinPrice = useTradingStore((state) => state.setMinPrice);
  const maxPrice = useTradingStore((state) => state.maxPrice);
  const setMaxPrice = useTradingStore((state) => state.setMaxPrice);
  const scaleDistribution = useTradingStore((state) => state.scaleDistribution);
  const priceBN = useTradingStore((state) => state.priceBN);
  const orderType = useTradingStore((state) => state.selectedOrderType);

  // Get distribution options and handler from useOrderFeatures
  const { distributionOptions, handleDistributionChange } = useOrderFeatures();

  if (orderType !== OrderType.LIMIT) return null;

  return (
    <div>
      <div className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
        {/* Header with toggle */}
        <div className="flex items-center p-2 border-b border-neutrals-20 dark:border-neutrals-70">
          <div className="flex flex-1 space-x-3">
            {/* Scale Orders Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-xs font-medium text-neutrals-100 dark:text-neutrals-0">
                Scale Orders
              </span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useScaleOrders}
                  onChange={(e) => setUseScaleOrders(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full ${
                    useScaleOrders
                      ? "bg-purple-50"
                      : "bg-neutrals-30 dark:bg-neutrals-70"
                  } transition-colors duration-200`}
                >
                  <div
                    className={`transform ${
                      useScaleOrders ? "translate-x-4" : "translate-x-0"
                    } transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow-md`}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Content area for Scale Orders settings */}
        {useScaleOrders && (
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                  Orders
                </div>
                <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={numScaleOrders}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0) {
                        setNumScaleOrders(value);
                      }
                    }}
                    min="2"
                    max="10"
                    className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                  Start Price
                </div>
                <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={
                      minPrice !== null
                        ? minPrice
                        : priceBN
                        ? (parseFloat(priceBN.toString()) / 1e6) * 0.95
                        : ""
                    }
                    onChange={(e) => {
                      if (!e.target.value) {
                        setMinPrice(null);
                        return;
                      }
                      setMinPrice(parseFloat(e.target.value));
                    }}
                    placeholder="Min"
                    className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none placeholder:text-neutrals-60 dark:placeholder:text-neutrals-40"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                  End Price
                </div>
                <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={
                      maxPrice !== null
                        ? maxPrice
                        : priceBN
                        ? (parseFloat(priceBN.toString()) / 1e6) * 1.05
                        : ""
                    }
                    onChange={(e) => {
                      if (!e.target.value) {
                        setMaxPrice(null);
                        return;
                      }
                      setMaxPrice(parseFloat(e.target.value));
                    }}
                    placeholder="Max"
                    className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none placeholder:text-neutrals-60 dark:placeholder:text-neutrals-40"
                  />
                </div>
              </div>
            </div>

            {/* Distribution Type Selection */}
            <div className="mt-2">
              <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                Distribution
              </div>
              <CustomDropdown
                options={distributionOptions}
                value={scaleDistribution}
                onChange={handleDistributionChange}
                className="py-1 text-xs"
              />
            </div>

            <div className="text-xs text-blue-500 mt-2">
              {numScaleOrders} {numScaleOrders === 1 ? "order" : "orders"}{" "}
              between{" "}
              {minPrice !== null
                ? minPrice
                : priceBN
                ? ((parseFloat(priceBN.toString()) / 1e6) * 0.95).toFixed(2)
                : "..."}{" "}
              and{" "}
              {maxPrice !== null
                ? maxPrice
                : priceBN
                ? ((parseFloat(priceBN.toString()) / 1e6) * 1.05).toFixed(2)
                : "..."}{" "}
              USD
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
