import { useCallback, useEffect } from "react";
import { useTradingStore } from "@/app/stores/tradingStore";
import { useOraclePrice } from "../useOraclePrice";
import { calculateTPSLPrices } from "@/app/components/modal/TradingModal.util";

export const useOrderPrice = (marketIndex: number) => {
  const price = useTradingStore((state) => state.price);
  const setPrice = useTradingStore((state) => state.setPrice);
  const triggerPrice = useTradingStore((state) => state.triggerPrice);
  const setTriggerPrice = useTradingStore((state) => state.setTriggerPrice);
  const triggerCondition = useTradingStore((state) => state.triggerCondition);
  const setTriggerCondition = useTradingStore(
    (state) => state.setTriggerCondition
  );
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const minPrice = useTradingStore((state) => state.minPrice);
  const setMinPrice = useTradingStore((state) => state.setMinPrice);
  const maxPrice = useTradingStore((state) => state.maxPrice);
  const setMaxPrice = useTradingStore((state) => state.setMaxPrice);

  const { oraclePrice: oraclePriceBN } = useOraclePrice(marketIndex);
  const oraclePrice = oraclePriceBN
    ? parseFloat(oraclePriceBN.toString()) / 1e6
    : null;

  // Handle price click from the order book
  const handlePriceClick = useCallback(
    (clickedPrice: number) => {
      // Use the clicked price directly as a number
      setPrice(clickedPrice / 1e6); // Convert from raw price to UI price
    },
    [setPrice]
  );

  // Handle trigger condition selection
  const handleTriggerConditionChange = useCallback(
    (value: string | number) => {
      setTriggerCondition(Number(value));
    },
    [setTriggerCondition]
  );

  // Set price to oracle price
  const setOracleAsPrice = useCallback(() => {
    if (oraclePrice) {
      setPrice(oraclePrice);
    }
  }, [oraclePrice, setPrice]);

  // Set trigger price to oracle price
  const setOracleAsTriggerPrice = useCallback(() => {
    if (oraclePrice) {
      setTriggerPrice(oraclePrice);
    }
  }, [oraclePrice, setTriggerPrice]);

  // Update scale order min/max prices when price changes
  useEffect(() => {
    if (price && useScaleOrders) {
      // Only update min/max prices if they haven't been set yet
      if (minPrice === null) {
        setMinPrice(price * 0.95);
      }

      if (maxPrice === null) {
        setMaxPrice(price * 1.05);
      }
    }
  }, [price, useScaleOrders, minPrice, maxPrice, setMinPrice, setMaxPrice]);

  // Calculate TP/SL prices based on price and direction
  const calculateTPSLValues = useCallback(() => {
    if (price) {
      return calculateTPSLPrices(price, selectedDirection);
    }
    return null;
  }, [price, selectedDirection]);

  return {
    price,
    setPrice,
    triggerPrice,
    setTriggerPrice,
    triggerCondition,
    handlePriceClick,
    handleTriggerConditionChange,
    setOracleAsPrice,
    setOracleAsTriggerPrice,
    calculateTPSLValues,
  };
};
