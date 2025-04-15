import React from "react";
import { TokenDropdown } from "./TokenDropdown";
import {
  useDepositWithdrawStore,
  TransactionMode,
} from "@/app/stores/depositWithdrawStore";
import {
  useDepositWithdrawData,
  useDepositWithdrawForm,
  useDepositWithdrawTransaction,
} from "@/app/hooks/deposit-withdraw";
import { useActiveAccount } from "@/app/providers/ActiveAccountProvider";

export const AmountInput = () => {
  const { mode, tokenSelectionInfo } = useDepositWithdrawStore();

  const { activeAccountId } = useActiveAccount();

  // Data-related hooks
  const { maxAmount, subaccountTokenBalances, currentTokenMint, tokenOptions } =
    useDepositWithdrawData();

  // Form-related hooks
  const {
    amount,
    setAmount,
    handleTokenChange,
    handleMaxBalance,
    getWalletBalanceInfo,
  } = useDepositWithdrawForm();

  // Transaction-related hooks
  const { isLoading, orderSubmitted } = useDepositWithdrawTransaction();

  const disabled = isLoading || orderSubmitted;
  const balanceInfo = getWalletBalanceInfo();

  return (
    <div>
      <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1.5">
        Amount
      </div>
      <div className="flex mb-3">
        {/* Token selector dropdown */}
        <TokenDropdown
          tokenSymbol={tokenSelectionInfo.symbol}
          tokenOptions={tokenOptions}
          onTokenChange={handleTokenChange}
          disabled={disabled}
          mode={mode}
          subaccountTokenBalances={subaccountTokenBalances}
          selectedSubaccountId={activeAccountId}
          currentTokenMint={tokenSelectionInfo.mint}
        />

        {/* Input field */}
        <div className="flex-1 relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-r-lg">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.000001"
            placeholder="0.000000"
            className="w-full h-full py-2 px-2 bg-transparent text-sm text-neutrals-100 dark:text-white focus:outline-none focus:border-purple-50"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Wallet balance */}
      <div className="flex justify-between items-center text-xs mb-2">
        <div className="flex items-center">
          <span className="text-neutrals-80 dark:text-neutrals-30">
            {mode === TransactionMode.DEPOSIT
              ? "Wallet balance"
              : "Available to withdraw"}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium flex items-center">
            <span>{balanceInfo.text}</span>
            {balanceInfo.dollarValue && (
              <span className="text-xs text-neutrals-60 dark:text-neutrals-40 ml-1">
                (${balanceInfo.dollarValue})
              </span>
            )}
          </span>
          <button
            onClick={handleMaxBalance}
            className="ml-1 text-xs text-purple-50 font-medium hover:opacity-80"
            disabled={mode === TransactionMode.WITHDRAW && maxAmount <= 0}
          >
            MAX
          </button>
        </div>
      </div>
    </div>
  );
};
