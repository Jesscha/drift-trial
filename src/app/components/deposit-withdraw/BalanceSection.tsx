import React from "react";
import { useDepositWithdrawData } from "@/app/hooks/deposit-withdraw";
import { useDepositWithdrawStore } from "@/app/stores/depositWithdrawStore";

export const BalanceSection = () => {
  const { tokenSelectionInfo } = useDepositWithdrawStore();
  const { maxAmount, accountNetValue } = useDepositWithdrawData();

  return (
    <div className="bg-neutrals-5 dark:bg-neutrals-90 rounded-lg p-3 space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <span className="text-neutrals-60 dark:text-neutrals-40">
          Asset Balance
        </span>
        <span>
          {maxAmount.toFixed(6)} {tokenSelectionInfo.symbol}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-neutrals-60 dark:text-neutrals-40">
          Net Account Balance (USD)
        </span>
        <span>${accountNetValue.toFixed(2)}</span>
      </div>
    </div>
  );
};
