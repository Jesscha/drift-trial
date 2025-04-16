import { OrderType, PositionDirection, QUOTE_PRECISION } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import {
  isTriggerOrderType,
  calculateTPSLPrices,
} from "../modal/TradingModal.util";
import { useEffect } from "react";
import { useOraclePrice } from "@/app/hooks/useOraclePrice";

interface TakeProfitStopLossSectionProps {
  marketIndex?: number;
}

export const TakeProfitStopLossSection = ({
  marketIndex = 0,
}: TakeProfitStopLossSectionProps) => {
  // Get TP/SL related state and functions directly from the store
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const price = useTradingStore((state) => state.price);

  // Take Profit state
  const enableTakeProfit = useTradingStore((state) => state.enableTakeProfit);
  const setEnableTakeProfit = useTradingStore(
    (state) => state.setEnableTakeProfit
  );
  const takeProfitPrice = useTradingStore((state) => state.takeProfitPrice);
  const setTakeProfitPrice = useTradingStore(
    (state) => state.setTakeProfitPrice
  );
  const takeProfitOrderType = useTradingStore(
    (state) => state.takeProfitOrderType
  );
  const setTakeProfitOrderType = useTradingStore(
    (state) => state.setTakeProfitOrderType
  );
  const takeProfitLimitPrice = useTradingStore(
    (state) => state.takeProfitLimitPrice
  );
  const setTakeProfitLimitPrice = useTradingStore(
    (state) => state.setTakeProfitLimitPrice
  );

  const enableStopLoss = useTradingStore((state) => state.enableStopLoss);
  const setEnableStopLoss = useTradingStore((state) => state.setEnableStopLoss);
  const stopLossPrice = useTradingStore((state) => state.stopLossPrice);
  const setStopLossPrice = useTradingStore((state) => state.setStopLossPrice);
  const stopLossOrderType = useTradingStore((state) => state.stopLossOrderType);
  const setStopLossOrderType = useTradingStore(
    (state) => state.setStopLossOrderType
  );
  const stopLossLimitPrice = useTradingStore(
    (state) => state.stopLossLimitPrice
  );
  const setStopLossLimitPrice = useTradingStore(
    (state) => state.setStopLossLimitPrice
  );
  const customOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );

  // Get oracle price as backup
  const { oraclePrice: oraclePriceBN } = useOraclePrice(marketIndex);
  const oraclePrice = oraclePriceBN
    ? parseFloat(oraclePriceBN.div(QUOTE_PRECISION).toString())
    : null;

  // Use either direct price or oracle price
  const effectivePrice = price || oraclePrice;

  useEffect(() => {
    if (effectivePrice) {
      const {
        takeProfitPrice: defaultTP,
        stopLossPrice: defaultSL,
        takeProfitLimitPrice: defaultTPLimit,
        stopLossLimitPrice: defaultSLLimit,
      } = calculateTPSLPrices(effectivePrice, selectedDirection);

      if (enableTakeProfit && takeProfitPrice === null) {
        setTakeProfitPrice(parseFloat(defaultTP.toFixed(2)));
        setTakeProfitLimitPrice(parseFloat(defaultTPLimit.toFixed(2)));
      }

      if (enableStopLoss && stopLossPrice === null) {
        setStopLossPrice(parseFloat(defaultSL.toFixed(2)));
        setStopLossLimitPrice(parseFloat(defaultSLLimit.toFixed(2)));
      }
    }
  }, [
    enableTakeProfit,
    enableStopLoss,
    effectivePrice,
    selectedDirection,
    takeProfitPrice,
    stopLossPrice,
    takeProfitOrderType,
    stopLossOrderType,
    takeProfitLimitPrice,
    stopLossLimitPrice,
    setTakeProfitPrice,
    setStopLossPrice,
    setTakeProfitLimitPrice,
    setStopLossLimitPrice,
  ]);

  if (isTriggerOrderType(customOrderType)) {
    return null;
  }

  return (
    <div>
      <div className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
        {/* Header with toggles */}
        <div className="flex items-center p-2 border-b border-neutrals-20 dark:border-neutrals-70">
          <div className="flex flex-1 space-x-3">
            {/* Take Profit Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs font-medium text-neutrals-100 dark:text-neutrals-0">
                TP
              </span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTakeProfit}
                  onChange={(e) => setEnableTakeProfit(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full ${
                    enableTakeProfit
                      ? "bg-purple-50"
                      : "bg-neutrals-30 dark:bg-neutrals-70"
                  } transition-colors duration-200`}
                >
                  <div
                    className={`transform ${
                      enableTakeProfit ? "translate-x-4" : "translate-x-0"
                    } transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow-md`}
                  ></div>
                </div>
              </label>
            </div>

            {/* Stop Loss Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-xs font-medium text-neutrals-100 dark:text-neutrals-0">
                SL
              </span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableStopLoss}
                  onChange={(e) => setEnableStopLoss(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-4 rounded-full ${
                    enableStopLoss
                      ? "bg-purple-50"
                      : "bg-neutrals-30 dark:bg-neutrals-70"
                  } transition-colors duration-200`}
                >
                  <div
                    className={`transform ${
                      enableStopLoss ? "translate-x-4" : "translate-x-0"
                    } transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow-md`}
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Content area for TP/SL settings */}
        {(enableTakeProfit || enableStopLoss) && (
          <div className="p-3">
            {/* Grid layout for both TP and SL fields */}
            <div className="grid grid-cols-2 gap-3">
              {/* Take Profit Column */}
              {enableTakeProfit && (
                <div className="space-y-2 border-r border-neutrals-20 dark:border-neutrals-70 pr-3">
                  <div className="text-xs font-medium text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Take Profit
                  </div>

                  <div>
                    <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                      {takeProfitOrderType === OrderType.MARKET
                        ? "Price"
                        : "Trigger Price"}
                    </div>
                    <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                      <input
                        type="number"
                        value={takeProfitPrice !== null ? takeProfitPrice : ""}
                        onChange={(e) => {
                          if (!e.target.value) {
                            setTakeProfitPrice(null);
                            return;
                          }
                          setTakeProfitPrice(parseFloat(e.target.value));
                        }}
                        placeholder="TP Price"
                        className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                      Order Type
                    </div>
                    <select
                      value={
                        takeProfitOrderType === OrderType.MARKET
                          ? "Market"
                          : "Limit"
                      }
                      onChange={(e) =>
                        setTakeProfitOrderType(
                          e.target.value === "Market"
                            ? OrderType.MARKET
                            : OrderType.LIMIT
                        )
                      }
                      className="w-full h-8 px-2 py-1 bg-neutrals-0 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-lg text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                    >
                      <option value="Limit">Limit</option>
                      <option value="Market">Market</option>
                    </select>
                  </div>

                  {takeProfitOrderType === OrderType.LIMIT && (
                    <div>
                      <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                        Limit Price
                      </div>
                      <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                        <input
                          type="number"
                          value={
                            takeProfitLimitPrice !== null
                              ? takeProfitLimitPrice
                              : ""
                          }
                          onChange={(e) => {
                            if (!e.target.value) {
                              setTakeProfitLimitPrice(null);
                              return;
                            }
                            setTakeProfitLimitPrice(parseFloat(e.target.value));
                          }}
                          placeholder="Limit Price"
                          className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-green-500">
                    {selectedDirection === PositionDirection.LONG
                      ? "Sell"
                      : "Buy"}{" "}
                    at {takeProfitPrice || "price"} USD
                    {takeProfitOrderType === OrderType.LIMIT
                      ? ` with limit ${takeProfitLimitPrice || "price"} USD`
                      : ""}
                  </div>
                </div>
              )}

              {/* Stop Loss Column */}
              {enableStopLoss && (
                <div className={`space-y-2 ${enableTakeProfit ? "pl-1" : ""}`}>
                  <div className="text-xs font-medium text-red-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Stop Loss
                  </div>

                  <div>
                    <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                      {stopLossOrderType === OrderType.MARKET
                        ? "Price"
                        : "Trigger Price"}
                    </div>
                    <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                      <input
                        type="number"
                        value={stopLossPrice !== null ? stopLossPrice : ""}
                        onChange={(e) => {
                          if (!e.target.value) {
                            setStopLossPrice(null);
                            return;
                          }
                          setStopLossPrice(parseFloat(e.target.value));
                        }}
                        placeholder="SL Price"
                        className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                      Order Type
                    </div>
                    <select
                      value={
                        stopLossOrderType === OrderType.MARKET
                          ? "Market"
                          : "Limit"
                      }
                      onChange={(e) =>
                        setStopLossOrderType(
                          e.target.value === "Market"
                            ? OrderType.MARKET
                            : OrderType.LIMIT
                        )
                      }
                      className="w-full h-8 px-2 py-1 bg-neutrals-0 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-lg text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                    >
                      <option value="Market">Market</option>
                      <option value="Limit">Limit</option>
                    </select>
                  </div>

                  {stopLossOrderType === OrderType.LIMIT && (
                    <div>
                      <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                        Limit Price
                      </div>
                      <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                        <input
                          type="number"
                          value={
                            stopLossLimitPrice !== null
                              ? stopLossLimitPrice
                              : ""
                          }
                          onChange={(e) => {
                            if (!e.target.value) {
                              setStopLossLimitPrice(null);
                              return;
                            }
                            setStopLossLimitPrice(parseFloat(e.target.value));
                          }}
                          placeholder="Limit Price"
                          className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-red-500">
                    {selectedDirection === PositionDirection.LONG
                      ? "Sell"
                      : "Buy"}{" "}
                    at {stopLossPrice || "price"} USD
                    {stopLossOrderType === OrderType.LIMIT
                      ? ` with limit ${stopLossLimitPrice || "price"} USD`
                      : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
