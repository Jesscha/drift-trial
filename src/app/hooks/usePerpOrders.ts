import { OrderType, PositionDirection, BN } from "@drift-labs/sdk";
import { useState, useCallback } from "react";
import { useActiveAccount } from "./useActiveAccount";
import { useDriftClient } from "./useDriftClient";
import { useTransactions } from "./useTransactions";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import {
  PlacePerpOrderParams,
  OrderResult,
  TriggerCondition,
  placeOrders,
  getTriggerConditionObject,
} from "@/services/drift/order";

export { TriggerCondition, getTriggerConditionObject };
export type { PlacePerpOrderParams, OrderResult };

// Interface for scale order configuration
export type ScaleOrderDistribution =
  | "ascending"
  | "descending"
  | "random"
  | "flat";

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

// Interface for order with take profit and stop loss
export interface OrderWithTPSLParams {
  marketIndex: number;
  direction: PositionDirection;
  size: number;
  price?: number; // For limit orders
  orderType: OrderType;
  reduceOnly?: boolean;
  oraclePriceOffset?: number; // For oracle orders
  // Take profit configuration
  takeProfit?: {
    price: number;
    size?: number; // If not provided, will use the entire position size
    orderType?: OrderType; // LIMIT or MARKET
  };
  // Stop loss configuration
  stopLoss?: {
    price: number;
    size?: number; // If not provided, will use the entire position size
    orderType?: OrderType; // LIMIT or MARKET
  };
}

export function usePerpOrders() {
  const { client } = useDriftClient();
  const { activeAccount } = useActiveAccount();
  const { trackTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<OrderResult | null>(null);

  // Method to place multiple orders with tracking
  const placeOrdersWithTracking = useCallback(
    async (orderParamsArray: PlacePerpOrderParams[]): Promise<OrderResult> => {
      if (!client) {
        const error = new Error("Drift client not initialized");
        setLastError(error);
        return { success: false, error };
      }

      if (!activeAccount?.user) {
        const error = new Error("No active Drift account");
        setLastError(error);
        return { success: false, error };
      }

      try {
        setIsLoading(true);
        setLastError(null);

        const result = await placeOrders(orderParamsArray);

        if (result.success && result.txid) {
          trackTransaction(result.txid, result.description || "", [
            { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
            { type: TransactionSuccessActionType.REFRESH_ALL },
          ]);
        }

        setLastResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLastError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [client, activeAccount, trackTransaction]
  );

  // Place scale orders across a price range
  const placeScaleOrders = useCallback(
    async (params: ScaleOrderParams): Promise<OrderResult> => {
      const {
        marketIndex,
        direction,
        size,
        minPrice,
        maxPrice,
        numOrders,
        reduceOnly,
        distribution = "ascending", // Default to ascending
      } = params;

      if (numOrders <= 0) {
        const error = new Error("Number of orders must be greater than 0");
        setLastError(error);
        return { success: false, error };
      }

      if (minPrice >= maxPrice) {
        const error = new Error("Min price must be less than max price");
        setLastError(error);
        return { success: false, error };
      }

      try {
        // Calculate price step and size per order
        const priceStep = (maxPrice - minPrice) / (numOrders - 1 || 1);
        const sizePerOrder = size / numOrders;

        // Create array of order parameters with distribution patterns
        let orderParamsArray: PlacePerpOrderParams[];

        switch (distribution) {
          case "ascending":
            // Price increases from min to max (default behavior)
            orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
              const price = minPrice + i * priceStep;
              return {
                marketIndex,
                direction,
                size: sizePerOrder,
                price,
                orderType: OrderType.LIMIT,
                reduceOnly,
              };
            });
            break;

          case "descending":
            // Price decreases from max to min
            orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
              const price = maxPrice - i * priceStep;
              return {
                marketIndex,
                direction,
                size: sizePerOrder,
                price,
                orderType: OrderType.LIMIT,
                reduceOnly,
              };
            });
            break;

          case "random":
            // Random distribution between min and max
            orderParamsArray = Array.from({ length: numOrders }, () => {
              // Generate random price between min and max
              const randomFactor = Math.random();
              const price = minPrice + randomFactor * (maxPrice - minPrice);
              return {
                marketIndex,
                direction,
                size: sizePerOrder,
                price,
                orderType: OrderType.LIMIT,
                reduceOnly,
              };
            });
            break;

          case "flat":
            // Flat distribution - evenly spaced prices but with equal size
            orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
              const price = minPrice + i * priceStep;
              return {
                marketIndex,
                direction,
                size: sizePerOrder,
                price,
                orderType: OrderType.LIMIT,
                reduceOnly,
              };
            });
            break;

          default:
            // Fallback to ascending
            orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
              const price = minPrice + i * priceStep;
              return {
                marketIndex,
                direction,
                size: sizePerOrder,
                price,
                orderType: OrderType.LIMIT,
                reduceOnly,
              };
            });
        }

        return placeOrdersWithTracking(orderParamsArray);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLastError(error);
        return { success: false, error };
      }
    },
    [placeOrdersWithTracking]
  );

  // Place an order with optional take profit and stop loss
  const placeOrderWithTPSL = useCallback(
    async (params: OrderWithTPSLParams): Promise<OrderResult> => {
      const {
        marketIndex,
        direction,
        size,
        price,
        orderType,
        reduceOnly,
        oraclePriceOffset,
        takeProfit,
        stopLoss,
      } = params;

      try {
        // Create base order
        const orderParamsArray: PlacePerpOrderParams[] = [
          {
            marketIndex,
            direction,
            size,
            price,
            orderType,
            reduceOnly,
            oraclePriceOffset,
          },
        ];

        // Add take profit order if specified
        if (takeProfit) {
          const tpDirection =
            direction === PositionDirection.LONG
              ? PositionDirection.SHORT
              : PositionDirection.LONG;

          const tpOrderType = takeProfit.orderType || OrderType.LIMIT;

          orderParamsArray.push({
            marketIndex,
            direction: tpDirection,
            size: takeProfit.size || size,
            price: takeProfit.price,
            orderType:
              tpOrderType === OrderType.LIMIT
                ? OrderType.TRIGGER_LIMIT
                : OrderType.TRIGGER_MARKET,
            triggerPrice: takeProfit.price,
            triggerCondition:
              direction === PositionDirection.LONG
                ? TriggerCondition.ABOVE
                : TriggerCondition.BELOW,
            reduceOnly: true,
          });
        }

        // Add stop loss order if specified
        if (stopLoss) {
          const slDirection =
            direction === PositionDirection.LONG
              ? PositionDirection.SHORT
              : PositionDirection.LONG;

          const slOrderType = stopLoss.orderType || OrderType.MARKET;

          orderParamsArray.push({
            marketIndex,
            direction: slDirection,
            size: stopLoss.size || size,
            price:
              stopLoss.orderType === OrderType.LIMIT
                ? stopLoss.price
                : undefined,
            orderType:
              slOrderType === OrderType.LIMIT
                ? OrderType.TRIGGER_LIMIT
                : OrderType.TRIGGER_MARKET,
            triggerPrice: stopLoss.price,
            triggerCondition:
              direction === PositionDirection.LONG
                ? TriggerCondition.BELOW
                : TriggerCondition.ABOVE,
            reduceOnly: true,
          });
        }

        return placeOrdersWithTracking(orderParamsArray);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLastError(error);
        return { success: false, error };
      }
    },
    [placeOrdersWithTracking]
  );

  return {
    placeOrdersWithTracking,
    placeScaleOrders,
    placeOrderWithTPSL,
    isLoading,
    lastError,
    lastResult,
  };
}
