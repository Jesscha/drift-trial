import React from "react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionToast } from "./TransactionToast";

export function TransactionToasts() {
  const { transactions, clearTransaction } = useTransactions();

  // Filter to recent transactions (last 30 min)
  const recentTransactions = transactions.filter(
    (tx) => Date.now() - tx.timestamp < 30 * 60 * 1000
  );

  if (recentTransactions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 flex flex-col-reverse">
      {recentTransactions.map((tx) => (
        <TransactionToast
          key={tx.signature}
          signature={tx.signature}
          status={tx.status}
          description={tx.description}
          timestamp={tx.timestamp}
          error={tx.error}
          onClose={() => clearTransaction(tx.signature)}
        />
      ))}
    </div>
  );
}
