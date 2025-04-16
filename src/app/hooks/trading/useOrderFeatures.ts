import { useCallback, useMemo } from "react";
import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";

export const useOrderFeatures = () => {
  // Take Profit state
  const enableTakeProfit = useTradingStore((state) => state.enableTakeProfit);
  const setEnableTakeProfit = useTradingStore(
    (state) => state.setEnableTakeProfit
  );
  const takeProfitPrice = useTradingStore((state) => state.takeProfitPrice);
  const setTakeProfitPrice = useTradingStore(
    (state) => state.setTakeProfitPrice
  );
  const takeProfitOrderType = useTradingStore(
    (state) => state.takeProfitOrderType
  );
  const setTakeProfitOrderType = useTradingStore(
    (state) => state.setTakeProfitOrderType
  );
  const takeProfitLimitPrice = useTradingStore(
    (state) => state.takeProfitLimitPrice
  );
  const setTakeProfitLimitPrice = useTradingStore(
    (state) => state.setTakeProfitLimitPrice
  );

  // Stop Loss state
  const enableStopLoss = useTradingStore((state) => state.enableStopLoss);
  const setEnableStopLoss = useTradingStore((state) => state.setEnableStopLoss);
  const stopLossPrice = useTradingStore((state) => state.stopLossPrice);
  const setStopLossPrice = useTradingStore((state) => state.setStopLossPrice);
  const stopLossOrderType = useTradingStore((state) => state.stopLossOrderType);
  const setStopLossOrderType = useTradingStore(
    (state) => state.setStopLossOrderType
  );
  const stopLossLimitPrice = useTradingStore(
    (state) => state.stopLossLimitPrice
  );
  const setStopLossLimitPrice = useTradingStore(
    (state) => state.setStopLossLimitPrice
  );

  // Scale Orders state
  const useScaleOrders = useTradingStore((state) => state.useScaleOrders);
  const setUseScaleOrders = useTradingStore((state) => state.setUseScaleOrders);
  const numScaleOrders = useTradingStore((state) => state.numScaleOrders);
  const setNumScaleOrders = useTradingStore((state) => state.setNumScaleOrders);
  const minPrice = useTradingStore((state) => state.minPrice);
  const setMinPrice = useTradingStore((state) => state.setMinPrice);
  const maxPrice = useTradingStore((state) => state.maxPrice);
  const setMaxPrice = useTradingStore((state) => state.setMaxPrice);
  const scaleDistribution = useTradingStore((state) => state.scaleDistribution);
  const setScaleDistribution = useTradingStore(
    (state) => state.setScaleDistribution
  );
  const selectedDirection = useTradingStore((state) => state.selectedDirection);

  // Toggle TP/SL states
  const toggleTakeProfit = useCallback(() => {
    setEnableTakeProfit(!enableTakeProfit);
  }, [enableTakeProfit, setEnableTakeProfit]);

  const toggleStopLoss = useCallback(() => {
    setEnableStopLoss(!enableStopLoss);
  }, [enableStopLoss, setEnableStopLoss]);

  // Toggle Scale Orders
  const toggleScaleOrders = useCallback(() => {
    setUseScaleOrders(!useScaleOrders);
  }, [useScaleOrders, setUseScaleOrders]);

  // Handle TP/SL order type changes
  const handleTakeProfitOrderTypeChange = useCallback(
    (orderType: OrderType) => {
      setTakeProfitOrderType(orderType);
    },
    [setTakeProfitOrderType]
  );

  const handleStopLossOrderTypeChange = useCallback(
    (orderType: OrderType) => {
      setStopLossOrderType(orderType);
    },
    [setStopLossOrderType]
  );

  // Create direction-specific distribution options
  const directionSpecificDistributionOptions = useMemo(() => {
    const isLong = selectedDirection === PositionDirection.LONG;

    return [
      {
        value: "ascending",
        label: isLong
          ? "Ascending (Lower → Entry)"
          : "Ascending (Entry → Higher)",
      },
      {
        value: "descending",
        label: isLong
          ? "Descending (Entry → Lower)"
          : "Descending (Higher → Entry)",
      },
      { value: "random", label: "Random" },
      { value: "flat", label: "Flat (Evenly spaced)" },
    ];
  }, [selectedDirection]);

  // Handle distribution type selection
  const handleDistributionChange = useCallback(
    (value: string | number) => {
      setScaleDistribution(
        value as "ascending" | "descending" | "random" | "flat"
      );
    },
    [setScaleDistribution]
  );

  // Handle numeric input for scale orders
  const handleNumScaleOrdersChange = useCallback(
    (value: string) => {
      const num = parseInt(value);
      if (!isNaN(num) && num > 0) {
        setNumScaleOrders(Math.min(num, 20)); // Cap at 20 orders
      }
    },
    [setNumScaleOrders]
  );

  // TP/SL input handlers
  const handleTakeProfitPriceChange = useCallback(
    (value: string) => {
      if (!value) {
        setTakeProfitPrice(null);
        return;
      }
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setTakeProfitPrice(price);
      }
    },
    [setTakeProfitPrice]
  );

  const handleTakeProfitLimitPriceChange = useCallback(
    (value: string) => {
      if (!value) {
        setTakeProfitLimitPrice(null);
        return;
      }
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setTakeProfitLimitPrice(price);
      }
    },
    [setTakeProfitLimitPrice]
  );

  const handleStopLossPriceChange = useCallback(
    (value: string) => {
      if (!value) {
        setStopLossPrice(null);
        return;
      }
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setStopLossPrice(price);
      }
    },
    [setStopLossPrice]
  );

  const handleStopLossLimitPriceChange = useCallback(
    (value: string) => {
      if (!value) {
        setStopLossLimitPrice(null);
        return;
      }
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setStopLossLimitPrice(price);
      }
    },
    [setStopLossLimitPrice]
  );

  // Handle scale price inputs
  const handleMinPriceChange = useCallback(
    (value: string) => {
      if (!value) {
        setMinPrice(null);
        return;
      }
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setMinPrice(price);
      }
    },
    [setMinPrice]
  );

  const handleMaxPriceChange = useCallback(
    (value: string) => {
      if (!value) {
        setMaxPrice(null);
        return;
      }
      const price = parseFloat(value);
      if (!isNaN(price)) {
        setMaxPrice(price);
      }
    },
    [setMaxPrice]
  );

  // Initialize TP/SL prices
  const initializeTPSLPrices = useCallback(
    (tpPrice: number | null, slPrice: number | null) => {
      setTakeProfitPrice(tpPrice);
      setStopLossPrice(slPrice);
    },
    [setTakeProfitPrice, setStopLossPrice]
  );

  return {
    // Take Profit state
    enableTakeProfit,
    takeProfitPrice,
    takeProfitOrderType,
    takeProfitLimitPrice,

    // Stop Loss state
    enableStopLoss,
    stopLossPrice,
    stopLossOrderType,
    stopLossLimitPrice,

    // Scale Orders state
    useScaleOrders,
    numScaleOrders,
    minPrice,
    maxPrice,
    scaleDistribution,

    // Distribution options (for dropdown)
    distributionOptions: directionSpecificDistributionOptions,

    // Action handlers
    toggleTakeProfit,
    toggleStopLoss,
    toggleScaleOrders,
    handleTakeProfitOrderTypeChange,
    handleStopLossOrderTypeChange,
    handleDistributionChange,
    handleNumScaleOrdersChange,
    handleTakeProfitPriceChange,
    handleTakeProfitLimitPriceChange,
    handleStopLossPriceChange,
    handleStopLossLimitPriceChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    initializeTPSLPrices,
  };
};
