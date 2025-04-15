import { useCallback, useMemo } from "react";
import { useTradingStore } from "@/app/stores/tradingStore";
import { useActiveAccount } from "@/app/providers/ActiveAccountProvider";
import { useOraclePrice } from "@/app/hooks/useOraclePrice";
import {
  calculateSize,
  calculateUsdValue,
  isAtMaxValue,
} from "@/app/components/modal/TradingModal.util";

export const useOrderSize = (marketIndex: number) => {
  const size = useTradingStore((state) => state.size);
  const setSize = useTradingStore((state) => state.setSize);
  const usdValue = useTradingStore((state) => state.usdValue);
  const setUsdValue = useTradingStore((state) => state.setUsdValue);
  const sizePercentage = useTradingStore((state) => state.sizePercentage);
  const setSizePercentage = useTradingStore((state) => state.setSizePercentage);
  const price = useTradingStore((state) => state.price);
  const selectedDirection = useTradingStore((state) => state.selectedDirection);

  const { activeAccount, getMaxTradeSizeUSDCForPerp } = useActiveAccount();
  const { oraclePrice: oraclePriceBN } = useOraclePrice(marketIndex);
  const oraclePrice = oraclePriceBN
    ? parseFloat(oraclePriceBN.toString()) / 1e6
    : null;

  const calculateMaxPositionSize = useCallback(() => {
    if (!activeAccount || !oraclePrice) return 0;

    try {
      const maxSizeUsd = getMaxTradeSizeUSDCForPerp(
        marketIndex,
        selectedDirection
      );

      if (!maxSizeUsd) return 0;

      // Convert BN to number
      const totalSize =
        parseFloat(
          maxSizeUsd.tradeSize.add(maxSizeUsd.oppositeSideTradeSize).toString()
        ) / 1e6;

      return totalSize || 0;
    } catch (error) {
      return 0;
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
  const atMaxValue = isAtMaxValue(usdValue, maxPositionSize);

  // Set size based on percentage of max size
  const handleSetSizePercentage = useCallback(
    (percentage: number) => {
      setSizePercentage(percentage);

      if (maxPositionSize > 0 && oraclePrice) {
        // Calculate USD value based on percentage of max position size
        const newUsdValue = maxPositionSize * (percentage / 100);
        setUsdValue(newUsdValue);

        // Calculate new size based on USD value and price
        const newSize = calculateSize(newUsdValue, oraclePrice);
        setSize(newSize);
      }
    },
    [maxPositionSize, oraclePrice, setSize, setUsdValue, setSizePercentage]
  );

  // Set size to maximum available
  const handleSetMaxSize = useCallback(() => {
    if (maxPositionSize > 0 && oraclePrice) {
      // Set USD value to maximum position size
      setUsdValue(maxPositionSize);

      // Calculate size based on USD value and price
      const maxSize = calculateSize(maxPositionSize, oraclePrice);
      setSize(maxSize);

      // Set percentage to 100%
      setSizePercentage(100);
    }
  }, [maxPositionSize, oraclePrice, setSize, setUsdValue, setSizePercentage]);

  // Handle size change (from input)
  const handleSizeChange = useCallback(
    (newSizeStr: string) => {
      if (!newSizeStr || isNaN(parseFloat(newSizeStr))) {
        setSize(0);
        setUsdValue(0);
        setSizePercentage(0);
        return;
      }

      const currentPrice = price || oraclePrice;
      if (!currentPrice) return;

      // Parse input to number
      let newSize = parseFloat(newSizeStr);

      // Calculate USD value based on new size and current price
      let newUsdValue = calculateUsdValue(newSize, currentPrice);

      // Check if the new USD value exceeds the maximum position size
      if (maxPositionSize > 0 && newUsdValue > maxPositionSize) {
        // Cap the USD value to maximum position size
        newUsdValue = maxPositionSize;
        // Recalculate size based on capped USD value
        newSize = calculateSize(newUsdValue, currentPrice);
      }

      setSize(newSize);
      setUsdValue(newUsdValue);

      // Update percentage based on new USD value
      if (maxPositionSize > 0) {
        const percentage = (newUsdValue / maxPositionSize) * 100;
        setSizePercentage(Math.min(percentage, 100));
      }
    },
    [
      maxPositionSize,
      oraclePrice,
      price,
      setSize,
      setUsdValue,
      setSizePercentage,
    ]
  );

  // Handle USD value change (from input)
  const handleUsdValueChange = useCallback(
    (newUsdValueStr: string) => {
      if (!newUsdValueStr || isNaN(parseFloat(newUsdValueStr))) {
        setUsdValue(0);
        setSize(0);
        setSizePercentage(0);
        return;
      }

      const currentPrice = price || oraclePrice;
      if (!currentPrice || currentPrice === 0) return;

      // Parse input to number
      let newUsdValue = parseFloat(newUsdValueStr);

      // Cap USD value to maximum position size
      if (maxPositionSize > 0 && newUsdValue > maxPositionSize) {
        newUsdValue = maxPositionSize;
      }

      setUsdValue(newUsdValue);

      // Calculate new size based on USD value and current price
      const newSize = calculateSize(newUsdValue, currentPrice);
      setSize(newSize);

      // Update percentage based on new USD value
      if (maxPositionSize > 0) {
        const percentage = (newUsdValue / maxPositionSize) * 100;
        setSizePercentage(Math.min(percentage, 100));
      }
    },
    [
      price,
      oraclePrice,
      maxPositionSize,
      setSize,
      setUsdValue,
      setSizePercentage,
    ]
  );

  // Update size and USD value when price changes
  const updateSizeAndUsdValue = useCallback(
    (newPrice: number) => {
      // Recalculate USD value with new price
      if (size !== 0) {
        const newUsdValue = calculateUsdValue(size, newPrice);
        setUsdValue(newUsdValue);
      }
    },
    [size, setUsdValue]
  );

  const initializeSizeAndValue = useCallback(
    (initialSize?: number) => {
      if (oraclePrice) {
        const newSize = initialSize || 1;
        setSize(newSize);

        // Calculate initial USD value based on size and oracle price
        const initialUsdValue = calculateUsdValue(newSize, oraclePrice);
        setUsdValue(initialUsdValue);

        // Calculate initial percentage based on USD value and max position size
        if (maxPositionSize && maxPositionSize > 0) {
          const initialPercentage = (initialUsdValue / maxPositionSize) * 100;
          setSizePercentage(Math.min(initialPercentage, 100));
        }
      }
    },
    [oraclePrice, maxPositionSize, setSize, setUsdValue, setSizePercentage]
  );

  return {
    size,
    usdValue,
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
