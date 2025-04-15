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
import { PositionDirection } from "@drift-labs/sdk";

interface OrderInputSectionProps {
  marketIndex: number;
}

interface TriggerConditionSelectProps {
  value: TriggerCondition;
  onChange: (value: string | number) => void;
  orderType: OrderTypeOption;
  direction: PositionDirection;
}

// Helper component for trigger condition selection
const TriggerConditionSelect = ({
  value,
  onChange,
  orderType,
  direction,
}: TriggerConditionSelectProps) => {
  const options = [
    { value: TriggerCondition.ABOVE, label: "Above" },
    { value: TriggerCondition.BELOW, label: "Below" },
  ];

  return (
    <CustomDropdown
      options={options}
      value={value}
      onChange={onChange}
      className="w-full rounded-r-lg h-10"
    />
  );
};

export const OrderInputSection = ({ marketIndex }: OrderInputSectionProps) => {
  const {
    price,
    setPrice,
    triggerPrice,
    setTriggerPrice,
    triggerCondition,
    handlePriceClick,
    handleTriggerConditionChange,
    setOracleAsPrice,
    setOracleAsTriggerPrice,
  } = useOrderPrice(marketIndex);
  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);

  return (
    <>
      {/* Trigger Price section for Stop orders and Take Profit orders*/}
      {triggerPrice !== null && isTriggerOrderType(selectedCustomOrderType) && (
        <>
          <div className="text-sm text-neutrals-80 dark:text-neutrals-30 mb-1">
            Trigger Price
          </div>
          <div className="mb-4 overflow-hidden">
            <div className="flex mb-2">
              <div className="rounded-l-md overflow-hidden flex-1">
                <div className="relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 rounded-l-lg border border-neutrals-20 dark:border-neutrals-70">
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
              <div className="w-48">
                <TriggerConditionSelect
                  value={triggerCondition}
                  onChange={handleTriggerConditionChange}
                  orderType={selectedCustomOrderType}
                  direction={selectedDirection}
                />
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
