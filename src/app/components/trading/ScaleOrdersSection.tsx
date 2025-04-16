import { PositionDirection } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import { CustomDropdown } from "../CustomDropdown";
import { useOrderFeatures } from "@/app/hooks/trading";
import { useEffect } from "react";

export const ScaleOrdersSection = () => {
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const setUseScaleOrders = useTradingStore((state) => state.setUseScaleOrders);
  const numScaleOrders = useTradingStore((state) => state.numScaleOrders);
  const setNumScaleOrders = useTradingStore((state) => state.setNumScaleOrders);
  const minPrice = useTradingStore((state) => state.minPrice);
  const setMinPrice = useTradingStore((state) => state.setMinPrice);
  const maxPrice = useTradingStore((state) => state.maxPrice);
  const setMaxPrice = useTradingStore((state) => state.setMaxPrice);
  const scaleDistribution = useTradingStore((state) => state.scaleDistribution);
  const price = useTradingStore((state) => state.price);
  const selectedDirection = useTradingStore((state) => state.selectedDirection);

  const { distributionOptions, handleDistributionChange } = useOrderFeatures();

  // Determine if inputs should be readonly based on position direction
  const isLongPosition = selectedDirection === PositionDirection.LONG;

  useEffect(() => {
    if (price && useScaleOrders) {
      if (selectedDirection === PositionDirection.LONG) {
        setMaxPrice(price);
        if (minPrice === null) {
          setMinPrice(price * 0.95);
        }
      } else {
        // SHORT position
        setMinPrice(price);
        if (maxPrice === null) {
          setMaxPrice(price * 1.05);
        }
      }
    }
  }, [
    price,
    useScaleOrders,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    selectedDirection,
  ]);

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
        {useScaleOrders && (
          <div className="p-3">
            {/* Direction-specific explanation */}
            <div className="mb-2 text-xs text-neutrals-60 dark:text-neutrals-40">
              {isLongPosition
                ? "For long positions, orders will scale from lowest price to entry price."
                : "For short positions, orders will scale from entry price to highest price."}
            </div>

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
                      setNumScaleOrders(value);
                    }}
                    min="2"
                    max="10"
                    className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                  {isLongPosition ? "Lowest Price" : "Entry Price"}
                </div>
                <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={
                      isLongPosition
                        ? minPrice !== null
                          ? minPrice
                          : price
                          ? price * 0.95
                          : ""
                        : price || ""
                    }
                    onChange={(e) => {
                      if (!e.target.value) {
                        setMinPrice(null);
                        return;
                      }
                      setMinPrice(parseFloat(e.target.value));
                    }}
                    readOnly={!isLongPosition}
                    placeholder={isLongPosition ? "Min" : "Entry"}
                    className={`w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none placeholder:text-neutrals-60 dark:placeholder:text-neutrals-40 ${
                      !isLongPosition ? "opacity-75" : ""
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                  {isLongPosition ? "Entry Price" : "Highest Price"}
                </div>
                <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={
                      isLongPosition
                        ? price || ""
                        : maxPrice !== null
                        ? maxPrice
                        : price
                        ? price * 1.05
                        : ""
                    }
                    onChange={(e) => {
                      if (!e.target.value) {
                        setMaxPrice(null);
                        return;
                      }
                      setMaxPrice(parseFloat(e.target.value));
                    }}
                    readOnly={isLongPosition}
                    placeholder={isLongPosition ? "Entry" : "Max"}
                    className={`w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none placeholder:text-neutrals-60 dark:placeholder:text-neutrals-40 ${
                      isLongPosition ? "opacity-75" : ""
                    }`}
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
              {isLongPosition
                ? "from lowest to entry price"
                : "from entry to highest price"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
