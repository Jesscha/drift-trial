import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import txTracker, {
  TransactionInfo,
  TransactionSuccessAction,
} from "@/services/txTracker/txTracker";
import { useUserAccounts } from "./useUserAccounts";

export function useTransactions() {
  const { connection } = useConnection();
  const { refreshUserAccount } = useUserAccounts();
  const [transactions, setTransactions] = useState<TransactionInfo[]>(
    txTracker.getTransactions()
  );

  useEffect(() => {
    txTracker.initialize(connection);

    const handleUpdateUserAccount = () => {
      console.log("Action: Updating user account");
      refreshUserAccount();
    };

    const handleRefreshAll = () => {
      console.log("Action: Refreshing all data");
      refreshUserAccount();
    };

    const handleUpdate = (updatedTxs: TransactionInfo[]) => {
      setTransactions([...updatedTxs]);
    };

    txTracker.on("updated", handleUpdate);
    txTracker.on("action:updateUserAccount", handleUpdateUserAccount);
    txTracker.on("action:refreshAll", handleRefreshAll);

    return () => {
      txTracker.off("updated", handleUpdate);
      txTracker.off("action:updateUserAccount", handleUpdateUserAccount);
      txTracker.off("action:refreshAll", handleRefreshAll);
    };
  }, [connection, refreshUserAccount]);

  return {
    transactions,
    trackTransaction: (
      signature: string,
      description: string,
      successActions?: TransactionSuccessAction[]
    ) => txTracker.trackTransaction(signature, description, successActions),
    clearTransaction: (signature: string) =>
      txTracker.clearTransaction(signature),
    clearAllTransactions: () => txTracker.clearAllTransactions(),
  };
}
