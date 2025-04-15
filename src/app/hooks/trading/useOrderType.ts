import { useCallback, useEffect, useRef } from "react";
import { OrderType } from "@drift-labs/sdk";
import { useTradingStore } from "@/app/stores/tradingStore";
import {
  OrderTypeOption,
  getSDKOrderType,
  getDefaultTriggerCondition,
  isLimitOrderType,
  isTriggerOrderType,
  mapSDKToUIOrderType,
} from "@/app/components/modal/TradingModal.util";
import { useOraclePrice } from "../useOraclePrice";

export const useOrderType = (marketIndex: number) => {
  const selectedOrderType = useTradingStore((state) => state.selectedOrderType);
  const setSelectedOrderType = useTradingStore(
    (state) => state.setSelectedOrderType
  );
  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );
  const setSelectedCustomOrderType = useTradingStore(
    (state) => state.setSelectedCustomOrderType
  );
  const selectedDirection = useTradingStore((state) => state.selectedDirection);
  const activeTab = useTradingStore((state) => state.activeTab);
  const setActiveTab = useTradingStore((state) => state.setActiveTab);
  const price = useTradingStore((state) => state.price);
  const setPrice = useTradingStore((state) => state.setPrice);
  const triggerPrice = useTradingStore((state) => state.triggerPrice);
  const setTriggerPrice = useTradingStore((state) => state.setTriggerPrice);
  const setTriggerCondition = useTradingStore(
    (state) => state.setTriggerCondition
  );

  const { oraclePrice: oraclePriceBN } = useOraclePrice(marketIndex);
  const oraclePrice = oraclePriceBN
    ? parseFloat(oraclePriceBN.toString()) / 1e6
    : null;

  // Create a ref to track the previous activeTab value
  const prevActiveTabRef = useRef<OrderTypeOption | null>(null);

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: OrderTypeOption) => {
      setActiveTab(tab);
      setSelectedCustomOrderType(tab);
    },
    [setActiveTab, setSelectedCustomOrderType]
  );

  // Handle pro order selection
  const handleProOrderSelect = useCallback(
    (value: string | number) => {
      const orderType = value as OrderTypeOption;
      setActiveTab(orderType);
      setSelectedCustomOrderType(orderType);
    },
    [setActiveTab, setSelectedCustomOrderType]
  );

  // Update selected order type when the active tab changes
  useEffect(() => {
    if (activeTab === prevActiveTabRef.current) {
      return;
    }
    prevActiveTabRef.current = activeTab;
    if (activeTab) {
      const sdkOrderType = getSDKOrderType(activeTab);
      setSelectedOrderType(sdkOrderType);

      if (activeTab === OrderTypeOption.MARKET) {
        setPrice(null);
      } else if (isLimitOrderType(activeTab) && !price && oraclePrice) {
        setPrice(oraclePrice);
      }

      // For trigger orders, initialize trigger price to oracle price if not set
      if (isTriggerOrderType(activeTab) && !triggerPrice && oraclePrice) {
        setTriggerPrice(oraclePrice);
        setTriggerCondition(
          getDefaultTriggerCondition(activeTab, selectedDirection)
        );
      }
    }
  }, [
    activeTab,
    oraclePrice,
    price,
    triggerPrice,
    selectedDirection,
    setSelectedOrderType,
    setPrice,
    setTriggerPrice,
    setTriggerCondition,
  ]);

  // Define order type tabs and dropdown options for Pro Orders
  const orderTabs = [OrderTypeOption.MARKET, OrderTypeOption.LIMIT] as const;

  const proOrderTypes = [
    OrderTypeOption.STOP_MARKET,
    OrderTypeOption.STOP_LIMIT,
    OrderTypeOption.TAKE_PROFIT,
    OrderTypeOption.TAKE_PROFIT_LIMIT,
  ];

  // Convert pro order types to dropdown options
  const proOrderOptions = proOrderTypes.map((type) => ({
    value: type,
    label: type,
  }));

  // Initialize order type from provided order type
  const initializeOrderType = useCallback(
    (initialOrderType: OrderType) => {
      setSelectedOrderType(initialOrderType);
      const uiOrderType = mapSDKToUIOrderType(initialOrderType);
      setSelectedCustomOrderType(uiOrderType);
      setActiveTab(uiOrderType);
    },
    [setSelectedOrderType, setSelectedCustomOrderType, setActiveTab]
  );

  return {
    selectedOrderType,
    selectedCustomOrderType,
    activeTab,
    orderTabs,
    proOrderTypes,
    proOrderOptions,
    handleTabChange,
    handleProOrderSelect,
    initializeOrderType,
  };
};
