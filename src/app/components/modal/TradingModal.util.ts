import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { DropdownOption } from "../CustomDropdown";
import { TradingModalTab } from "@/types/orders";

export const distributionOptions: DropdownOption[] = [
  { value: "ascending", label: "Ascending (Entry → Target)" },
  { value: "descending", label: "Descending (Target → Entry)" },
  { value: "random", label: "Random" },
  { value: "flat", label: "Flat (Evenly spaced)" },
];

/**
 * Formats a market name by removing the "-PERP" suffix
 */
export const formatMarketName = (name?: string): string => {
  if (!name) return "Asset";
  return name.replace("-PERP", "");
};

/**
 * Calculate USD value: size * price
 */
export const calculateUsdValue = (size: number, price: number): number => {
  return size * price;
};

export const getOrderTypeFromTab = (tab: TradingModalTab): OrderType => {
  switch (tab) {
    case "market":
      return OrderType.MARKET;
    case "limit":
      return OrderType.LIMIT;
    case "stop-loss-market":
      return OrderType.TRIGGER_MARKET;
    case "stop-loss-limit":
      return OrderType.TRIGGER_LIMIT;
    case "take-profit-market":
      return OrderType.TRIGGER_MARKET;
    case "take-profit-limit":
      return OrderType.TRIGGER_LIMIT;
    default:
      return OrderType.MARKET;
  }
};

/**
 * Calculate size: usdValue / price
 */
export const calculateSize = (usdValue: number, price: number): number => {
  if (price === 0) return 0;
  return usdValue / price;
};

/**
 * Calculate default take profit and stop loss prices based on position direction
 */
export const calculateTPSLPrices = (
  currentPrice: number,
  direction: PositionDirection
) => {
  if (direction === PositionDirection.LONG) {
    // For long: TP above entry, SL below entry
    return {
      takeProfitPrice: currentPrice * 1.1,
      stopLossPrice: currentPrice * 0.9,
      takeProfitLimitPrice: currentPrice * 1.1 * 0.99,
      stopLossLimitPrice: currentPrice * 0.9 * 0.99,
    };
  } else {
    // For short: TP below entry, SL above entry
    return {
      takeProfitPrice: currentPrice * 0.9,
      stopLossPrice: currentPrice * 1.1,
      takeProfitLimitPrice: currentPrice * 0.9 * 1.01,
      stopLossLimitPrice: currentPrice * 1.1 * 1.01,
    };
  }
};

/**
 * Get default scale order price range
 */
export const getScaleOrderPriceRange = (basePrice: number) => {
  return {
    minPrice: basePrice * 0.95,
    maxPrice: basePrice * 1.05,
  };
};

/**
 * Check if the value is at or near max
 */
export const isAtMaxValue = (value: number, max: number): boolean => {
  if (max <= 0 || value === 0) return false;
  // Consider it at max if it's within 1% of the max value
  return value >= (max * 99) / 100;
};

/**
 * Check if an order type is a limit-based order
 */
export const isLimitOrderType = (orderType: OrderType): boolean => {
  return orderType === OrderType.LIMIT || orderType === OrderType.TRIGGER_LIMIT;
};

/**
 * Check if an order type is a trigger-based order
 */
export const isTriggerOrderType = (orderType: OrderType): boolean => {
  return (
    orderType === OrderType.TRIGGER_MARKET ||
    orderType === OrderType.TRIGGER_LIMIT
  );
};

/**
 * Check if an order type is a stop-based trigger order
 */
export const isStopOrderType = (orderType: OrderType): boolean => {
  return (
    orderType === OrderType.TRIGGER_MARKET ||
    orderType === OrderType.TRIGGER_LIMIT
  );
};

/**
 * Check if an order type is a market-based trigger order
 */
export const isMarketTriggerOrderType = (orderType: OrderType): boolean => {
  return orderType === OrderType.TRIGGER_MARKET;
};

/**
 * Check if an order type is a limit-based trigger order
 */
export const isLimitTriggerOrderType = (orderType: OrderType): boolean => {
  return orderType === OrderType.TRIGGER_LIMIT;
};

/**
 * Check if limit price section should be displayed
 */
export const shouldShowLimitPrice = (orderType: OrderType): boolean => {
  return orderType === OrderType.LIMIT || orderType === OrderType.TRIGGER_LIMIT;
};

/**
 * Limit USD value to 2 decimal places
 */
export const limitUsdValue = (value: number): number => {
  return parseFloat(value.toFixed(2));
};

/**
 * Limit size value to 6 decimal places
 */
export const limitSizeValue = (value: number): number => {
  return parseFloat(value.toFixed(6));
};
