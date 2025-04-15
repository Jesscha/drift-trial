import { useCallback, useEffect } from "react";
import { BN } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import { useOraclePrice } from "../useOraclePrice";
import { calculateTPSLPrices } from "@/app/components/modal/TradingModal.util";

export const useOrderPrice = (marketIndex: number) => {
  const priceBN = useTradingStore((state) => state.priceBN);
  const setPriceBN = useTradingStore((state) => state.setPriceBN);
  const triggerPriceBN = useTradingStore((state) => state.triggerPriceBN);
  const setTriggerPriceBN = useTradingStore((state) => state.setTriggerPriceBN);
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

  const { oraclePrice } = useOraclePrice(marketIndex);

  // Handle price click from the order book
  const handlePriceClick = useCallback(
    (clickedPrice: number) => {
      // Create BN from the raw price with proper precision
      const newPriceBN = new BN(Math.floor(clickedPrice));
      setPriceBN(newPriceBN);
    },
    [setPriceBN]
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
      setPriceBN(oraclePrice);
    }
  }, [oraclePrice, setPriceBN]);

  // Set trigger price to oracle price
  const setOracleAsTriggerPrice = useCallback(() => {
    if (oraclePrice) {
      setTriggerPriceBN(oraclePrice);
    }
  }, [oraclePrice, setTriggerPriceBN]);

  // Update scale order min/max prices when price changes
  useEffect(() => {
    if (priceBN && useScaleOrders) {
      const currentPrice = parseFloat(priceBN.toString()) / 1e6;

      // Only update min/max prices if they haven't been set yet
      if (minPrice === null) {
        setMinPrice(currentPrice * 0.95);
      }

      if (maxPrice === null) {
        setMaxPrice(currentPrice * 1.05);
      }
    }
  }, [priceBN, useScaleOrders, minPrice, maxPrice, setMinPrice, setMaxPrice]);

  // Calculate TP/SL prices based on price and direction
  const calculateTPSLValues = useCallback(() => {
    if (priceBN) {
      const currentPrice = parseFloat(priceBN.toString()) / 1e6;
      return calculateTPSLPrices(currentPrice, selectedDirection);
    }
    return null;
  }, [priceBN, selectedDirection]);

  return {
    priceBN,
    setPriceBN,
    triggerPriceBN,
    setTriggerPriceBN,
    triggerCondition,
    handlePriceClick,
    handleTriggerConditionChange,
    setOracleAsPrice,
    setOracleAsTriggerPrice,
    calculateTPSLValues,
  };
};
