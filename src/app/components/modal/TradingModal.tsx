import { OrderType, PositionDirection, BN } from "@drift-labs/sdk";
import { Modal } from "./Modal";
import { useOrderBook } from "@/app/hooks/useOrderBook";
import { usePerpMarketAccounts } from "@/app/hooks/usePerpMarketAccounts";
import { OrderBook } from "../../components/OrderBook";
import { useCallback, useState, useMemo, useEffect } from "react";
import { useActiveAccount } from "@/app/hooks/useActiveAccount";
import {
  usePerpOrder,
  TriggerCondition,
  getTriggerConditionObject,
} from "@/app/hooks/usePerpOrder";
import {
  usePerpOrders,
  ScaleOrderParams,
  OrderWithTPSLParams,
} from "@/app/hooks/usePerpOrders";
import { useOraclePrice } from "@/app/hooks/useOraclePrice";
import { formatBN } from "@/app/utils/number";
import { useTransactions } from "@/app/hooks/useTransactions";
import { PercentageSlider } from "@/app/components/PercentageSlider";
import {
  CustomDropdown,
  DropdownOption,
} from "@/app/components/CustomDropdown";

type OrderDirection = "long" | "short";

// Define custom order types for our UI that map to SDK OrderType
type CustomOrderType =
  | "Market"
  | "Limit"
  | "StopMarket"
  | "StopLimit"
  | "TakeProfit"
  | "TakeProfitLimit"
  | "OracleLimit";

// Define UI-friendly order type names
type UIOrderType =
  | "Market"
  | "Limit"
  | "Stop Market"
  | "Stop Limit"
  | "Take Profit"
  | "Take Profit Limit"
  | "Oracle Limit";

// Helper to map custom order types to SDK order types
const getSDKOrderType = (customType: CustomOrderType): OrderType => {
  switch (customType) {
    case "Market":
      return OrderType.MARKET;
    case "Limit":
      return OrderType.LIMIT;
    case "StopMarket":
    case "TakeProfit":
      return OrderType.TRIGGER_MARKET;
    case "StopLimit":
    case "TakeProfitLimit":
      return OrderType.TRIGGER_LIMIT;
    case "OracleLimit":
      return OrderType.ORACLE;
    default:
      return OrderType.MARKET;
  }
};

// Add a helper function to remove "-PERP" from market names
const formatMarketName = (name?: string): string => {
  if (!name) return "Asset";
  return name.replace("-PERP", "");
};

