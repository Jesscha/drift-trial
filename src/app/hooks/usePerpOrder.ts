import { OrderType, PositionDirection, BN } from "@drift-labs/sdk";
import { useState, useCallback } from "react";
import { useActiveAccount } from "@/app/providers/ActiveAccountProvider";
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
  cancelOrder as cancelOrderService,
} from "@/services/drift/order";

export { TriggerCondition, getTriggerConditionObject };
export type { PlacePerpOrderParams, OrderResult };

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

export function usePerpOrder() {
  const { client } = useDriftClient();
  const { activeAccount, activeAccountId } = useActiveAccount();
  const { trackTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<OrderResult | null>(null);

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
          activeAccountId
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
    [activeAccountId, trackTransaction]
  );

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
        const priceStep = (maxPrice - minPrice) / (numOrders - 1 || 1);
        const totalSize = size;

        let orderParamsArray: PlacePerpOrderParams[];

        switch (distribution) {
          case "ascending":
            {
              const weights = Array.from(
                { length: numOrders },
                (_, i) => i + 1
              );
              const weightSum = weights.reduce((sum, w) => sum + w, 0);

              orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
                const price = minPrice + i * priceStep;
                const sizeRatio = weights[i] / weightSum;
                const orderSize = sizeRatio * totalSize;

                return {
                  marketIndex,
                  direction,
                  size: orderSize,
                  price,
                  orderType: OrderType.LIMIT,
                  reduceOnly,
                };
              });
            }
            break;

          case "descending":
            {
              const weights = Array.from(
                { length: numOrders },
                (_, i) => numOrders - i
              );
              const weightSum = weights.reduce((sum, w) => sum + w, 0);

              orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
                const price = minPrice + i * priceStep;
                // Calculate proportional size based on position weight
                const sizeRatio = weights[i] / weightSum;
                const orderSize = sizeRatio * totalSize;

                return {
                  marketIndex,
                  direction,
                  size: orderSize,
                  price,
                  orderType: OrderType.LIMIT,
                  reduceOnly,
                };
              });
            }
            break;

          case "random":
            {
              const randomWeights = Array.from({ length: numOrders }, () =>
                Math.random()
              );
              const weightSum = randomWeights.reduce(
                (sum, weight) => sum + weight,
                0
              );

              orderParamsArray = Array.from({ length: numOrders }, (_, i) => {
                const price = minPrice + i * priceStep;
                const normalizedWeight = randomWeights[i] / weightSum;
                const orderSize = normalizedWeight * totalSize;

                return {
                  marketIndex,
                  direction,
                  size: orderSize,
                  price,
                  orderType: OrderType.LIMIT,
                  reduceOnly,
                };
              });
            }
            break;

          case "flat":
          default:
            const sizePerOrder = totalSize / numOrders;
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
        }

        const totalOrderSize = orderParamsArray.reduce(
          (sum, order) => sum + order.size,
          0
        );
        if (Math.abs(totalOrderSize - totalSize) > 0.001) {
          const scaleFactor = totalSize / totalOrderSize;
          orderParamsArray = orderParamsArray.map((order) => ({
            ...order,
            size: order.size * scaleFactor,
          }));
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

  const cancelOrder = useCallback(
    async (orderId: number): Promise<OrderResult> => {
      if (!client) {
        const error = new Error("Drift client not initialized");
        setError(error);
        return { success: false, error };
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await cancelOrderService(orderId);

        if (result.success && result.txid) {
          const orderResult = {
            success: true,
            txid: result.txid,
            description: `Cancel Order #${orderId}`,
          };
          setLastResult(orderResult);
          return orderResult;
        }

        return {
          success: false,
          error:
            result.error || new Error("Failed to get transaction signature"),
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, error };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  return {
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,

    placeOrdersWithTracking,
    placeScaleOrders,
    placeOrderWithTPSL,

    cancelOrder,

    isLoading,
    error,
    lastResult,
  };
}
