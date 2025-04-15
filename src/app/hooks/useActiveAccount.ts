import { useDriftClient } from "./useDriftClient";
import useSWR from "swr";
import {
  getActiveAccount,
  switchActiveUser,
  getActiveAccountId,
} from "@/services/drift/account";
import { PositionDirection, BN } from "@drift-labs/sdk";
import { useEffect, useState } from "react";

export function useActiveAccount() {
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

  const activeId = () => {
    return activeAccountId;
  };

  return {
    activeAccount,
    error,
    isLoading,
    mutate,
    switchActiveAccount,
    getMaxTradeSizeUSDCForPerp,
    getWithdrawalLimit,
    getFreeCollateral,
    getUserAccountPublicKey,
    activeId,
  };
}
