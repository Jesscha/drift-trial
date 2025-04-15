import { create } from "zustand";
import { OrderType, PositionDirection, BN } from "@drift-labs/sdk";
import { TriggerCondition } from "@/app/hooks/usePerpOrder";
import {
  OrderTypeOption,
  mapSDKToUIOrderType,
} from "../components/modal/TradingModal.util";

interface TradingState {
  // Order size and price state
  sizeBN: BN;
  priceBN: BN | null;
  usdValueBN: BN;
  sizePercentage: number;

  // Order type state
  selectedOrderType: OrderType;
  selectedCustomOrderType: OrderTypeOption;
  selectedDirection: PositionDirection;

  // Trigger order state
  triggerPriceBN: BN | null;
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
  setSizeBN: (size: BN) => void;
  setPriceBN: (price: BN | null) => void;
  setUsdValueBN: (value: BN) => void;
  setSizePercentage: (percentage: number) => void;

  setSelectedOrderType: (orderType: OrderType) => void;
  setSelectedCustomOrderType: (orderType: OrderTypeOption) => void;
  setSelectedDirection: (direction: PositionDirection) => void;

  setTriggerPriceBN: (price: BN | null) => void;
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

  // Initialize state
  initializeState: (
    orderSize?: number,
    initialOrderType?: OrderType,
    initialOrderDirection?: PositionDirection
  ) => void;

  // Reset state
  resetState: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  // Initial values
  sizeBN: new BN(1).mul(new BN(1e6)),
  priceBN: null,
  usdValueBN: new BN(0),
  sizePercentage: 50,

  selectedOrderType: OrderType.MARKET,
  selectedCustomOrderType: OrderTypeOption.MARKET,
  selectedDirection: PositionDirection.LONG,

  triggerPriceBN: null,
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

  activeTab: OrderTypeOption.MARKET,

  // Simple setter actions
  setSizeBN: (size) => set({ sizeBN: size }),
  setPriceBN: (price) => set({ priceBN: price }),
  setUsdValueBN: (value) => set({ usdValueBN: value }),
  setSizePercentage: (percentage) => set({ sizePercentage: percentage }),

  setSelectedOrderType: (orderType) => set({ selectedOrderType: orderType }),
  setSelectedCustomOrderType: (orderType) =>
    set({ selectedCustomOrderType: orderType }),
  setSelectedDirection: (direction) => set({ selectedDirection: direction }),

  setTriggerPriceBN: (price) => set({ triggerPriceBN: price }),
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

  // Initialize state
  initializeState: (orderSize, initialOrderType, initialOrderDirection) =>
    set({
      sizeBN: new BN(orderSize || 1).mul(new BN(1e6)),
      selectedOrderType: initialOrderType || OrderType.MARKET,
      selectedDirection: initialOrderDirection || PositionDirection.LONG,
      activeTab: initialOrderType
        ? mapSDKToUIOrderType(initialOrderType)
        : OrderTypeOption.MARKET,
    }),

  // Reset state
  resetState: () =>
    set({
      orderSubmitted: false,
      orderTxid: null,
      showConfirmation: false,
    }),
}));
