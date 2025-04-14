import { User, UserAccount } from "@drift-labs/sdk";
import { useDriftClient } from "./useDriftClient";
import useSWR, { mutate } from "swr";
import {
  getActiveAccount,
  switchActiveUser,
  getActiveAccountId,
} from "@/services/drift/account";

export function useActiveAccount() {
  const { isInitialized } = useDriftClient();
  const {
    data: activeAccount,
    error,
    isLoading,
    mutate,
  } = useSWR(isInitialized ? "activeAccount" : null, async () => {
    try {
      const user = getActiveAccount();
      const activeId = getActiveAccountId();

      return {
        user,
        activeId,
        freeCollateral: user.getFreeCollateral(),
      };
    } catch (error) {
      console.error("Failed to get active account:", error);
      throw error;
    }
  });

  const switchActiveAccount = async (accountId: number) => {
    const user = await switchActiveUser(accountId);
    mutate();
  };

  return {
    activeAccount,
    error,
    isLoading,
    mutate,
    switchActiveAccount,
  };
}
