import React from "react";
import { useDepositWithdrawStore } from "@/app/stores/depositWithdrawStore";
import { useDepositWithdrawTransaction } from "@/app/hooks/deposit-withdraw";

export const TransactionError = () => {
  const { error } = useDepositWithdrawStore();
  const { txStatus } = useDepositWithdrawTransaction({
    onClose: () => {}, // This will be handled in the hook
  });

  if (!error && (!txStatus || txStatus.status !== "failed")) return null;

  const errorMessage = error || txStatus?.error || "Unknown error";

  return (
    <div className="text-xs text-red-50 bg-red-900/10 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2 rounded-lg flex items-start">
      <svg
        className="h-3 w-3 text-red-50 mr-1 mt-0.5 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span>{errorMessage}</span>
    </div>
  );
};