export const TradingModal = ({
  isOpen,
  onClose,
  marketIndex,
  orderDirection: initialOrderDirection,
  orderType: initialOrderType,
  orderSize,
}: {
  isOpen: boolean;
  onClose: () => void;
  marketIndex: number;
  orderDirection: OrderDirection;
  orderType: OrderType;
  orderSize?: number;
}) => {
  const { marketsList } = usePerpMarketAccounts();

  const { data, isLoading } = useOrderBook(marketsList[marketIndex]?.name);
  const { oraclePrice } = useOraclePrice(marketIndex);

  const { activeAccount } = useActiveAccount();

  const {
    placePerpOrder,
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,
    isLoading: isOrderLoading,
  } = usePerpOrder();

  // Add usePerpOrders hook for multiple orders functionality
  const {
    placeOrdersWithTracking,
    placeScaleOrders,
    placeOrderWithTPSL,
    isLoading: isMultiOrderLoading,
  } = usePerpOrders();

  const { trackTransaction, transactions } = useTransactions();
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);
  const [orderTxid, setOrderTxid] = useState<string | null>(null);

  // State with BN
  const [sizePercentage, setSizePercentage] = useState<number>(50);
  const [sizeBN, setSizeBN] = useState<BN>(
    new BN(orderSize || 1).mul(new BN(1e6))
  );
  const [priceBN, setPriceBN] = useState<BN | null>(null);
  const [usdValueBN, setUsdValueBN] = useState<BN>(new BN(0));
  const [selectedOrderType, setSelectedOrderType] =
    useState<OrderType>(initialOrderType);
  const [selectedCustomOrderType, setSelectedCustomOrderType] =
    useState<CustomOrderType>("Market");
  const [triggerPriceBN, setTriggerPriceBN] = useState<BN | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<OrderDirection>(
    initialOrderDirection
  );
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // Trigger condition state - using numeric enum
  const [triggerCondition, setTriggerCondition] = useState<number>(
    TriggerCondition.ABOVE
  );

  // State for Scale Orders
  const [useScaleOrders, setUseScaleOrders] = useState<boolean>(false);
  const [numScaleOrders, setNumScaleOrders] = useState<number>(5);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [scaleDistribution, setScaleDistribution] = useState<
    "ascending" | "descending" | "random" | "flat"
  >("ascending");

  // State for TP/SL
  const [enableTakeProfit, setEnableTakeProfit] = useState<boolean>(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number | null>(null);
  const [takeProfitOrderType, setTakeProfitOrderType] = useState<OrderType>(
    OrderType.LIMIT
  );

  const [enableStopLoss, setEnableStopLoss] = useState<boolean>(false);
  const [stopLossPrice, setStopLossPrice] = useState<number | null>(null);
  const [stopLossOrderType, setStopLossOrderType] = useState<OrderType>(
    OrderType.MARKET
  );

  // Add state for TP/SL limit prices
  const [takeProfitLimitPrice, setTakeProfitLimitPrice] = useState<
    number | null
  >(null);
  const [stopLossLimitPrice, setStopLossLimitPrice] = useState<number | null>(
    null
  );

  // Define order type tabs and dropdown options for Pro Orders
  const orderTabs = ["Market", "Limit"] as const;

  const proOrderTypes = [
    "Stop Market",
    "Stop Limit",
    "Take Profit",
    "TP Limit",
    "Oracle Limit",
  ] as readonly UIOrderType[];

  // Map UI-friendly names to our CustomOrderType
  const orderTypeMapping: Record<UIOrderType, CustomOrderType> = {
    Market: "Market",
    Limit: "Limit",
    "Stop Market": "StopMarket",
    "Stop Limit": "StopLimit",
    "Oracle Limit": "OracleLimit",
    "Take Profit": "TakeProfit",
    "Take Profit Limit": "TakeProfitLimit",
  };

  // Track if Pro Orders dropdown is open
  const [proOrdersOpen, setProOrdersOpen] = useState<boolean>(false);

  // Add state for active tab
  const [activeTab, setActiveTab] = useState<UIOrderType>(() => {
    // Map initial order type to a UI order type
    switch (initialOrderType) {
      case OrderType.MARKET:
        return "Market";
      case OrderType.LIMIT:
        return "Limit";
      case OrderType.TRIGGER_MARKET:
        return "Stop Market"; // Default to Stop Market for trigger market
      case OrderType.TRIGGER_LIMIT:
        return "Stop Limit"; // Default to Stop Limit for trigger limit
      case OrderType.ORACLE:
        return "Oracle Limit";
      default:
        return "Market";
    }
  });

  // Handle tab change
  const handleTabChange = useCallback((tab: UIOrderType) => {
    setActiveTab(tab);
    // Map the tab to the corresponding order type
    setSelectedCustomOrderType(orderTypeMapping[tab]);
    setSelectedOrderType(getSDKOrderType(orderTypeMapping[tab]));

    // Close Pro Orders dropdown when selecting a main tab
    setProOrdersOpen(false);
  }, []);

  // Convert pro order types to dropdown options
  const proOrderOptions: DropdownOption[] = useMemo(() => {
    return proOrderTypes.map((type) => ({
      value: type,
      label: type,
    }));
  }, [proOrderTypes]);

  // Handle pro order selection
  const handleProOrderSelect = useCallback((value: string | number) => {
    const orderType = value as UIOrderType;
    setActiveTab(orderType);

    // Map to corresponding CustomOrderType
    setSelectedCustomOrderType(orderTypeMapping[orderType]);
    setSelectedOrderType(getSDKOrderType(orderTypeMapping[orderType]));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target as Element;
      if (!element.closest("#pro-orders-dropdown")) {
        setProOrdersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add separate effect for condition dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target as Element;
      if (
        !element.closest("#condition-dropdown") &&
        !element.closest("#condition-button")
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Calculate maximum position size based on free collateral
  const maxPositionSize = useMemo(() => {
    if (!activeAccount || !oraclePrice) return new BN(0);

    try {
      const maxSizeUsd = activeAccount.user.getMaxTradeSizeUSDCForPerp(
        marketIndex,
        selectedDirection
      );
      return maxSizeUsd.tradeSize;
    } catch (error) {
      console.error("Error calculating max position size:", error);
      return new BN(0);
    }
  }, [activeAccount, oraclePrice, marketIndex, selectedDirection]);

  // Set initial price to oracle price when modal opens or when oracle price becomes available
  useEffect(() => {
    if (oraclePrice && isOpen && !priceBN) {
      setPriceBN(oraclePrice);
    }
  }, [oraclePrice, isOpen, priceBN]);

  // Initialize size and USD value when modal opens
  useEffect(() => {
    if (
      isOpen &&
      oraclePrice &&
      !sizeBN.gt(new BN(1e6)) &&
      !usdValueBN.gt(new BN(0))
    ) {
      const initialSize = new BN(orderSize || 1).mul(new BN(1e6));
      setSizeBN(initialSize);

      // Calculate initial USD value based on size and oracle price
      const initialUsdValue = initialSize.mul(oraclePrice).div(new BN(1e6));
      setUsdValueBN(initialUsdValue);

      // Calculate initial percentage based on USD value and max position size
      if (maxPositionSize.gt(new BN(0))) {
        const initialPercentage = initialUsdValue
          .mul(new BN(100))
          .div(maxPositionSize)
          .toNumber();
        setSizePercentage(Math.min(initialPercentage, 100));
      }
    }
  }, [isOpen, oraclePrice]);

  // Calculate USD value: size * price
  const calculateUsdValue = useCallback((size: BN, price: BN): BN => {
    return size.mul(price).div(new BN(1e6));
  }, []);

  // Calculate size: usdValue / price
  const calculateSize = useCallback((usdValue: BN, price: BN): BN => {
    if (price.isZero()) return new BN(0);
    return usdValue.mul(new BN(1e6)).div(price);
  }, []);

  // Update size based on percentage of max size
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
    [maxPositionSize, oraclePrice, calculateSize]
  );

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
  }, [maxPositionSize, oraclePrice, calculateSize]);

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
    [maxPositionSize, oraclePrice, priceBN, calculateUsdValue, calculateSize]
  );

  // Handle USD value change and update size accordingly
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
    [priceBN, oraclePrice, maxPositionSize, calculateSize]
  );

  // Handle price click from the order book
  const handlePriceClick = useCallback(
    (clickedPrice: number) => {
      // Create BN from the raw price with proper precision
      const newPriceBN = new BN(Math.floor(clickedPrice));
      setPriceBN(newPriceBN);

      // Recalculate USD value with new price
      if (!sizeBN.isZero()) {
        const newUsdValue = calculateUsdValue(sizeBN, newPriceBN);
        setUsdValueBN(newUsdValue);
      }
    },
    [sizeBN, calculateUsdValue]
  );

  // Handle order type selection
  const handleOrderTypeSelect = useCallback(
    (customType: CustomOrderType) => {
      setSelectedCustomOrderType(customType);
      setDropdownOpen(false);
      const sdkOrderType = getSDKOrderType(customType);
      setSelectedOrderType(sdkOrderType);
      console.log("Selected order type:", sdkOrderType);

      // Reset or set relevant fields based on order type
      if (customType === "Market") {
        setPriceBN(null);
      }
      // If switching to Limit and price is null, set it to oracle price
      else if (
        (customType === "Limit" ||
          customType === "StopLimit" ||
          customType === "TakeProfitLimit" ||
          customType === "OracleLimit") &&
        !priceBN &&
        oraclePrice
      ) {
        setPriceBN(oraclePrice);
      }

      // For stop orders, initialize trigger price to oracle price if not set
      if (
        (customType === "StopMarket" ||
          customType === "StopLimit" ||
          customType === "TakeProfit" ||
          customType === "TakeProfitLimit") &&
        !triggerPriceBN &&
        oraclePrice
      ) {
        setTriggerPriceBN(oraclePrice);

        // Set default trigger condition based on direction and order type
        // For long stop losses, default to "below" (sell when price dips)
        // For short stop losses, default to "above" (buy when price spikes)
        // For take profits, opposite logic applies
        if (
          (customType === "StopMarket" || customType === "StopLimit") &&
          selectedDirection === "long"
        ) {
          setTriggerCondition(TriggerCondition.BELOW);
        } else if (
          (customType === "TakeProfit" || customType === "TakeProfitLimit") &&
          selectedDirection === "long"
        ) {
          setTriggerCondition(TriggerCondition.ABOVE);
        } else if (
          (customType === "StopMarket" || customType === "StopLimit") &&
          selectedDirection === "short"
        ) {
          setTriggerCondition(TriggerCondition.ABOVE);
        } else {
          setTriggerCondition(TriggerCondition.BELOW);
        }
      }
    },
    [oraclePrice, priceBN, triggerPriceBN, selectedDirection]
  );

  // Update UI whenever active tab changes
  useEffect(() => {
    if (activeTab) {
      const mappedType = orderTypeMapping[activeTab];
      handleOrderTypeSelect(mappedType);
    }
  }, [activeTab, handleOrderTypeSelect]);

  // Create a mapping of order types to their display info
  const orderTypeInfo = useMemo(
    () => ({
      Market: {
        label: "Market",
        description: "Execute at current market price",
        color: "text-blue-500",
      },
      Limit: {
        label: "Limit",
        description: "Execute at specified price or better",
        color: "text-green-500",
      },
      StopMarket: {
        label: "Stop Market",
        description: "Market order when trigger price is reached",
        color: "text-purple-400",
      },
      StopLimit: {
        label: "Stop Limit",
        description: "Limit order when trigger price is reached",
        color: "text-purple-500",
      },
      TakeProfit: {
        label: "Take Profit",
        description: "Market order to take profit at target price",
        color: "text-green-500",
      },
      TakeProfitLimit: {
        label: "Take Profit Limit",
        description: "Limit order to take profit at target price",
        color: "text-green-400",
      },
      OracleLimit: {
        label: "Oracle Limit",
        description: "Limit order based on oracle price",
        color: "text-blue-400",
      },
    }),
    []
  );

  // Handle direction change
  const handleDirectionChange = useCallback(
    (direction: OrderDirection) => {
      setSelectedDirection(direction);

      // Update TP/SL prices based on new direction
      if (priceBN) {
        const currentPrice = parseFloat(priceBN.toString()) / 1e6;

        if (direction === "long") {
          // For long: TP above entry, SL below entry
          setTakeProfitPrice(currentPrice * 1.1);
          setStopLossPrice(currentPrice * 0.9);
          // Set default limit prices
          setTakeProfitLimitPrice((prevPrice) =>
            prevPrice === null
              ? takeProfitPrice
                ? takeProfitPrice * 0.99
                : currentPrice * 1.1 * 0.99
              : prevPrice
          );
          setStopLossLimitPrice((prevPrice) =>
            prevPrice === null
              ? stopLossPrice
                ? stopLossPrice * 0.99
                : currentPrice * 0.9 * 0.99
              : prevPrice
          );
        } else {
          // For short: TP below entry, SL above entry
          setTakeProfitPrice(currentPrice * 0.9);
          setStopLossPrice(currentPrice * 1.1);
          // Set default limit prices
          setTakeProfitLimitPrice((prevPrice) =>
            prevPrice === null
              ? takeProfitPrice
                ? takeProfitPrice * 1.01
                : currentPrice * 0.9 * 1.01
              : prevPrice
          );
          setStopLossLimitPrice((prevPrice) =>
            prevPrice === null
              ? stopLossPrice
                ? stopLossPrice * 1.01
                : currentPrice * 1.1 * 1.01
              : prevPrice
          );
        }
      }
    },
    [priceBN, takeProfitPrice, stopLossPrice]
  );

  // Check if we're at maximum value
  const isAtMaxValue = useMemo(() => {
    if (!maxPositionSize.gt(new BN(0)) || usdValueBN.isZero()) return false;
    // Consider it at max if it's within 1% of the max value
    return usdValueBN.gte(maxPositionSize.mul(new BN(99)).div(new BN(100)));
  }, [usdValueBN, maxPositionSize]);

  // Add state for confirmation modal
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Modified to open confirmation modal instead of directly placing order
  const handlePlaceOrder = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  // New function to handle the actual order placement after confirmation
  const executeOrder = useCallback(async () => {
    console.log("Placing order");
    // Convert BN to number for SDK
    console.log("Step 1: Converting size from BN to number");
    const sizeNum = parseFloat(sizeBN.toString()) / 1e6;
    console.log("Size:", sizeNum);

    console.log("Step 2: Converting price from BN to number");
    const priceNum = priceBN ? parseFloat(priceBN.toString()) / 1e6 : undefined;
    console.log("Price:", priceNum);

    console.log("Step 3: Converting trigger price from BN to number");
    const triggerPriceNum = triggerPriceBN
      ? parseFloat(triggerPriceBN.toString()) / 1e6
      : undefined;
    console.log("Trigger Price:", triggerPriceNum);

    console.log("Step 4: Mapping direction");
    const direction =
      selectedDirection === "long"
        ? PositionDirection.LONG
        : PositionDirection.SHORT;
    console.log("Direction:", direction);

    try {
      console.log("Step 5: Setting order submitted state");
      setOrderSubmitted(true);
      let result;

      // Check if TP/SL are enabled
      if (
        (enableTakeProfit || enableStopLoss) &&
        !(
          selectedCustomOrderType === "StopMarket" ||
          selectedCustomOrderType === "StopLimit" ||
          selectedCustomOrderType === "TakeProfit" ||
          selectedCustomOrderType === "TakeProfitLimit"
        )
      ) {
        console.log("Placing order with TP/SL");

        const tpPrice =
          takeProfitPrice !== null
            ? takeProfitPrice
            : priceNum && selectedDirection === "long"
            ? priceNum * 1.1
            : priceNum
            ? priceNum * 0.9
            : undefined;

        const slPrice =
          stopLossPrice !== null
            ? stopLossPrice
            : priceNum && selectedDirection === "long"
            ? priceNum * 0.9
            : priceNum
            ? priceNum * 1.1
            : undefined;

        const params = {
          marketIndex,
          direction,
          size: sizeNum,
          price: priceNum,
          orderType: selectedOrderType,
          oraclePriceOffset:
            selectedOrderType === OrderType.ORACLE ? 0.05 : undefined,
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
        selectedCustomOrderType === "Limit" &&
        priceNum
      ) {
        console.log("Placing scale orders");

        const minPriceVal = minPrice !== null ? minPrice : priceNum * 0.95;
        const maxPriceVal = maxPrice !== null ? maxPrice : priceNum * 1.05;

        const scaleParams = {
          marketIndex,
          direction,
          size: sizeNum,
          minPrice: minPriceVal,
          maxPrice: maxPriceVal,
          numOrders: numScaleOrders,
          reduceOnly: false,
          distribution: scaleDistribution, // Add distribution parameter
        };

        result = await placeScaleOrders(scaleParams);
      }
      // Use original order logic for standard orders
      else if (selectedCustomOrderType === "Market") {
        console.log("Placing market order with:", {
          marketIndex,
          direction,
          size: sizeNum,
        });
        result = await placeMarketOrder(marketIndex, direction, sizeNum);
      } else if (selectedCustomOrderType === "Limit" && priceNum) {
        console.log("Placing limit order with:", {
          marketIndex,
          direction,
          size: sizeNum,
          price: priceNum,
        });
        result = await placeLimitOrder(
          marketIndex,
          direction,
          sizeNum,
          priceNum
        );
      } else if (
        (selectedCustomOrderType === "StopMarket" ||
          selectedCustomOrderType === "TakeProfit") &&
        triggerPriceNum
      ) {
        console.log("Placing trigger market order with:", {
          marketIndex,
          direction,
          size: sizeNum,
          triggerPrice: triggerPriceNum,
          triggerCondition,
        });
        result = await placeTriggerMarketOrder(
          marketIndex,
          direction,
          sizeNum,
          triggerPriceNum,
          triggerCondition,
          false // reduceOnly
        );
      } else if (
        (selectedCustomOrderType === "StopLimit" ||
          selectedCustomOrderType === "TakeProfitLimit") &&
        triggerPriceNum &&
        priceNum
      ) {
        console.log("Placing trigger limit order with:", {
          marketIndex,
          direction,
          size: sizeNum,
          price: priceNum,
          triggerPrice: triggerPriceNum,
          triggerCondition,
        });
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
        console.log("Placing oracle order with:", {
          marketIndex,
          direction,
          size: sizeNum,
          offset: 0.05,
        });
        result = await placeOracleOrder(marketIndex, direction, sizeNum, 0.05);
      }

      console.log("Step 7: Processing result:", result);
      if (result?.success && result.txid) {
        console.log("Setting transaction ID:", result.txid);
        setOrderTxid(result.txid);
      } else {
        console.log("No transaction ID, resetting submitted state");
        setOrderSubmitted(false);
      }

      // Close confirmation modal
      setShowConfirmation(false);
    } catch (error) {
      console.error("Step 9: Error handling:", error);
      setOrderSubmitted(false);
      // Close confirmation modal
      setShowConfirmation(false);
    }
  }, [
    selectedOrderType,
    selectedCustomOrderType,
    marketIndex,
    selectedDirection,
    sizeBN,
    priceBN,
    triggerPriceBN,
    triggerCondition,
    placeMarketOrder,
    placeLimitOrder,
    placeOracleOrder,
    placeTriggerMarketOrder,
    placeTriggerLimitOrder,
    // New dependencies
    enableTakeProfit,
    takeProfitPrice,
    takeProfitOrderType,
    enableStopLoss,
    stopLossPrice,
    stopLossOrderType,
    useScaleOrders,
    numScaleOrders,
    minPrice,
    maxPrice,
    placeOrderWithTPSL,
    placeScaleOrders,
    scaleDistribution,
  ]);

  // Get transaction status if we have a txid
  const txStatus = useMemo(() => {
    if (!orderTxid) return null;
    return transactions.find((tx) => tx.signature === orderTxid);
  }, [orderTxid, transactions]);

  // Close modal when transaction is confirmed
  useEffect(() => {
    if (txStatus?.status === "confirmed") {
      // Wait a moment to show the confirmation before closing
      const timer = setTimeout(() => {
        onClose();
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
  }, [txStatus, onClose]);

  // Function to get formatted order type description for confirmation modal
  const getOrderDescription = useCallback(() => {
    const baseDescription = `${
      selectedDirection === "long" ? "Buy" : "Sell"
    } ${formatBN(sizeBN.div(new BN(1e6)))} ${formatMarketName(
      marketsList[marketIndex]?.name
    )}`;

    let detailDescription = "";
    let additionalNotes = "";

    if (useScaleOrders && selectedCustomOrderType === "Limit" && priceBN) {
      const priceNum = parseFloat(priceBN.toString()) / 1e6;
      const minPriceVal = minPrice !== null ? minPrice : priceNum * 0.95;
      const maxPriceVal = maxPrice !== null ? maxPrice : priceNum * 1.05;

      const distributionText =
        scaleDistribution === "ascending"
          ? "Low to High"
          : scaleDistribution === "descending"
          ? "High to Low"
          : scaleDistribution === "random"
          ? "Random"
          : "Flat";

      detailDescription = `Scale Orders (${numScaleOrders}) from ${minPriceVal} to ${maxPriceVal} - ${distributionText}`;
    } else {
      switch (selectedCustomOrderType) {
        case "Market":
          detailDescription = "at Market";
          break;
        case "Limit":
          detailDescription = priceBN
            ? `Limit at ${parseFloat(priceBN.toString()) / 1e6}`
            : "";
          break;
        case "StopMarket":
          detailDescription =
            triggerPriceBN && triggerCondition !== undefined
              ? `Stop Market when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
              : "";
          break;
        case "StopLimit":
          detailDescription =
            triggerPriceBN && priceBN
              ? `Stop Limit ${parseFloat(priceBN.toString()) / 1e6} when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
              : "";
          break;
        case "TakeProfit":
          detailDescription =
            triggerPriceBN && triggerCondition !== undefined
              ? `Take Profit when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
              : "";
          break;
        case "TakeProfitLimit":
          detailDescription =
            triggerPriceBN && priceBN
              ? `Take Profit Limit ${
                  parseFloat(priceBN.toString()) / 1e6
                } when ${
                  triggerCondition === TriggerCondition.ABOVE
                    ? "Above"
                    : "Below"
                } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
              : "";
          break;
        case "OracleLimit":
          detailDescription = priceBN
            ? `Oracle Limit at ${parseFloat(priceBN.toString()) / 1e6}`
            : "";
          break;
        default:
          detailDescription = "";
      }
    }

    // Add TP/SL information if enabled
    if (
      (enableTakeProfit || enableStopLoss) &&
      !(
        selectedCustomOrderType === "StopMarket" ||
        selectedCustomOrderType === "StopLimit" ||
        selectedCustomOrderType === "TakeProfit" ||
        selectedCustomOrderType === "TakeProfitLimit"
      )
    ) {
      if (enableTakeProfit) {
        const tpPrice =
          takeProfitPrice !== null
            ? takeProfitPrice
            : priceBN && selectedDirection === "long"
            ? (parseFloat(priceBN.toString()) / 1e6) * 1.1
            : priceBN
            ? (parseFloat(priceBN.toString()) / 1e6) * 0.9
            : 0;

        additionalNotes += ` with Take Profit at ${tpPrice}`;
      }

      if (enableStopLoss) {
        const slPrice =
          stopLossPrice !== null
            ? stopLossPrice
            : priceBN && selectedDirection === "long"
            ? (parseFloat(priceBN.toString()) / 1e6) * 0.9
            : priceBN
            ? (parseFloat(priceBN.toString()) / 1e6) * 1.1
            : 0;

        additionalNotes += `${
          enableTakeProfit ? " and" : " with"
        } Stop Loss at ${slPrice}`;
      }
    }

    return `${baseDescription} ${detailDescription}${additionalNotes}`;
  }, [
    selectedDirection,
    sizeBN,
    marketsList,
    marketIndex,
    selectedCustomOrderType,
    priceBN,
    triggerPriceBN,
    triggerCondition,
    enableTakeProfit,
    takeProfitPrice,
    enableStopLoss,
    stopLossPrice,
    useScaleOrders,
    numScaleOrders,
    minPrice,
    maxPrice,
    scaleDistribution,
  ]);

  // Get notional value in USD
  const getNotionalValue = useCallback(() => {
    return `${formatBN(usdValueBN, true, 2)} USD`;
  }, [usdValueBN]);

  // Update scale order min/max prices when price changes
  useEffect(() => {
    if (priceBN) {
      const currentPrice = parseFloat(priceBN.toString()) / 1e6;

      if (minPrice === null || minPrice === 0) {
        setMinPrice(currentPrice * 0.95);
      }

      if (maxPrice === null || maxPrice === 0) {
        setMaxPrice(currentPrice * 1.05);
      }
    }
  }, [priceBN]);

  // Convert trigger conditions to dropdown options
  const triggerConditionOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: TriggerCondition.ABOVE, label: "Above" },
      { value: TriggerCondition.BELOW, label: "Below" },
    ];
  }, []);

  // Handle trigger condition selection
  const handleTriggerConditionChange = useCallback((value: string | number) => {
    setTriggerCondition(Number(value));
  }, []);

  // Convert distribution types to dropdown options
  const distributionOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: "ascending", label: "Ascending (Low to High)" },
      { value: "descending", label: "Descending (High to Low)" },
      { value: "random", label: "Random" },
      { value: "flat", label: "Flat" },
    ];
  }, []);

  // Handle distribution type selection
  const handleDistributionChange = useCallback((value: string | number) => {
    setScaleDistribution(
      value as "ascending" | "descending" | "random" | "flat"
    );
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-full h-8 w-8 flex items-center justify-center">
            {/* Market icon */}
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              className="text-purple-50"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M12 6v12M6 12h12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div className="text-base font-medium text-neutrals-100 dark:text-neutrals-0">
            {formatMarketName(marketsList[marketIndex]?.name) || "Market"}
          </div>
        </div>
      }
    >
      <div className="flex flex-row h-full w-[700px]">
        <div className="sticky top-0 h-full overflow-hidden">
          <OrderBook
            orderBookData={data}
            isLoading={isLoading}
            onPriceClick={handlePriceClick}
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 ml-4 p-3 pt-0 bg-neutrals-5 dark:bg-neutrals-90 rounded-lg">
          <div className="flex border-b border-neutrals-20 dark:border-neutrals-70 mb-1 justify-between">
            {orderTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-1 font-medium text-sm transition-colors relative ${
                  activeTab === tab
                    ? "text-purple-50"
                    : "text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
                )}
              </button>
            ))}

            <div className="w-36">
              <CustomDropdown
                options={proOrderOptions}
                value={
                  proOrderTypes.some((type) => activeTab === type)
                    ? activeTab
                    : "Pro Orders"
                }
                onChange={handleProOrderSelect}
                placeholder="Pro Orders"
                renderOption={(option) => (
                  <span className="font-medium text-sm">{option.label}</span>
                )}
                className="py-1 px-2"
                dropdownClassName="right-0 left-auto w-36"
              />
            </div>
          </div>

          {/* Direction Toggle */}
          <div>
            <div className="flex bg-neutrals-10 dark:bg-neutrals-80 p-1 rounded-lg">
              <button
                onClick={() => handleDirectionChange("long")}
                className={`flex-1 py-1.5 text-sm rounded-md text-center font-medium transition-colors ${
                  selectedDirection === "long"
                    ? "bg-green-60 text-white"
                    : "text-neutrals-60 dark:text-neutrals-40"
                }`}
              >
                Long
              </button>
              <button
                onClick={() => handleDirectionChange("short")}
                className={`flex-1 py-1.5 text-sm rounded-md text-center font-medium transition-colors ${
                  selectedDirection === "short"
                    ? "bg-red-60 text-white"
                    : "text-neutrals-60 dark:text-neutrals-40"
                }`}
              >
                Short
              </button>
            </div>
          </div>

          {/* Trigger Price section for Stop orders and Take Profit orders*/}
          {(selectedCustomOrderType === "StopMarket" ||
            selectedCustomOrderType === "StopLimit" ||
            selectedCustomOrderType === "TakeProfit" ||
            selectedCustomOrderType === "TakeProfitLimit") && (
            <>
              <div>
                <div className="text-sm text-neutrals-80 dark:text-neutrals-30 mb-1">
                  Trigger Price
                </div>
                <div className="relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                  <input
                    type="number"
                    value={
                      triggerPriceBN
                        ? parseFloat(triggerPriceBN.toString()) / 1e6
                        : ""
                    }
                    onChange={(e) => {
                      if (!e.target.value) {
                        setTriggerPriceBN(null);
                        return;
                      }

                      const value = parseFloat(e.target.value);
                      const newTriggerPriceBN = new BN(Math.floor(value * 1e6));
                      setTriggerPriceBN(newTriggerPriceBN);
                    }}
                    placeholder="Enter Trigger Price"
                    className="w-full h-10 px-3 py-2 bg-transparent text-sm text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (oraclePrice) {
                          setTriggerPriceBN(oraclePrice);
                        }
                      }}
                      className="text-purple-50 text-xs font-medium"
                    >
                      Oracle
                    </button>
                    <div className="bg-neutrals-20 dark:bg-neutrals-70 rounded-full px-2 py-0.5 text-neutrals-80 dark:text-neutrals-20 text-xs font-medium">
                      USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Trigger Condition */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-neutrals-80 dark:text-neutrals-30">
                    Trigger Condition
                  </div>
                  <div className="w-24">
                    <CustomDropdown
                      options={triggerConditionOptions}
                      value={triggerCondition}
                      onChange={handleTriggerConditionChange}
                      renderOption={(option) => (
                        <span className="font-medium text-sm">
                          {option.label}
                        </span>
                      )}
                      className="py-1 px-2"
                      dropdownClassName="right-0 left-auto w-24"
                    />
                  </div>
                </div>
                <div className="text-xs text-neutrals-60 dark:text-neutrals-40">
                  {(() => {
                    // Determine if this is a stop loss or take profit order
                    const isStopLoss =
                      selectedCustomOrderType === "StopMarket" ||
                      selectedCustomOrderType === "StopLimit";
                    const isTakeProfit =
                      selectedCustomOrderType === "TakeProfit" ||
                      selectedCustomOrderType === "TakeProfitLimit";
                    const directionText =
                      selectedDirection === "long" ? "Long" : "Short";
                    const actionText = isStopLoss
                      ? selectedDirection === "long"
                        ? "Close long"
                        : "Close short"
                      : selectedDirection === "long"
                      ? "Take profit on long"
                      : "Take profit on short";

                    return `${actionText} when price goes ${
                      triggerCondition === TriggerCondition.ABOVE
                        ? "above"
                        : "below"
                    } ${
                      triggerPriceBN
                        ? (parseFloat(triggerPriceBN.toString()) / 1e6).toFixed(
                            2
                          )
                        : "trigger price"
                    }`;
                  })()}
                </div>
              </div>
            </>
          )}

          {/* Limit Price section - Only show for limit-based orders */}
          {(selectedCustomOrderType === "Limit" ||
            selectedCustomOrderType === "StopLimit") && (
            <div>
              <div className="text-sm text-neutrals-80 dark:text-neutrals-30 mb-1">
                {selectedCustomOrderType === "Limit" && useScaleOrders
                  ? "Starting Price"
                  : "Limit Price"}
              </div>
              <div className="relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                <input
                  type="number"
                  value={priceBN ? parseFloat(priceBN.toString()) / 1e6 : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setPriceBN(null);
                      return;
                    }

                    const value = parseFloat(e.target.value);
                    const newPriceBN = new BN(Math.floor(value * 1e6));
                    setPriceBN(newPriceBN);

                    // Update USD value when price changes
                    if (!sizeBN.isZero()) {
                      const newUsdValue = calculateUsdValue(sizeBN, newPriceBN);
                      setUsdValueBN(newUsdValue);
                    }
                  }}
                  placeholder="Enter Price"
                  className="w-full h-10 px-3 py-2 bg-transparent text-sm text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (oraclePrice) {
                        setPriceBN(oraclePrice);

                        // Update USD value when setting oracle price
                        if (!sizeBN.isZero()) {
                          const newUsdValue = calculateUsdValue(
                            sizeBN,
                            oraclePrice
                          );
                          setUsdValueBN(newUsdValue);
                        }
                      }
                    }}
                    className="text-purple-50 text-xs font-medium"
                  >
                    Oracle
                  </button>
                  <div className="bg-neutrals-20 dark:bg-neutrals-70 rounded-full px-2 py-0.5 text-neutrals-80 dark:text-neutrals-20 text-xs font-medium">
                    USD
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-neutrals-80 dark:text-neutrals-30">
                Size
              </div>
              <div
                className="text-xs px-2 py-0.5 bg-neutrals-10 dark:bg-neutrals-80 rounded-full border border-neutrals-30/30 text-neutrals-60 dark:text-neutrals-40 cursor-pointer"
                onClick={handleSetMaxSize}
              >
                Max:{" "}
                {maxPositionSize ? formatBN(maxPositionSize, true) : "0.00"} USD
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`relative bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border ${
                  isAtMaxValue
                    ? "border-yellow-500 dark:border-yellow-500"
                    : "border-neutrals-20 dark:border-neutrals-70"
                }`}
              >
                <input
                  type="number"
                  value={parseFloat(sizeBN.toString()) / 1e6}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  className={`w-full h-10 px-3 py-2 bg-transparent text-sm ${
                    isAtMaxValue
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-neutrals-100 dark:text-neutrals-0"
                  } focus:outline-none`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-purple-50/20 rounded-full px-2 py-0.5 text-purple-50 text-xs font-medium">
                      {formatMarketName(marketsList[marketIndex]?.name) ||
                        "Asset"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`relative bg-neutrals-10 dark:bg-neutrals-80 rounded-lg border ${
                  isAtMaxValue
                    ? "border-yellow-500 dark:border-yellow-500"
                    : "border-neutrals-20 dark:border-neutrals-70"
                }`}
              >
                <input
                  type="number"
                  value={parseFloat(usdValueBN.toString()) / 1e6}
                  onChange={(e) => handleUsdValueChange(e.target.value)}
                  className={`w-full h-10 px-3 py-2 bg-transparent text-sm ${
                    isAtMaxValue
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-neutrals-100 dark:text-neutrals-0"
                  } focus:outline-none`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="bg-blue-90/20 rounded-full px-2 py-0.5 text-blue-40 text-xs font-medium">
                    USD
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Replace the slider code with our component */}
            <PercentageSlider
              percentage={sizePercentage}
              onChange={handleSetSizePercentage}
              sliderHeight="md"
              className="mb-3"
              disabled={isOrderLoading || isMultiOrderLoading || orderSubmitted}
            />
          </div>

          {selectedCustomOrderType === "Limit" && (
            <div>
              <div className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                {/* Header with toggle */}
                <div className="flex items-center p-2 border-b border-neutrals-20 dark:border-neutrals-70">
                  <div className="flex flex-1 space-x-3">
                    {/* Scale Orders Toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-xs font-medium text-neutrals-100 dark:text-neutrals-0">
                        Scale Orders
                      </span>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useScaleOrders}
                          onChange={(e) => setUseScaleOrders(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-8 h-4 rounded-full ${
                            useScaleOrders
                              ? "bg-purple-50"
                              : "bg-neutrals-30 dark:bg-neutrals-70"
                          } transition-colors duration-200`}
                        >
                          <div
                            className={`transform ${
                              useScaleOrders ? "translate-x-4" : "translate-x-0"
                            } transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow-md`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Content area for Scale Orders settings */}
                {useScaleOrders && (
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                          Orders
                        </div>
                        <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                          <input
                            type="number"
                            value={numScaleOrders}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0) {
                                setNumScaleOrders(value);
                              }
                            }}
                            min="2"
                            max="10"
                            className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                          Start Price
                        </div>
                        <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                          <input
                            type="number"
                            value={
                              minPrice !== null
                                ? minPrice
                                : priceBN
                                ? (parseFloat(priceBN.toString()) / 1e6) * 0.95
                                : ""
                            }
                            onChange={(e) => {
                              if (!e.target.value) {
                                setMinPrice(null);
                                return;
                              }
                              setMinPrice(parseFloat(e.target.value));
                            }}
                            placeholder="Min"
                            className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none placeholder:text-neutrals-60 dark:placeholder:text-neutrals-40"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                          End Price
                        </div>
                        <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                          <input
                            type="number"
                            value={
                              maxPrice !== null
                                ? maxPrice
                                : priceBN
                                ? (parseFloat(priceBN.toString()) / 1e6) * 1.05
                                : ""
                            }
                            onChange={(e) => {
                              if (!e.target.value) {
                                setMaxPrice(null);
                                return;
                              }
                              setMaxPrice(parseFloat(e.target.value));
                            }}
                            placeholder="Max"
                            className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none placeholder:text-neutrals-60 dark:placeholder:text-neutrals-40"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Distribution Type Selection */}
                    <div className="mt-2">
                      <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                        Distribution
                      </div>
                      <CustomDropdown
                        options={distributionOptions}
                        value={scaleDistribution}
                        onChange={handleDistributionChange}
                        className="py-1 text-xs"
                      />
                    </div>

                    <div className="text-xs text-blue-500 mt-2">
                      {numScaleOrders}{" "}
                      {numScaleOrders === 1 ? "order" : "orders"} between{" "}
                      {minPrice !== null
                        ? minPrice
                        : priceBN
                        ? (
                            (parseFloat(priceBN.toString()) / 1e6) *
                            0.95
                          ).toFixed(2)
                        : "..."}{" "}
                      and{" "}
                      {maxPrice !== null
                        ? maxPrice
                        : priceBN
                        ? (
                            (parseFloat(priceBN.toString()) / 1e6) *
                            1.05
                          ).toFixed(2)
                        : "..."}{" "}
                      USD
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Take Profit / Stop Loss Section - Compact Design */}
          <div>
            <div className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
              {/* Header with toggles */}
              <div className="flex items-center p-2 border-b border-neutrals-20 dark:border-neutrals-70">
                <div className="flex flex-1 space-x-3">
                  {/* Take Profit Toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs font-medium text-neutrals-100 dark:text-neutrals-0">
                      TP
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableTakeProfit}
                        onChange={(e) => setEnableTakeProfit(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-8 h-4 rounded-full ${
                          enableTakeProfit
                            ? "bg-purple-50"
                            : "bg-neutrals-30 dark:bg-neutrals-70"
                        } transition-colors duration-200`}
                      >
                        <div
                          className={`transform ${
                            enableTakeProfit ? "translate-x-4" : "translate-x-0"
                          } transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow-md`}
                        ></div>
                      </div>
                    </label>
                  </div>

                  {/* Stop Loss Toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-xs font-medium text-neutrals-100 dark:text-neutrals-0">
                      SL
                    </span>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableStopLoss}
                        onChange={(e) => setEnableStopLoss(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-8 h-4 rounded-full ${
                          enableStopLoss
                            ? "bg-purple-50"
                            : "bg-neutrals-30 dark:bg-neutrals-70"
                        } transition-colors duration-200`}
                      >
                        <div
                          className={`transform ${
                            enableStopLoss ? "translate-x-4" : "translate-x-0"
                          } transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow-md`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Content area for TP/SL settings */}
              {(enableTakeProfit || enableStopLoss) && (
                <div className="p-3">
                  {/* Grid layout for both TP and SL fields */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Take Profit Column */}
                    {enableTakeProfit && (
                      <div className="space-y-2 border-r border-neutrals-20 dark:border-neutrals-70 pr-3">
                        <div className="text-xs font-medium text-green-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Take Profit
                        </div>

                        <div>
                          <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                            {takeProfitOrderType === OrderType.MARKET
                              ? "Price"
                              : "Trigger Price"}
                          </div>
                          <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                            <input
                              type="number"
                              value={
                                takeProfitPrice !== null
                                  ? takeProfitPrice
                                  : priceBN
                                  ? (selectedDirection === "long"
                                      ? (parseFloat(priceBN.toString()) / 1e6) *
                                        1.1
                                      : (parseFloat(priceBN.toString()) / 1e6) *
                                        0.9
                                    ).toFixed(2)
                                  : ""
                              }
                              onChange={(e) => {
                                if (!e.target.value) {
                                  setTakeProfitPrice(null);
                                  return;
                                }
                                setTakeProfitPrice(parseFloat(e.target.value));
                              }}
                              placeholder="TP Price"
                              className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                            Order Type
                          </div>
                          <select
                            value={
                              takeProfitOrderType === OrderType.MARKET
                                ? "Market"
                                : "Limit"
                            }
                            onChange={(e) =>
                              setTakeProfitOrderType(
                                e.target.value === "Market"
                                  ? OrderType.MARKET
                                  : OrderType.LIMIT
                              )
                            }
                            className="w-full h-8 px-2 py-1 bg-neutrals-0 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-lg text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                          >
                            <option value="Limit">Limit</option>
                            <option value="Market">Market</option>
                          </select>
                        </div>

                        {takeProfitOrderType === OrderType.LIMIT && (
                          <div>
                            <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                              Limit Price
                            </div>
                            <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                              <input
                                type="number"
                                value={
                                  takeProfitLimitPrice !== null
                                    ? takeProfitLimitPrice
                                    : takeProfitPrice !== null
                                    ? (selectedDirection === "long"
                                        ? takeProfitPrice * 0.99
                                        : takeProfitPrice * 1.01
                                      ).toFixed(2)
                                    : ""
                                }
                                onChange={(e) => {
                                  if (!e.target.value) {
                                    setTakeProfitLimitPrice(null);
                                    return;
                                  }
                                  setTakeProfitLimitPrice(
                                    parseFloat(e.target.value)
                                  );
                                }}
                                placeholder="Limit Price"
                                className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-green-500">
                          {selectedDirection === "long" ? "Sell" : "Buy"} at{" "}
                          {takeProfitPrice || "price"} USD
                          {takeProfitOrderType === OrderType.LIMIT
                            ? ` with limit ${
                                takeProfitLimitPrice || "price"
                              } USD`
                            : ""}
                        </div>
                      </div>
                    )}

                    {/* Stop Loss Column */}
                    {enableStopLoss && (
                      <div
                        className={`space-y-2 ${
                          enableTakeProfit ? "pl-1" : ""
                        }`}
                      >
                        <div className="text-xs font-medium text-red-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Stop Loss
                        </div>

                        <div>
                          <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                            {stopLossOrderType === OrderType.MARKET
                              ? "Price"
                              : "Trigger Price"}
                          </div>
                          <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                            <input
                              type="number"
                              value={
                                stopLossPrice !== null
                                  ? stopLossPrice
                                  : priceBN
                                  ? (selectedDirection === "long"
                                      ? (parseFloat(priceBN.toString()) / 1e6) *
                                        0.9
                                      : (parseFloat(priceBN.toString()) / 1e6) *
                                        1.1
                                    ).toFixed(2)
                                  : ""
                              }
                              onChange={(e) => {
                                if (!e.target.value) {
                                  setStopLossPrice(null);
                                  return;
                                }
                                setStopLossPrice(parseFloat(e.target.value));
                              }}
                              placeholder="SL Price"
                              className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                            Order Type
                          </div>
                          <select
                            value={
                              stopLossOrderType === OrderType.MARKET
                                ? "Market"
                                : "Limit"
                            }
                            onChange={(e) =>
                              setStopLossOrderType(
                                e.target.value === "Market"
                                  ? OrderType.MARKET
                                  : OrderType.LIMIT
                              )
                            }
                            className="w-full h-8 px-2 py-1 bg-neutrals-0 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-lg text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                          >
                            <option value="Market">Market</option>
                            <option value="Limit">Limit</option>
                          </select>
                        </div>

                        {stopLossOrderType === OrderType.LIMIT && (
                          <div>
                            <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1">
                              Limit Price
                            </div>
                            <div className="relative overflow-hidden bg-neutrals-0 dark:bg-neutrals-80 rounded-lg border border-neutrals-20 dark:border-neutrals-70">
                              <input
                                type="number"
                                value={
                                  stopLossLimitPrice !== null
                                    ? stopLossLimitPrice
                                    : stopLossPrice !== null
                                    ? (selectedDirection === "long"
                                        ? stopLossPrice * 0.99
                                        : stopLossPrice * 1.01
                                      ).toFixed(2)
                                    : ""
                                }
                                onChange={(e) => {
                                  if (!e.target.value) {
                                    setStopLossLimitPrice(null);
                                    return;
                                  }
                                  setStopLossLimitPrice(
                                    parseFloat(e.target.value)
                                  );
                                }}
                                placeholder="Limit Price"
                                className="w-full h-8 px-2 py-1 bg-transparent text-xs text-neutrals-100 dark:text-neutrals-0 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-red-500">
                          {selectedDirection === "long" ? "Sell" : "Buy"} at{" "}
                          {stopLossPrice || "price"} USD
                          {stopLossOrderType === OrderType.LIMIT
                            ? ` with limit ${stopLossLimitPrice || "price"} USD`
                            : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={
              isOrderLoading ||
              isMultiOrderLoading ||
              sizeBN.isZero() ||
              orderSubmitted ||
              (selectedCustomOrderType !== "Market" && !priceBN) ||
              ((selectedCustomOrderType === "StopMarket" ||
                selectedCustomOrderType === "StopLimit" ||
                selectedCustomOrderType === "TakeProfit" ||
                selectedCustomOrderType === "TakeProfitLimit") &&
                !triggerPriceBN)
            }
            className={`w-full py-3 mt-auto rounded-lg font-medium text-base transition-colors ${
              selectedDirection === "long"
                ? "bg-green-60 hover:bg-green-70"
                : "bg-red-60 hover:bg-red-70"
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isOrderLoading || isMultiOrderLoading || orderSubmitted
              ? txStatus
                ? txStatus.status === "processing"
                  ? "Processing..."
                  : txStatus.status === "confirmed"
                  ? "Order Confirmed!"
                  : txStatus.status === "failed"
                  ? "Order Failed"
                  : "Submitting..."
                : "Submitting..."
              : (() => {
                  // Base button text
                  let buttonText = `${
                    selectedDirection === "long" ? "Buy" : "Sell"
                  } ${formatBN(sizeBN.div(new BN(1e6)))} ${formatMarketName(
                    marketsList[marketIndex]?.name
                  )}`;

                  // Order type details
                  if (useScaleOrders && selectedCustomOrderType === "Limit") {
                    const distributionSymbol =
                      scaleDistribution === "ascending"
                        ? "↑"
                        : scaleDistribution === "descending"
                        ? "↓"
                        : scaleDistribution === "random"
                        ? "↔"
                        : "=";
                    buttonText += ` • Scale ${distributionSymbol} (${numScaleOrders})`;
                  } else {
                    switch (selectedCustomOrderType) {
                      case "Market":
                        buttonText += " at Market";
                        break;
                      case "Limit":
                        buttonText += priceBN
                          ? ` at ${parseFloat(priceBN.toString()) / 1e6}`
                          : "";
                        break;
                      case "StopMarket":
                        buttonText += triggerPriceBN
                          ? ` Stop ${
                              triggerCondition === TriggerCondition.ABOVE
                                ? "↑"
                                : "↓"
                            } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
                          : "";
                        break;
                      case "StopLimit":
                        buttonText +=
                          triggerPriceBN && priceBN
                            ? ` Stop ${
                                parseFloat(priceBN.toString()) / 1e6
                              } @ ${
                                triggerCondition === TriggerCondition.ABOVE
                                  ? "↑"
                                  : "↓"
                              } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
                            : "";
                        break;
                      case "TakeProfit":
                        buttonText += triggerPriceBN
                          ? ` TP ${
                              triggerCondition === TriggerCondition.ABOVE
                                ? "↑"
                                : "↓"
                            } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
                          : "";
                        break;
                      case "TakeProfitLimit":
                        buttonText +=
                          triggerPriceBN && priceBN
                            ? ` TP ${parseFloat(priceBN.toString()) / 1e6} @ ${
                                triggerCondition === TriggerCondition.ABOVE
                                  ? "↑"
                                  : "↓"
                              } ${parseFloat(triggerPriceBN.toString()) / 1e6}`
                            : "";
                        break;
                      case "OracleLimit":
                        buttonText += " Oracle";
                        break;
                      default:
                        break;
                    }
                  }

                  // Add TP/SL indicators
                  let tpslText = "";
                  if (
                    (enableTakeProfit || enableStopLoss) &&
                    !(
                      selectedCustomOrderType === "StopMarket" ||
                      selectedCustomOrderType === "StopLimit" ||
                      selectedCustomOrderType === "TakeProfit" ||
                      selectedCustomOrderType === "TakeProfitLimit"
                    )
                  ) {
                    tpslText = " + ";
                    if (enableTakeProfit) {
                      tpslText += "TP";
                    }
                    if (enableStopLoss) {
                      tpslText += enableTakeProfit ? "/SL" : "SL";
                    }
                  }

                  return `${buttonText}${tpslText}`;
                })()}
          </button>

          {txStatus?.status === "failed" && (
            <div className="mt-2 text-red-500 text-sm text-center">
              Transaction failed: {txStatus.error || "Unknown error"}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutrals-100/30 dark:bg-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg shadow-xl w-96 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-neutrals-20 dark:border-neutrals-70">
              <h2 className="text-lg font-bold text-neutrals-100 dark:text-neutrals-0 flex items-center">
                Confirm Order
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmation(false);
                }}
                className="text-neutrals-60 hover:text-neutrals-100 dark:text-neutrals-40 dark:hover:text-neutrals-0 focus:outline-none transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 text-neutrals-100 dark:text-neutrals-10">
              <div className="mb-5">
                <div className="text-sm text-neutrals-60 dark:text-neutrals-40 mb-1">
                  Order Summary
                </div>
                <div className="text-base font-medium">
                  {getOrderDescription()}
                </div>
              </div>

              <div className="mb-5">
                <div className="text-sm text-neutrals-60 dark:text-neutrals-40 mb-1">
                  Notional Value
                </div>
                <div className="text-base font-medium">
                  {getNotionalValue()}
                </div>
              </div>

              <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
                <div className="flex items-start gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>
                    Please review your order details before confirming. This
                    action cannot be undone.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmation(false);
                  }}
                  className="flex-1 py-3 rounded-lg font-medium bg-neutrals-10 dark:bg-neutrals-70 text-neutrals-80 dark:text-neutrals-20 hover:bg-neutrals-20 dark:hover:bg-neutrals-60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    executeOrder();
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium text-white transition-colors ${
                    selectedDirection === "long"
                      ? "bg-green-60 hover:bg-green-70"
                      : "bg-red-60 hover:bg-red-70"
                  }`}
                >
                  Confirm {selectedDirection === "long" ? "Buy" : "Sell"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
