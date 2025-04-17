import { useCallback } from "react";
import { useTradingStore } from "@/app/stores/tradingStore";
import { getOrderTypeFromTab } from "@/app/components/modal/TradingModal.util";
import { TradingModalTab } from "@/types";

export const useOrderType = () => {
  const selectedOrderType = useTradingStore((state) => state.selectedOrderType);
  const setOrderType = useTradingStore((state) => state.setSelectedOrderType);

  const activeTab = useTradingStore((state) => state.activeTab);
  const setActiveTab = useTradingStore((state) => state.setActiveTab);

  const handleTabChange = useCallback(
    (tab: TradingModalTab) => {
      setActiveTab(tab);
      setOrderType(getOrderTypeFromTab(tab));
    },
    [setActiveTab, setOrderType]
  );

  const handleProOrderSelect = useCallback(
    (value: TradingModalTab) => {
      setActiveTab(value);
      setOrderType(getOrderTypeFromTab(value));
    },
    [setActiveTab, setOrderType]
  );
  const orderTabs = ["market", "limit"] as const;

  const proOrderTypes = [
    "stop-loss-market",
    "stop-loss-limit",
    "take-profit-market",
    "take-profit-limit",
  ] as const;

  const proOrderOptions = proOrderTypes.map((type) => ({
    value: type,
    label: type,
  }));

  return {
    selectedOrderType,
    activeTab,
    orderTabs,
    proOrderTypes,
    proOrderOptions,
    handleTabChange,
    handleProOrderSelect,
  };
};
