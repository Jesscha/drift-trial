import { BN } from "@drift-labs/sdk";
import { TriggerCondition } from "@/app/hooks/usePerpOrder";
import { useTradingStore } from "@/app/stores/tradingStore";
import { CustomDropdown } from "../CustomDropdown";
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
  const priceBN = useTradingStore((state) => state.priceBN);
  const triggerPriceBN = useTradingStore((state) => state.triggerPriceBN);
  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);

  const {
    setOracleAsPrice,
    setOracleAsTriggerPrice,
    setPriceBN,
    setTriggerPriceBN,
  } = useOrderPrice(marketIndex);

  return (
    <>
      {/* Trigger Price section for Stop orders and Take Profit orders*/}
      {triggerPriceBN !== null &&
        isTriggerOrderType(selectedCustomOrderType) && (
          <>
            <div>
              <div className="text-sm text-neutrals-80 dark:text-neutrals-30 mb-1">
                Trigger Price
              </div>
              <div className="relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                <input
                  type="number"
                  value={
                    triggerPriceBN
                      ? parseFloat(triggerPriceBN.toString()) / 1e6
                      : ""
                  }
                  onChange={(e) => {
                    if (!e.target.value) {
                      setTriggerPriceBN(null);
                      return;
                    }

                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setTriggerPriceBN(new BN(value * 1e6));
                    }
                  }}
                  placeholder="Enter Trigger Price"
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
          </>
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
              value={priceBN ? parseFloat(priceBN.toString()) / 1e6 : ""}
              onChange={(e) => {
                if (!e.target.value) {
                  setPriceBN(null);
                  return;
                }

                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setPriceBN(new BN(value * 1e6));
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
