import React from "react";
import {
  TransactionMode,
  useDepositWithdrawStore,
} from "@/app/stores/depositWithdrawStore";

export const ModalTabs = () => {
  const { mode, setMode } = useDepositWithdrawStore();

  return (
    <div className="flex border-b border-neutrals-20 dark:border-neutrals-70">
      <button
        className={`px-4 py-2 font-medium flex-1 transition-colors relative ${
          mode === TransactionMode.DEPOSIT
            ? "text-purple-50"
            : "text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
        }`}
        onClick={() => setMode(TransactionMode.DEPOSIT)}
      >
        Deposit
        {mode === TransactionMode.DEPOSIT && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
        )}
      </button>
      <button
        className={`px-4 py-2 font-medium flex-1 transition-colors relative ${
          mode === TransactionMode.WITHDRAW
            ? "text-purple-50"
            : "text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
        }`}
        onClick={() => setMode(TransactionMode.WITHDRAW)}
      >
        Withdraw
        {mode === TransactionMode.WITHDRAW && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
        )}
      </button>
    </div>
  );
};
