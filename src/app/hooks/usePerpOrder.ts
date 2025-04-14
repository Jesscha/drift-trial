import { OrderType, PositionDirection } from "@drift-labs/sdk";

import { useActiveAccount } from "./useActiveAccount";
import { useState, useCallback } from "react";
import { useDriftClient } from "./useDriftClient";
import { useTransactions } from "./useTransactions";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import {
  placePerpOrder,
  placeMarketOrder as serviceMarketOrder,
  placeLimitOrder as serviceLimitOrder,
  placeOracleOrder as serviceOracleOrder,
  placeTriggerMarketOrder as serviceTriggerMarketOrder,
  placeTriggerLimitOrder as serviceTriggerLimitOrder,
  PlacePerpOrderParams,
  OrderResult,
  TriggerCondition,
  getTriggerConditionObject,
} from "@/services/drift/order";

export { TriggerCondition, getTriggerConditionObject };

export type { PlacePerpOrderParams, OrderResult };

export function usePerpOrder() {
  const { client } = useDriftClient();
  const { activeAccount } = useActiveAccount();
  const { trackTransaction } = useTransactions();
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<OrderResult | null>(null);

  const placePerpOrderWithTracking = useCallback(
    async (params: PlacePerpOrderParams): Promise<OrderResult> => {
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

        const result = await placePerpOrder(params);

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

  // Convenience method for market orders
  const placeMarketOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
        const result = await serviceMarketOrder(marketIndex, direction, size);

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
    [trackTransaction]
  );

  // Convenience method for limit orders
  const placeLimitOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      price: number
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
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
    [trackTransaction]
  );

  // Convenience method for oracle-based orders
  const placeOracleOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      oraclePriceOffset: number
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
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
    [trackTransaction]
  );

  // Convenience method for trigger market orders (stop market)
  const placeTriggerMarketOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      triggerPrice: number,
      triggerCondition: any,
      reduceOnly: boolean = false
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
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
    [trackTransaction]
  );

  // Convenience method for trigger limit orders (stop limit)
  const placeTriggerLimitOrder = useCallback(
    async (
      marketIndex: number,
      direction: PositionDirection,
      size: number,
      price: number,
      triggerPrice: number,
      triggerCondition: any,
      reduceOnly: boolean = false
    ): Promise<OrderResult> => {
      try {
        setIsLoading(true);
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
    [trackTransaction]
  );

  return {
    placePerpOrder: placePerpOrderWithTracking,
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,
    isLoading,
    lastError,
    lastResult,
  };
}
