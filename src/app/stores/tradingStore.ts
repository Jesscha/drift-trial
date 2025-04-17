import { create } from "zustand";
import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { TriggerCondition } from "@/types/orders";
import { OrderTypeOption } from "../components/modal/TradingModal.util";

interface TradingState {
  // Order size and price state
  size: number;
  price: number | null;
  usdValue: number;
  sizePercentage: number;

  // Order type state
  selectedOrderType: OrderType;
  selectedCustomOrderType: OrderTypeOption;
  selectedDirection: PositionDirection;

  // Trigger order state
  triggerPrice: number | null;
  triggerCondition: TriggerCondition;

  // Scale orders state
  useScaleOrders: boolean;
  numScaleOrders: number;
  minPrice: number | null;
  maxPrice: number | null;
  scaleDistribution: "ascending" | "descending" | "random" | "flat";

  // TP/SL state
  enableTakeProfit: boolean;
  takeProfitPrice: number | null;
  takeProfitOrderType: OrderType;
  takeProfitLimitPrice: number | null;

  enableStopLoss: boolean;
  stopLossPrice: number | null;
  stopLossOrderType: OrderType;
  stopLossLimitPrice: number | null;

  // Transaction state
  orderSubmitted: boolean;
  orderTxid: string | null;
  showConfirmation: boolean;

  // UI state
  activeTab: OrderTypeOption;

  // Actions
  setSize: (size: number) => void;
  setPrice: (price: number | null) => void;
  setUsdValue: (value: number) => void;
  setSizePercentage: (percentage: number) => void;

  setSelectedOrderType: (orderType: OrderType) => void;
  setSelectedCustomOrderType: (orderType: OrderTypeOption) => void;
  setSelectedDirection: (direction: PositionDirection) => void;

  setTriggerPrice: (price: number | null) => void;
  setTriggerCondition: (condition: number) => void;

  setUseScaleOrders: (use: boolean) => void;
  setNumScaleOrders: (num: number) => void;
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  setScaleDistribution: (
    distribution: "ascending" | "descending" | "random" | "flat"
  ) => void;

  setEnableTakeProfit: (enable: boolean) => void;
  setTakeProfitPrice: (price: number | null) => void;
  setTakeProfitOrderType: (orderType: OrderType) => void;
  setTakeProfitLimitPrice: (price: number | null) => void;

  setEnableStopLoss: (enable: boolean) => void;
  setStopLossPrice: (price: number | null) => void;
  setStopLossOrderType: (orderType: OrderType) => void;
  setStopLossLimitPrice: (price: number | null) => void;

  setOrderSubmitted: (submitted: boolean) => void;
  setOrderTxid: (txid: string | null) => void;
  setShowConfirmation: (show: boolean) => void;

  setActiveTab: (tab: OrderTypeOption) => void;

  // Reset state
  resetState: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  // Initial values
  size: 1.0,
  price: null,
  usdValue: 0,
  sizePercentage: 50,

  selectedOrderType: OrderType.LIMIT,
  selectedCustomOrderType: OrderTypeOption.LIMIT,
  selectedDirection: PositionDirection.LONG,

  triggerPrice: null,
  triggerCondition: TriggerCondition.ABOVE,

  useScaleOrders: false,
  numScaleOrders: 5,
  minPrice: null,
  maxPrice: null,
  scaleDistribution: "ascending",

  enableTakeProfit: false,
  takeProfitPrice: null,
  takeProfitOrderType: OrderType.MARKET,
  takeProfitLimitPrice: null,

  enableStopLoss: false,
  stopLossPrice: null,
  stopLossOrderType: OrderType.MARKET,
  stopLossLimitPrice: null,

  orderSubmitted: false,
  orderTxid: null,
  showConfirmation: false,

  activeTab: OrderTypeOption.LIMIT,

  // Simple setter actions
  setSize: (size) => set({ size }),
  setPrice: (price) => set({ price }),
  setUsdValue: (usdValue) => set({ usdValue }),
  setSizePercentage: (percentage) => set({ sizePercentage: percentage }),

  setSelectedOrderType: (orderType) => set({ selectedOrderType: orderType }),
  setSelectedCustomOrderType: (orderType) =>
    set({ selectedCustomOrderType: orderType }),
  setSelectedDirection: (direction) => set({ selectedDirection: direction }),

  setTriggerPrice: (price) => set({ triggerPrice: price }),
  setTriggerCondition: (condition) => set({ triggerCondition: condition }),

  setUseScaleOrders: (use) => set({ useScaleOrders: use }),
  setNumScaleOrders: (num) => set({ numScaleOrders: num }),
  setMinPrice: (price) => set({ minPrice: price }),
  setMaxPrice: (price) => set({ maxPrice: price }),
  setScaleDistribution: (distribution) =>
    set({ scaleDistribution: distribution }),

  setEnableTakeProfit: (enable) => set({ enableTakeProfit: enable }),
  setTakeProfitPrice: (price) => set({ takeProfitPrice: price }),
  setTakeProfitOrderType: (orderType) =>
    set({ takeProfitOrderType: orderType }),
  setTakeProfitLimitPrice: (price) => set({ takeProfitLimitPrice: price }),

  setEnableStopLoss: (enable) => set({ enableStopLoss: enable }),
  setStopLossPrice: (price) => set({ stopLossPrice: price }),
  setStopLossOrderType: (orderType) => set({ stopLossOrderType: orderType }),
  setStopLossLimitPrice: (price) => set({ stopLossLimitPrice: price }),

  setOrderSubmitted: (submitted) => set({ orderSubmitted: submitted }),
  setOrderTxid: (txid) => set({ orderTxid: txid }),
  setShowConfirmation: (show) => set({ showConfirmation: show }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Reset state
  resetState: () =>
    set({
      size: 1.0,
      price: null,
      usdValue: 0,
      sizePercentage: 50,
      selectedOrderType: OrderType.LIMIT,
      selectedCustomOrderType: OrderTypeOption.LIMIT,
      selectedDirection: PositionDirection.LONG,
      triggerPrice: null,
      triggerCondition: TriggerCondition.ABOVE,
      useScaleOrders: false,
      numScaleOrders: 5,
      minPrice: null,
      maxPrice: null,
      scaleDistribution: "ascending",
      enableTakeProfit: false,
      takeProfitPrice: null,
      takeProfitOrderType: OrderType.MARKET,
      takeProfitLimitPrice: null,
      enableStopLoss: false,
      stopLossPrice: null,
      stopLossOrderType: OrderType.MARKET,
      stopLossLimitPrice: null,
      orderSubmitted: false,
      orderTxid: null,
      showConfirmation: false,
      activeTab: OrderTypeOption.LIMIT,
    }),
}));
