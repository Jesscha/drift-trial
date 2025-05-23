import { useCallback, useEffect } from "react";
import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import { usePerpOrder } from "@/app/hooks/usePerpOrder";
import { useTransactions } from "@/app/hooks/useTransactions";
import {
  isMarketTriggerOrderType,
  isLimitTriggerOrderType,
} from "@/app/components/modal/TradingModal.util";

export const useOrderExecution = (
  marketIndex: number,
  onOrderConfirmed: () => void
) => {
  const size = useTradingStore((state) => state.size);
  const price = useTradingStore((state) => state.price);
  const triggerPrice = useTradingStore((state) => state.triggerPrice);
  const triggerCondition = useTradingStore((state) => state.triggerCondition);
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const selectedOrderType = useTradingStore((state) => state.selectedOrderType);
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const numScaleOrders = useTradingStore((state) => state.numScaleOrders);
  const minPrice = useTradingStore((state) => state.minPrice);
  const maxPrice = useTradingStore((state) => state.maxPrice);
  const scaleDistribution = useTradingStore((state) => state.scaleDistribution);
  const enableTakeProfit = useTradingStore((state) => state.enableTakeProfit);
  const takeProfitPrice = useTradingStore((state) => state.takeProfitPrice);
  const takeProfitOrderType = useTradingStore(
    (state) => state.takeProfitOrderType
  );

  const takeProfitLimitPrice = useTradingStore(
    (state) => state.takeProfitLimitPrice
  );
  const enableStopLoss = useTradingStore((state) => state.enableStopLoss);
  const stopLossPrice = useTradingStore((state) => state.stopLossPrice);
  const stopLossOrderType = useTradingStore((state) => state.stopLossOrderType);
  const stopLossLimitPrice = useTradingStore(
    (state) => state.stopLossLimitPrice
  );
  const orderSubmitted = useTradingStore((state) => state.orderSubmitted);
  const setOrderSubmitted = useTradingStore((state) => state.setOrderSubmitted);
  const orderTxid = useTradingStore((state) => state.orderTxid);
  const setOrderTxid = useTradingStore((state) => state.setOrderTxid);
  const showConfirmation = useTradingStore((state) => state.showConfirmation);
  const setShowConfirmation = useTradingStore(
    (state) => state.setShowConfirmation
  );

  const {
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,
    placeOrderWithTPSL,
    placeScaleOrders,
    isLoading: isOrderLoading,
  } = usePerpOrder();

  const { getTxStatus } = useTransactions();

  const handlePlaceOrder = useCallback(() => {
    setShowConfirmation(true);
  }, [setShowConfirmation]);

  const handleCloseConfirmation = useCallback(() => {
    setShowConfirmation(false);
  }, [setShowConfirmation]);

  const executeOrder = useCallback(async () => {
    const sizeNum = size;
    const priceNum = price ?? undefined;
    const triggerPriceNum = triggerPrice ?? undefined;
    const direction = selectedDirection;

    try {
      setOrderSubmitted(true);
      let result;

      if (enableTakeProfit || enableStopLoss) {
        const tpPrice = takeProfitPrice;
        const slPrice = stopLossPrice;

        const params = {
          marketIndex,
          direction,
          size: sizeNum,
          price: priceNum,
          orderType: selectedOrderType,
          oraclePriceOffset: undefined,
          takeProfit:
            enableTakeProfit && tpPrice
              ? {
                  price: tpPrice,
                  orderType: takeProfitOrderType,
                  limitPrice:
                    takeProfitOrderType === OrderType.LIMIT &&
                    takeProfitLimitPrice
                      ? takeProfitLimitPrice
                      : undefined,
                }
              : undefined,
          stopLoss:
            enableStopLoss && slPrice
              ? {
                  price: slPrice,
                  orderType: stopLossOrderType,
                  limitPrice:
                    stopLossOrderType === OrderType.LIMIT && stopLossLimitPrice
                      ? stopLossLimitPrice
                      : undefined,
                }
              : undefined,
        };

        result = await placeOrderWithTPSL(params);
      }
      // Check if scale orders are enabled for limit orders
      else if (
        useScaleOrders &&
        selectedOrderType === OrderType.LIMIT &&
        priceNum
      ) {
        // For long positions, max should be current price, min should be lower
        // For short positions, min should be current price, max should be higher
        let minPriceVal, maxPriceVal;

        if (direction === PositionDirection.LONG) {
          minPriceVal = minPrice !== null ? minPrice : priceNum * 0.95;
          maxPriceVal = maxPrice !== null ? maxPrice : priceNum;
        } else {
          // SHORT position
          minPriceVal = minPrice !== null ? minPrice : priceNum;
          maxPriceVal = maxPrice !== null ? maxPrice : priceNum * 1.05;
        }

        const scaleParams = {
          marketIndex,
          direction,
          size: sizeNum,
          minPrice: minPriceVal,
          maxPrice: maxPriceVal,
          numOrders: numScaleOrders,
          reduceOnly: false,
          distribution: scaleDistribution,
        };

        result = await placeScaleOrders(scaleParams);
      }
      // Use original order logic for standard orders
      else if (selectedOrderType === OrderType.MARKET) {
        result = await placeMarketOrder(marketIndex, direction, sizeNum);
      } else if (selectedOrderType === OrderType.LIMIT && priceNum) {
        result = await placeLimitOrder(
          marketIndex,
          direction,
          sizeNum,
          priceNum
        );
      } else if (
        isMarketTriggerOrderType(selectedOrderType) &&
        triggerPriceNum
      ) {
        result = await placeTriggerMarketOrder(
          marketIndex,
          direction,
          sizeNum,
          triggerPriceNum,
          triggerCondition,
          false // reduceOnly
        );
      } else if (
        isLimitTriggerOrderType(selectedOrderType) &&
        triggerPriceNum &&
        priceNum
      ) {
        result = await placeTriggerLimitOrder(
          marketIndex,
          direction,
          sizeNum,
          priceNum,
          triggerPriceNum,
          triggerCondition,
          false // reduceOnly
        );
      } else if (selectedOrderType === OrderType.ORACLE) {
        result = await placeOracleOrder(marketIndex, direction, sizeNum, 0.05);
      }

      if (result?.success && result.txid) {
        setOrderTxid(result.txid);
      } else {
        setOrderSubmitted(false);
      }

      // Close confirmation modal
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error executing order:", error);
      setOrderSubmitted(false);
      // Close confirmation modal
      setShowConfirmation(false);
    }
  }, [
    marketIndex,
    size,
    price,
    triggerPrice,
    triggerCondition,
    selectedDirection,
    selectedOrderType,
    enableTakeProfit,
    takeProfitPrice,
    takeProfitOrderType,
    takeProfitLimitPrice,
    enableStopLoss,
    stopLossPrice,
    stopLossOrderType,
    stopLossLimitPrice,
    useScaleOrders,
    numScaleOrders,
    minPrice,
    maxPrice,
    scaleDistribution,
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,
    placeOrderWithTPSL,
    placeScaleOrders,
    setOrderSubmitted,
    setOrderTxid,
    setShowConfirmation,
  ]);

  // Get transaction status if we have a txid
  const txStatus = orderTxid ? getTxStatus(orderTxid) : null;

  // Check button disabled state
  const isButtonDisabled =
    isOrderLoading ||
    orderSubmitted ||
    size === 0 ||
    (selectedOrderType !== OrderType.MARKET && !price) ||
    (isMarketTriggerOrderType(selectedOrderType) && !triggerPrice) ||
    (isLimitTriggerOrderType(selectedOrderType) &&
      (!triggerPrice || price === 0));

  // Close modal when transaction is confirmed
  useEffect(() => {
    if (txStatus?.status === "confirmed") {
      // Wait a moment to show the confirmation before closing
      const timer = setTimeout(() => {
        onOrderConfirmed();
        // Reset state
        setOrderSubmitted(false);
        setOrderTxid(null);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // If transaction failed, allow resubmitting
    if (txStatus?.status === "failed") {
      setOrderSubmitted(false);
    }
  }, [txStatus, onOrderConfirmed, setOrderSubmitted, setOrderTxid]);

  return {
    isOrderLoading,
    orderSubmitted,
    txStatus,
    isButtonDisabled,
    showConfirmation,
    handlePlaceOrder,
    handleCloseConfirmation,
    executeOrder,
  };
};
