import { DriftClient, UserAccount } from "@drift-labs/sdk";
import { useDriftClient } from "./useDriftClient";
import { useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { getAllUsers, getUserAccount } from "@/services/drift/account";

export function useUserAccounts() {
  const { isInitialized } = useDriftClient();
  const { publicKey } = useWallet();

  const {
    data: userAccount,
    error,
    isLoading,
    mutate,
  } = useSWR<UserAccount[] | null>(
    isInitialized && publicKey ? "userAccount" : null,
    () => {
      if (!publicKey) return null;
      return getAllUsers(publicKey);
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Refresh every 10 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    userAccount,
    isLoading,
    error,
    refreshUserAccount: mutate,
  };
}
