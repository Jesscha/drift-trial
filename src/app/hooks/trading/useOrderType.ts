import { useCallback } from "react";
import { useTradingStore } from "@/app/stores/tradingStore";
import { OrderTypeOption } from "@/app/components/modal/TradingModal.util";

export const useOrderType = () => {
  const selectedOrderType = useTradingStore((state) => state.selectedOrderType);
  const selectedCustomOrderType = useTradingStore(
    (state) => state.selectedCustomOrderType
  );
  const setSelectedCustomOrderType = useTradingStore(
    (state) => state.setSelectedCustomOrderType
  );
  const setOrderType = useTradingStore((state) => state.setSelectedOrderType);

  const activeTab = useTradingStore((state) => state.activeTab);
  const setActiveTab = useTradingStore((state) => state.setActiveTab);

  const handleTabChange = useCallback(
    (tab: OrderTypeOption) => {
      setActiveTab(tab);
      setSelectedCustomOrderType(tab);
      setOrderType(tab);
    },
    [setActiveTab, setSelectedCustomOrderType, setOrderType]
  );

  const handleProOrderSelect = useCallback(
    (value: string | number) => {
      const orderType = value as OrderTypeOption;
      setActiveTab(orderType);
      setSelectedCustomOrderType(orderType);
      setOrderType(orderType);
    },
    [setActiveTab, setSelectedCustomOrderType, setOrderType]
  );
  const orderTabs = [OrderTypeOption.MARKET, OrderTypeOption.LIMIT];

  const proOrderTypes = [
    OrderTypeOption.STOP_MARKET,
    OrderTypeOption.STOP_LIMIT,
    OrderTypeOption.TAKE_PROFIT,
    OrderTypeOption.TAKE_PROFIT_LIMIT,
  ];

  const proOrderOptions = proOrderTypes.map((type) => ({
    value: type,
    label: type,
  }));

  return {
    selectedOrderType,
    selectedCustomOrderType,
    activeTab,
    orderTabs,
    proOrderTypes,
    proOrderOptions,
    handleTabChange,
    handleProOrderSelect,
  };
};
