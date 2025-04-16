import { useCallback, useEffect } from "react";
import { useTradingStore } from "@/app/stores/tradingStore";
import { useOraclePrice } from "../useOraclePrice";
import { QUOTE_PRECISION } from "@drift-labs/sdk";

export const useOrderPrice = (marketIndex: number) => {
  const price = useTradingStore((state) => state.price);
  const setPrice = useTradingStore((state) => state.setPrice);
  const setTriggerPrice = useTradingStore((state) => state.setTriggerPrice);

  const { oraclePrice: oraclePriceBN } = useOraclePrice(marketIndex);
  const oraclePrice = oraclePriceBN
    ? parseFloat(oraclePriceBN.div(QUOTE_PRECISION).toString())
    : null;

  const handlePriceClick = useCallback(
    (clickedPrice: number) => {
      setPrice(clickedPrice);
    },
    [setPrice]
  );

  const setOracleAsPrice = useCallback(() => {
    if (oraclePrice) {
      setPrice(oraclePrice);
    }
  }, [oraclePrice, setPrice]);

  const setOracleAsTriggerPrice = useCallback(() => {
    if (oraclePrice) {
      setTriggerPrice(oraclePrice);
    }
  }, [oraclePrice, setTriggerPrice]);

  useEffect(() => {
    if (oraclePrice && price === null) {
      setPrice(oraclePrice);
    }
  }, [oraclePrice, price, setPrice]);

  return {
    handlePriceClick,
    setOracleAsPrice,
    setOracleAsTriggerPrice,
  };
};
