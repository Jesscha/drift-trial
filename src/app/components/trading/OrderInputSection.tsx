import { useTradingStore } from "@/app/stores/tradingStore";
import {
  isTriggerOrderType,
  OrderTypeOption,
  shouldShowLimitPrice,
} from "../modal/TradingModal.util";
import { useOrderPrice } from "@/app/hooks/trading";

interface OrderInputSectionProps {
  marketIndex: number;
}

export const OrderInputSection = ({ marketIndex }: OrderInputSectionProps) => {
  const { setOracleAsPrice, setOracleAsTriggerPrice } =
    useOrderPrice(marketIndex);
  const price = useTradingStore((state) => state.price);
  const setPrice = useTradingStore((state) => state.setPrice);
  const triggerPrice = useTradingStore((state) => state.triggerPrice);
  const setTriggerPrice = useTradingStore((state) => state.setTriggerPrice);

  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);

  return (
    <>
      {isTriggerOrderType(selectedCustomOrderType) && (
        <div className="flex flex-col ">
          <div className="text-sm text-neutrals-80 dark:text-neutrals-30 mb-1">
            Trigger Price
          </div>
          <div className="mb-4 overflow-hidden">
            <div className="flex">
              <div className="rounded-l-md overflow-hidden flex-1">
                <div className="relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 rounded border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={triggerPrice || ""}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setTriggerPrice(null);
                        return;
                      }

                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        setTriggerPrice(value);
                      }
                    }}
                    placeholder=""
                    className="w-full h-10 px-3 py-2 bg-transparent text-sm text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      onClick={setOracleAsTriggerPrice}
                      className="text-purple-50 text-xs font-medium"
                    >
                      Oracle
                    </button>
                    <div className="bg-neutrals-20 dark:bg-neutrals-70 rounded-full px-2 py-0.5 text-neutrals-80 dark:text-neutrals-20 text-xs font-medium">
                      USD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Limit Price section - Only show for limit-based orders */}
      {shouldShowLimitPrice(selectedCustomOrderType) && (
        <div>
          <div className="text-sm text-neutrals-80 dark:text-neutrals-30 mb-1">
            {selectedCustomOrderType === OrderTypeOption.LIMIT && useScaleOrders
              ? "Starting Price"
              : "Limit Price"}
          </div>
          <div className="relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
            <input
              type="number"
              value={price || ""}
              onChange={(e) => {
                if (!e.target.value) {
                  setPrice(null);
                  return;
                }

                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setPrice(value);
                }
              }}
              placeholder="Enter Price"
              className="w-full h-10 px-3 py-2 bg-transparent text-sm text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
              <button
                onClick={setOracleAsPrice}
                className="text-purple-50 text-xs font-medium"
              >
                Oracle
              </button>
              <div className="bg-neutrals-20 dark:bg-neutrals-70 rounded-full px-2 py-0.5 text-neutrals-80 dark:text-neutrals-20 text-xs font-medium">
                USD
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
