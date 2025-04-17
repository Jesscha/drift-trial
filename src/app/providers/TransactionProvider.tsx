import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import txTracker from "@/services/txTracker/txTracker";
import {
  TransactionInfo,
  TransactionSuccessAction,
} from "@/types/transactions";
import { useUserAccounts } from "../hooks/useUserAccounts";

export interface TransactionContextType {
  transactions: TransactionInfo[];
  isInitialized: boolean;
  getTxStatus: (signature: string) => TransactionInfo | undefined;
  trackTransaction: (
    signature: string,
    description: string,
    successActions?: TransactionSuccessAction[]
  ) => Promise<TransactionInfo>;
  clearTransaction: (signature: string) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
}

export const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const { connection } = useConnection();
  const { refreshUserAccount } = useUserAccounts();
  const [transactions, setTransactions] = useState<TransactionInfo[]>(
    txTracker.getTransactions()
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!connection) return;

    // Initialize the transaction tracker service with the connection
    txTracker.initialize(connection);
    setIsInitialized(true);

    // Set up event handlers
    const handleUpdateUserAccount = () => {
      refreshUserAccount();
    };

    const handleRefreshAll = () => {
      refreshUserAccount();
    };

    const handleUpdate = (updatedTxs: TransactionInfo[]) => {
      setTransactions([...updatedTxs]);
    };

    // Subscribe to events
    txTracker.on("updated", handleUpdate);
    txTracker.on("action:updateUserAccount", handleUpdateUserAccount);
    txTracker.on("action:refreshAll", handleRefreshAll);

    // Clean up event listeners when component unmounts
    return () => {
      txTracker.off("updated", handleUpdate);
      txTracker.off("action:updateUserAccount", handleUpdateUserAccount);
      txTracker.off("action:refreshAll", handleRefreshAll);
    };
  }, [connection, refreshUserAccount]);

  // Utility function to get transaction status by signature
  const getTxStatus = (signature: string) => {
    return transactions.find((tx) => tx.signature === signature);
  };

  // Create the context value object with all the necessary functions and state
  const contextValue: TransactionContextType = {
    transactions,
    isInitialized,
    getTxStatus,
    trackTransaction: (
      signature: string,
      description: string,
      successActions?: TransactionSuccessAction[]
    ) => txTracker.trackTransaction(signature, description, successActions),
    clearTransaction: (signature: string) =>
      txTracker.clearTransaction(signature),
    clearAllTransactions: () => txTracker.clearAllTransactions(),
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}
