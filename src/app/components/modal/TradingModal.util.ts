import { OrderType, BN, PositionDirection } from "@drift-labs/sdk";
import { TriggerCondition } from "@/app/hooks/usePerpOrder";
import { DropdownOption } from "../CustomDropdown";

// Define order types that map to SDK OrderType
export enum OrderTypeOption {
  MARKET = "Market",
  LIMIT = "Limit",
  STOP_MARKET = "Stop Market",
  STOP_LIMIT = "Stop Limit",
  TAKE_PROFIT = "Take Profit",
  TAKE_PROFIT_LIMIT = "Take Profit Limit",
}

export const distributionOptions: DropdownOption[] = [
  { value: "ascending", label: "Ascending (Low to High)" },
  { value: "descending", label: "Descending (High to Low)" },
  { value: "random", label: "Random" },
  { value: "flat", label: "Flat" },
];

/**
 * Maps our UI-friendly order types to SDK order types
 */
export const getSDKOrderType = (orderType: OrderTypeOption): OrderType => {
  switch (orderType) {
    case OrderTypeOption.MARKET:
      return OrderType.MARKET;
    case OrderTypeOption.LIMIT:
      return OrderType.LIMIT;
    case OrderTypeOption.STOP_MARKET:
    case OrderTypeOption.TAKE_PROFIT:
      return OrderType.TRIGGER_MARKET;
    case OrderTypeOption.STOP_LIMIT:
    case OrderTypeOption.TAKE_PROFIT_LIMIT:
      return OrderType.TRIGGER_LIMIT;
    default:
      return OrderType.MARKET;
  }
};

/**
 * Helper to create mapping for SDK order type to UI order type (for initialization)
 */
export const mapSDKToUIOrderType = (
  sdkOrderType: OrderType
): OrderTypeOption => {
  switch (sdkOrderType) {
    case OrderType.MARKET:
      return OrderTypeOption.MARKET;
    case OrderType.LIMIT:
      return OrderTypeOption.LIMIT;
    case OrderType.TRIGGER_MARKET:
      return OrderTypeOption.STOP_MARKET; // Default to Stop Market for trigger market
    case OrderType.TRIGGER_LIMIT:
      return OrderTypeOption.STOP_LIMIT; // Default to Stop Limit for trigger limit
    default:
      return OrderTypeOption.MARKET;
  }
};

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
export const calculateUsdValue = (size: BN, price: BN): BN => {
  return size.mul(price).div(new BN(1e6));
};

/**
 * Calculate size: usdValue / price
 */
export const calculateSize = (usdValue: BN, price: BN): BN => {
  if (price.isZero()) return new BN(0);
  return usdValue.mul(new BN(1e6)).div(price);
};

/**
 * Get the order type display info for UI rendering
 */
export const getOrderTypeInfo = () => ({
  [OrderTypeOption.MARKET]: {
    label: "Market",
    description: "Execute at current market price",
    color: "text-blue-500",
  },
  [OrderTypeOption.LIMIT]: {
    label: "Limit",
    description: "Execute at specified price or better",
    color: "text-green-500",
  },
  [OrderTypeOption.STOP_MARKET]: {
    label: "Stop Market",
    description: "Market order when trigger price is reached",
    color: "text-purple-400",
  },
  [OrderTypeOption.STOP_LIMIT]: {
    label: "Stop Limit",
    description: "Limit order when trigger price is reached",
    color: "text-purple-500",
  },
  [OrderTypeOption.TAKE_PROFIT]: {
    label: "Take Profit",
    description: "Market order to take profit at target price",
    color: "text-green-500",
  },
  [OrderTypeOption.TAKE_PROFIT_LIMIT]: {
    label: "Take Profit Limit",
    description: "Limit order to take profit at target price",
    color: "text-green-400",
  },
});

/**
 * Get default trigger condition based on order type and position direction
 */
export const getDefaultTriggerCondition = (
  orderType: OrderTypeOption,
  direction: PositionDirection
): TriggerCondition => {
  if (
    (orderType === OrderTypeOption.STOP_MARKET ||
      orderType === OrderTypeOption.STOP_LIMIT) &&
    direction === "long"
  ) {
    return TriggerCondition.BELOW;
  } else if (
    (orderType === OrderTypeOption.TAKE_PROFIT ||
      orderType === OrderTypeOption.TAKE_PROFIT_LIMIT) &&
    direction === "long"
  ) {
    return TriggerCondition.ABOVE;
  } else if (
    (orderType === OrderTypeOption.STOP_MARKET ||
      orderType === OrderTypeOption.STOP_LIMIT) &&
    direction === "short"
  ) {
    return TriggerCondition.ABOVE;
  } else {
    return TriggerCondition.BELOW;
  }
};

/**
 * Calculate default take profit and stop loss prices based on position direction
 */
export const calculateTPSLPrices = (
  currentPrice: number,
  direction: PositionDirection
) => {
  if (direction === "long") {
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
export const isAtMaxValue = (value: BN, max: BN): boolean => {
  if (!max.gt(new BN(0)) || value.isZero()) return false;
  // Consider it at max if it's within 1% of the max value
  return value.gte(max.mul(new BN(99)).div(new BN(100)));
};

/**
 * Check if an order type is a limit-based order
 */
export const isLimitOrderType = (orderType: OrderTypeOption): boolean => {
  return [
    OrderTypeOption.LIMIT,
    OrderTypeOption.STOP_LIMIT,
    OrderTypeOption.TAKE_PROFIT_LIMIT,
  ].includes(orderType);
};

/**
 * Check if an order type is a trigger-based order
 */
export const isTriggerOrderType = (orderType: OrderTypeOption): boolean => {
  return [
    OrderTypeOption.STOP_MARKET,
    OrderTypeOption.STOP_LIMIT,
    OrderTypeOption.TAKE_PROFIT,
    OrderTypeOption.TAKE_PROFIT_LIMIT,
  ].includes(orderType);
};

/**
 * Check if an order type is a stop-based trigger order
 */
export const isStopOrderType = (orderType: OrderTypeOption): boolean => {
  return [OrderTypeOption.STOP_MARKET, OrderTypeOption.STOP_LIMIT].includes(
    orderType
  );
};

/**
 * Check if an order type is a take-profit-based trigger order
 */
export const isTakeProfitOrderType = (orderType: OrderTypeOption): boolean => {
  return [
    OrderTypeOption.TAKE_PROFIT,
    OrderTypeOption.TAKE_PROFIT_LIMIT,
  ].includes(orderType);
};

/**
 * Check if an order type is a market-based trigger order
 */
export const isMarketTriggerOrderType = (
  orderType: OrderTypeOption
): boolean => {
  return [OrderTypeOption.STOP_MARKET, OrderTypeOption.TAKE_PROFIT].includes(
    orderType
  );
};

/**
 * Check if an order type is a limit-based trigger order
 */
export const isLimitTriggerOrderType = (
  orderType: OrderTypeOption
): boolean => {
  return [
    OrderTypeOption.STOP_LIMIT,
    OrderTypeOption.TAKE_PROFIT_LIMIT,
  ].includes(orderType);
};

/**
 * Check if limit price section should be displayed
 */
export const shouldShowLimitPrice = (orderType: OrderTypeOption): boolean => {
  return (
    orderType === OrderTypeOption.LIMIT ||
    orderType === OrderTypeOption.STOP_LIMIT
  );
};
