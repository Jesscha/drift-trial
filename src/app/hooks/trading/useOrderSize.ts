import { useCallback, useMemo } from "react";
import { BN } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import { useActiveAccount } from "@/app/hooks/useActiveAccount";
import { useOraclePrice } from "@/app/hooks/useOraclePrice";
import {
  calculateSize,
  calculateUsdValue,
  isAtMaxValue,
} from "@/app/components/modal/TradingModal.util";

export const useOrderSize = (marketIndex: number) => {
  const sizeBN = useTradingStore((state) => state.sizeBN);
  const setSizeBN = useTradingStore((state) => state.setSizeBN);
  const usdValueBN = useTradingStore((state) => state.usdValueBN);
  const setUsdValueBN = useTradingStore((state) => state.setUsdValueBN);
  const sizePercentage = useTradingStore((state) => state.sizePercentage);
  const setSizePercentage = useTradingStore((state) => state.setSizePercentage);
  const priceBN = useTradingStore((state) => state.priceBN);
  const selectedDirection = useTradingStore((state) => state.selectedDirection);

  const { activeAccount, getMaxTradeSizeUSDCForPerp } = useActiveAccount();
  const { oraclePrice } = useOraclePrice(marketIndex);

  const calculateMaxPositionSize = useCallback(() => {
    if (!activeAccount || !oraclePrice) return new BN(0);

    try {
      const maxSizeUsd = getMaxTradeSizeUSDCForPerp(
        marketIndex,
        selectedDirection
      );

      if (!maxSizeUsd) return new BN(0);

      const totalSize = maxSizeUsd.tradeSize.add(
        maxSizeUsd.oppositeSideTradeSize
      );

      return totalSize || new BN(0);
    } catch (error) {
      return new BN(0);
    }
  }, [
    getMaxTradeSizeUSDCForPerp,
    oraclePrice,
    marketIndex,
    selectedDirection,
    activeAccount,
  ]);

  const maxPositionSize = useMemo(
    () => calculateMaxPositionSize(),
    [calculateMaxPositionSize, oraclePrice, selectedDirection]
  );

  // Check if we're at maximum value
  const atMaxValue = isAtMaxValue(usdValueBN, maxPositionSize);

  // Set size based on percentage of max size
  const handleSetSizePercentage = useCallback(
    (percentage: number) => {
      setSizePercentage(percentage);

      if (maxPositionSize.gt(new BN(0)) && oraclePrice) {
        // Calculate USD value based on percentage of max position size
        const newUsdValue = maxPositionSize
          .mul(new BN(percentage))
          .div(new BN(100));
        setUsdValueBN(newUsdValue);

        // Calculate new size based on USD value and price
        const newSize = calculateSize(newUsdValue, oraclePrice);
        setSizeBN(newSize);
      }
    },
    [maxPositionSize, oraclePrice, setSizeBN, setUsdValueBN, setSizePercentage]
  );

  // Set size to maximum available
  const handleSetMaxSize = useCallback(() => {
    if (maxPositionSize.gt(new BN(0)) && oraclePrice) {
      // Set USD value to maximum position size
      setUsdValueBN(maxPositionSize);

      // Calculate size based on USD value and price
      const maxSize = calculateSize(maxPositionSize, oraclePrice);
      setSizeBN(maxSize);

      // Set percentage to 100%
      setSizePercentage(100);
    }
  }, [
    maxPositionSize,
    oraclePrice,
    setSizeBN,
    setUsdValueBN,
    setSizePercentage,
  ]);

  // Handle size change (from input)
  const handleSizeChange = useCallback(
    (newSizeStr: string) => {
      if (!newSizeStr || isNaN(parseFloat(newSizeStr))) {
        setSizeBN(new BN(0));
        setUsdValueBN(new BN(0));
        setSizePercentage(0);
        return;
      }

      const currentPrice = priceBN || oraclePrice;
      if (!currentPrice) return;

      // Convert string to BN with appropriate precision
      let newSizeBN = new BN(Math.floor(parseFloat(newSizeStr) * 1e6));

      // Calculate USD value based on new size and current price
      let newUsdValue = calculateUsdValue(newSizeBN, currentPrice);

      // Check if the new USD value exceeds the maximum position size
      if (maxPositionSize.gt(new BN(0)) && newUsdValue.gt(maxPositionSize)) {
        // Cap the USD value to maximum position size
        newUsdValue = maxPositionSize;
        // Recalculate size based on capped USD value
        newSizeBN = calculateSize(newUsdValue, currentPrice);
      }

      setSizeBN(newSizeBN);
      setUsdValueBN(newUsdValue);

      // Update percentage based on new USD value
      if (maxPositionSize.gt(new BN(0))) {
        const percentage = newUsdValue
          .mul(new BN(100))
          .div(maxPositionSize)
          .toNumber();
        setSizePercentage(Math.min(percentage, 100));
      }
    },
    [
      maxPositionSize,
      oraclePrice,
      priceBN,
      setSizeBN,
      setUsdValueBN,
      setSizePercentage,
    ]
  );

  // Handle USD value change (from input)
  const handleUsdValueChange = useCallback(
    (newUsdValueStr: string) => {
      if (!newUsdValueStr || isNaN(parseFloat(newUsdValueStr))) {
        setUsdValueBN(new BN(0));
        setSizeBN(new BN(0));
        setSizePercentage(0);
        return;
      }

      const currentPrice = priceBN || oraclePrice;
      if (!currentPrice || currentPrice.isZero()) return;

      // Convert string to BN with appropriate precision
      let newUsdValueBN = new BN(Math.floor(parseFloat(newUsdValueStr) * 1e6));

      // Cap USD value to maximum position size
      if (maxPositionSize.gt(new BN(0)) && newUsdValueBN.gt(maxPositionSize)) {
        newUsdValueBN = maxPositionSize;
      }

      setUsdValueBN(newUsdValueBN);

      // Calculate new size based on USD value and current price
      const newSizeBN = calculateSize(newUsdValueBN, currentPrice);
      setSizeBN(newSizeBN);

      // Update percentage based on new USD value
      if (maxPositionSize.gt(new BN(0))) {
        const percentage = newUsdValueBN
          .mul(new BN(100))
          .div(maxPositionSize)
          .toNumber();
        setSizePercentage(Math.min(percentage, 100));
      }
    },
    [
      priceBN,
      oraclePrice,
      maxPositionSize,
      setSizeBN,
      setUsdValueBN,
      setSizePercentage,
    ]
  );

  // Update size and USD value when price changes
  const updateSizeAndUsdValue = useCallback(
    (newPriceBN: BN) => {
      // Recalculate USD value with new price
      if (!sizeBN.isZero()) {
        const newUsdValue = calculateUsdValue(sizeBN, newPriceBN);
        setUsdValueBN(newUsdValue);
      }
    },
    [sizeBN, setUsdValueBN]
  );

  // Initialize size and USD value
  const initializeSizeAndValue = useCallback(
    (initialSize?: number) => {
      if (oraclePrice) {
        const initialSizeBN = new BN(initialSize || 1).mul(new BN(1e6));
        setSizeBN(initialSizeBN);

        // Calculate initial USD value based on size and oracle price
        const initialUsdValue = initialSizeBN.mul(oraclePrice).div(new BN(1e6));
        setUsdValueBN(initialUsdValue);

        // Calculate initial percentage based on USD value and max position size
        if (maxPositionSize && maxPositionSize.gt(new BN(0))) {
          const initialPercentage = initialUsdValue
            .mul(new BN(100))
            .div(maxPositionSize)
            .toNumber();
          setSizePercentage(Math.min(initialPercentage, 100));
        }
      }
    },
    [oraclePrice, maxPositionSize, setSizeBN, setUsdValueBN, setSizePercentage]
  );

  return {
    sizeBN,
    usdValueBN,
    sizePercentage,
    maxPositionSize,
    atMaxValue,
    handleSetSizePercentage,
    handleSetMaxSize,
    handleSizeChange,
    handleUsdValueChange,
    updateSizeAndUsdValue,
    initializeSizeAndValue,
  };
};
