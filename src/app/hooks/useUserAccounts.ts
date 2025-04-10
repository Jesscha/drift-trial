import { DriftClient, UserAccount } from "@drift-labs/sdk";
import { useDriftClient } from "./useDriftClient";
import { useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { getUserAccount } from "@/services/drift/account";

export function useUserAccounts() {
  const { isInitialized, client } = useDriftClient();
  const { publicKey } = useWallet();

  const {
    data: userAccount,
    error,
    isLoading,
    mutate,
  } = useSWR<UserAccount | null>(
    isInitialized && publicKey ? "userAccount" : null,
    getUserAccount,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Refresh every 10 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );
  console.log("userAccount", userAccount);

  return {
    userAccount,
    isLoading,
    error,
    refreshUserAccount: mutate,
  };
}
