import { DriftClient } from "@drift-labs/sdk";
import { useDriftClient } from "./useDriftClient";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUserAccount, UserAccount } from "../services/drift/account";
import useSWR from "swr";

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

  console.log(userAccount);

  return {
    userAccount,
    isLoading,
    error,
    refreshUserAccount: mutate,
  };
}
