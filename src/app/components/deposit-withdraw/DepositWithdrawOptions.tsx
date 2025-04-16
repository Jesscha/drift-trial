import React from "react";
import {
  TransactionMode,
  useDepositWithdrawStore,
} from "@/app/stores/depositWithdrawStore";
import { useDepositWithdrawData } from "@/app/hooks/deposit-withdraw";

export const DepositWithdrawOptions = () => {
  const { mode, reduceOnly, setReduceOnly } = useDepositWithdrawStore();
  const { isWithdrawalLimited } = useDepositWithdrawData();

  // Only show options for withdraw mode
  if (mode !== TransactionMode.WITHDRAW) return null;

  return (
    <div className="flex flex-col">
      {/* Reduce Only checkbox */}
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="reduce-only"
          checked={reduceOnly}
          onChange={(e) => setReduceOnly(e.target.checked)}
          className="w-4 h-4 text-purple-50 border-neutrals-40 rounded"
        />
        <label
          htmlFor="reduce-only"
          className="ml-2 text-xs font-medium text-neutrals-80 dark:text-neutrals-20"
        >
          Reduce Only
        </label>
      </div>

      {/* Show warning when withdrawal limit is active */}
      {isWithdrawalLimited && (
        <div className="text-xs text-amber-500 bg-amber-900/10 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-2 rounded-lg mb-2 flex items-start">
          <svg
            className="h-3 w-3 text-amber-500 mr-1 mt-0.5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Withdrawal limited by portfolio health constraints.{" "}
            {!reduceOnly && "Enable 'Reduce Only' for safer withdrawals."}
          </span>
        </div>
      )}
    </div>
  );
};
