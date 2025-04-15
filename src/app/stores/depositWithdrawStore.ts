import { create } from "zustand";
import { BN } from "@drift-labs/sdk";
import { USDC_MINT } from "@/constants";

export enum TransactionMode {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export interface TokenSelectionInfo {
  symbol: string;
  mint: string;
}

interface DepositWithdrawState {
  // Modal state
  mode: TransactionMode;
  amount: string;
  selectedMarketIndex: number;
  tokenSelectionInfo: TokenSelectionInfo;
  reduceOnly: boolean;

  // Transaction state
  isLoading: boolean;
  error: string | null;
  orderSubmitted: boolean;
  txSignature: string | null;

  // Actions
  setMode: (mode: TransactionMode) => void;
  setAmount: (amount: string) => void;
  setSelectedMarketIndex: (index: number) => void;
  setTokenSelectionInfo: (tokenSelectionInfo: TokenSelectionInfo) => void;
  setReduceOnly: (reduceOnly: boolean) => void;

  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setOrderSubmitted: (submitted: boolean) => void;
  setTxSignature: (signature: string | null) => void;

  // Initialize & Reset state
  initializeState: (
    initialMode?: TransactionMode,
    initialMarketIndex?: number,
    initialSubaccountId?: number
  ) => void;
  resetState: () => void;
  resetAmount: () => void;
}

export const useDepositWithdrawStore = create<DepositWithdrawState>((set) => ({
  // Initial values
  mode: TransactionMode.DEPOSIT,
  amount: "",
  selectedMarketIndex: 0,
  tokenSelectionInfo: {
    symbol: "USDC",
    mint: USDC_MINT,
  },
  reduceOnly: false,

  isLoading: false,
  error: null,
  orderSubmitted: false,
  txSignature: null,

  // Simple setter actions
  setMode: (mode) => set({ mode }),
  setAmount: (amount) => set({ amount, error: null }),
  setSelectedMarketIndex: (index) => set({ selectedMarketIndex: index }),
  setTokenSelectionInfo: (tokenSelectionInfo) => set({ tokenSelectionInfo }),
  setReduceOnly: (reduceOnly) => set({ reduceOnly }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOrderSubmitted: (submitted) => set({ orderSubmitted: submitted }),
  setTxSignature: (signature) => set({ txSignature: signature }),

  // Initialize state
  initializeState: (
    initialMode = TransactionMode.DEPOSIT,
    initialMarketIndex = 0
  ) =>
    set({
      mode: initialMode,
      selectedMarketIndex: initialMarketIndex,
    }),

  // Reset state
  resetState: () =>
    set({
      amount: "",
      error: null,
      isLoading: false,
      orderSubmitted: false,
      txSignature: null,
      reduceOnly: false,
    }),

  resetAmount: () =>
    set({
      amount: "",
      error: null,
    }),
}));
