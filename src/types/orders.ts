import {
  OrderType,
  PositionDirection,
  OrderTriggerCondition,
} from "@drift-labs/sdk";

/**
 * Parameters for placing perpetual orders
 */
export interface PlacePerpOrderParams {
  marketIndex: number;
  direction: PositionDirection;
  size: number;
  price?: number;
  orderType?: OrderType;
  oraclePriceOffset?: number;
  auctionStartPrice?: number;
  auctionEndPrice?: number;
  auctionDuration?: number;
  maxTs?: number;
  triggerPrice?: number;
  triggerCondition?: TriggerCondition;
  reduceOnly?: boolean;
}

/**
 * Result of an order placement operation
 */
export interface OrderResult {
  success: boolean;
  error?: Error;
  txid?: string;
  description?: string;
}

/**
 * Trigger condition for stop orders (simplified enum for UI)
 */
export enum TriggerCondition {
  ABOVE = 0,
  BELOW = 1,
}

/**
 * Convert from UI TriggerCondition to SDK OrderTriggerCondition
 */
export function getTriggerConditionObject(triggerCondition: number) {
  if (triggerCondition === TriggerCondition.ABOVE) {
    return OrderTriggerCondition.ABOVE;
  } else if (triggerCondition === TriggerCondition.BELOW) {
    return OrderTriggerCondition.BELOW;
  }
  return OrderTriggerCondition.ABOVE; // Default
}

/**
 * Get human-readable label for order types
 */
export const getOrderTypeLabel = (orderType: OrderType): string => {
  switch (orderType) {
    case OrderType.MARKET:
      return "Market";
    case OrderType.LIMIT:
      return "Limit";
    case OrderType.TRIGGER_MARKET:
      return "Stop Market";
    case OrderType.TRIGGER_LIMIT:
      return "Stop Limit";
    case OrderType.ORACLE:
      return "Oracle";
    default:
      return "Order";
  }
};

/**
 * Distribution patterns for scale orders
 */
export type ScaleOrderDistribution =
  | "ascending"
  | "descending"
  | "random"
  | "flat";

/**
 * Parameters for placing multiple orders across a price range
 */
export interface ScaleOrderParams {
  marketIndex: number;
  direction: PositionDirection;
  size: number; // Total size to distribute across orders
  minPrice: number;
  maxPrice: number;
  numOrders: number;
  reduceOnly?: boolean;
  distribution?: ScaleOrderDistribution; // Optional distribution pattern
}

/**
 * Parameters for placing an order with take-profit and stop-loss
 */
export interface OrderWithTPSLParams {
  marketIndex: number;
  direction: PositionDirection;
  size: number;
  price?: number; // For limit orders
  orderType: OrderType;
  reduceOnly?: boolean;
  oraclePriceOffset?: number; // For oracle orders
  takeProfit?: {
    price: number;
    size?: number; // If not provided, will use the entire position size
    orderType?: OrderType; // LIMIT or MARKET
    limitPrice?: number; // For TP limit orders
  };
  stopLoss?: {
    price: number;
    size?: number; // If not provided, will use the entire position size
    orderType?: OrderType; // LIMIT or MARKET
    limitPrice?: number; // For SL limit orders
  };
}
