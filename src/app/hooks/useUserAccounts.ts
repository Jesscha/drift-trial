import { DriftClient } from "@drift-labs/sdk";
import { useDriftClient } from "./useDriftClient";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getUserAccount } from "../services/drift/account";

export function useUserAccounts() {
  const { isInitialized } = useDriftClient();

  useEffect(() => {
    if (isInitialized) {
      getUserAccount().then((userAccount) => {
        console.log(userAccount);
      });
    }
  }, [isInitialized]);
}
