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
  placePerpOrder,
  placeMarketOrder as serviceMarketOrder,
  placeLimitOrder as serviceLimitOrder,
  placeOracleOrder as serviceOracleOrder,
  placeTriggerMarketOrder as serviceTriggerMarketOrder,
  placeTriggerLimitOrder as serviceTriggerLimitOrder,
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
    limitPrice?: number; // For TP limit orders
  };
  // Stop loss configuration
  stopLoss?: {
    price: number;
    size?: number; // If not provided, will use the entire position size
    orderType?: OrderType; // LIMIT or MARKET
    limitPrice?: number; // For SL limit orders
  };
}

export function usePerpOrder() {
  const { client } = useDriftClient();
  const { activeAccount, activeId } = useActiveAccount();
  const { trackTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<OrderResult | null>(null);

  // Method to place multiple orders with tracking
  const placeOrdersWithTracking = useCallback(
    async (orderParamsArray: PlacePerpOrderParams[]): Promise<OrderResult> => {
      if (!client) {
        const error = new Error("Drift client not initialized");
        setError(error);
        return { success: false, error };
      }

      if (!activeAccount) {
        const error = new Error("No active Drift account");
        setError(error);
        return { success: false, error };
      }

      try {
        setIsLoading(true);
        setError(null);

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
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [client, activeAccount, trackTransaction]
  );

  // Convenience method for market orders (from usePerpOrder)
  const placeMarketOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await placePerpOrder(
          {
            marketIndex,
            direction,
            size,
            orderType: OrderType.MARKET,
          },
          activeId()
        );

        if (result.success && result.txid) {
          trackTransaction(result.txid, result.description || "", [
            { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
            { type: TransactionSuccessActionType.REFRESH_ALL },
          ]);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [activeId, trackTransaction]
  );

  // Convenience method for limit orders (from usePerpOrder)
  const placeLimitOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      price: number
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await serviceLimitOrder(
          marketIndex,
          direction,
          size,
          price
        );

        if (result.success && result.txid) {
          trackTransaction(result.txid, result.description || "", [
            { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
            { type: TransactionSuccessActionType.REFRESH_ALL },
          ]);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [trackTransaction]
  );

  // Convenience method for oracle-based orders (from usePerpOrder)
  const placeOracleOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      oraclePriceOffset: number
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await serviceOracleOrder(
          marketIndex,
          direction,
          size,
          oraclePriceOffset
        );

        if (result.success && result.txid) {
          trackTransaction(result.txid, result.description || "", [
            { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
            { type: TransactionSuccessActionType.REFRESH_ALL },
          ]);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [trackTransaction]
  );

  // Convenience method for trigger market orders (stop market) (from usePerpOrder)
  const placeTriggerMarketOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      triggerPrice: number,
      triggerCondition: TriggerCondition,
      reduceOnly: boolean = false
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await serviceTriggerMarketOrder(
          marketIndex,
          direction,
          size,
          triggerPrice,
          triggerCondition,
          reduceOnly
        );

        if (result.success && result.txid) {
          trackTransaction(result.txid, result.description || "", [
            { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
            { type: TransactionSuccessActionType.REFRESH_ALL },
          ]);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [trackTransaction]
  );

  // Convenience method for trigger limit orders (stop limit) (from usePerpOrder)
  const placeTriggerLimitOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      price: number,
      triggerPrice: number,
      triggerCondition: TriggerCondition,
      reduceOnly: boolean = false
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await serviceTriggerLimitOrder(
          marketIndex,
          direction,
          size,
          price,
          triggerPrice,
          triggerCondition,
          reduceOnly
        );

        if (result.success && result.txid) {
          trackTransaction(result.txid, result.description || "", [
            { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
            { type: TransactionSuccessActionType.REFRESH_ALL },
          ]);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [trackTransaction]
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
        setError(error);
        return { success: false, error };
      }

      if (minPrice >= maxPrice) {
        const error = new Error("Min price must be less than max price");
        setError(error);
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
        setError(error);
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
            price: takeProfit.limitPrice,
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
            price: stopLoss.limitPrice,
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
        setError(error);
        return { success: false, error };
      }
    },
    [placeOrdersWithTracking]
  );

  return {
    // Basic order methods (from usePerpOrder)
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,

    // Advanced order methods (from usePerpOrders)
    placeOrdersWithTracking,
    placeScaleOrders,
    placeOrderWithTPSL,

    // State
    isLoading,
    error,
    lastResult,
  };
}
