import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { useDriftClient } from "../hooks/useDriftClient";
import {
  getActiveAccount,
  switchActiveUser,
  getActiveAccountId,
} from "@/services/drift/account";
import { PositionDirection, BN, User } from "@drift-labs/sdk";
import useSWR from "swr";

export interface ActiveAccountContextType {
  activeAccount: User | undefined;
  error: Error | null;
  isLoading: boolean;
  switchActiveAccount: (accountId: number) => Promise<void>;
  getMaxTradeSizeUSDCForPerp: (
    marketIndex: number,
    positionDirection: PositionDirection
  ) => any;
  getWithdrawalLimit: (marketIndex: number, reduceOnly: boolean) => any;
  getFreeCollateral: () => BN;
  getUserAccountPublicKey: () => any;
  activeAccountId: number;
  mutate: () => Promise<any>;
}

export const ActiveAccountContext = createContext<
  ActiveAccountContextType | undefined
>(undefined);

interface ActiveAccountProviderProps {
  children: ReactNode;
}

export function ActiveAccountProvider({
  children,
}: ActiveAccountProviderProps) {
  const { isInitialized } = useDriftClient();
  const [activeAccountId, setActiveAccountId] = useState<number>(0);

  const {
    data: activeAccount,
    error,
    isLoading,
    mutate,
  } = useSWR(isInitialized ? "activeAccount" : null, async () => {
    try {
      const user = getActiveAccount();
      return user;
    } catch (error) {
      console.error("Failed to get active account:", error);
      throw error;
    }
  });

  useEffect(() => {
    if (isInitialized) {
      setActiveAccountId(getActiveAccountId());
    }
  }, [isInitialized]);

  const switchActiveAccount = async (accountId: number) => {
    await switchActiveUser(accountId);
    mutate();
    setActiveAccountId(accountId);
  };

  const getMaxTradeSizeUSDCForPerp = (
    marketIndex: number,
    positionDirection: PositionDirection
  ) => {
    return activeAccount?.getMaxTradeSizeUSDCForPerp(
      marketIndex,
      positionDirection
    );
  };

  const getWithdrawalLimit = (marketIndex: number, reduceOnly: boolean) => {
    return activeAccount?.getWithdrawalLimit(marketIndex, reduceOnly);
  };

  const getFreeCollateral = () => {
    return activeAccount?.getFreeCollateral() || new BN(0);
  };

  const getUserAccountPublicKey = () => {
    return activeAccount?.getUserAccountPublicKey();
  };

  const contextValue: ActiveAccountContextType = {
    activeAccount,
    error,
    isLoading,
    switchActiveAccount,
    getMaxTradeSizeUSDCForPerp,
    getWithdrawalLimit,
    getFreeCollateral,
    getUserAccountPublicKey,
    activeAccountId,
    mutate,
  };

  return (
    <ActiveAccountContext.Provider value={contextValue}>
      {children}
    </ActiveAccountContext.Provider>
  );
}

// Create a hook for using the Active Account context
export function useActiveAccount(): ActiveAccountContextType {
  const context = useContext(ActiveAccountContext);
  if (!context) {
    throw new Error(
      "useActiveAccount must be used within an ActiveAccountProvider"
    );
  }
  return context;
}
