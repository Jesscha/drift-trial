import { useMemo } from "react";
import {
  useDepositWithdrawStore,
  TransactionMode,
  TokenSelectionInfo,
} from "@/app/stores/depositWithdrawStore";
import { useDepositWithdrawData } from "./useDepositWithdrawData";

/**
 * Hook for managing the form state and user interactions in the deposit/withdraw UI
 * Responsible for:
 * - Amount input handling
 * - Percentage selection
 * - Token selection
 * - Validation
 */
export const useDepositWithdrawForm = () => {
  const {
    mode,
    amount,
    tokenSelectionInfo,
    setAmount,
    setTokenSelectionInfo,
    setSelectedMarketIndex,
    resetAmount,
  } = useDepositWithdrawStore();

  const { maxAmount, currentWalletTokenBalance, tokenOptions } =
    useDepositWithdrawData();

  // Calculate percentage based on amount and max available
  const percentage = useMemo(() => {
    const maxForPercentage =
      mode === TransactionMode.DEPOSIT ? currentWalletTokenBalance : maxAmount;

    if (maxForPercentage <= 0 || !amount || parseFloat(amount) <= 0) return 0;

    const percentage = (parseFloat(amount) / maxForPercentage) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
  }, [amount, mode, currentWalletTokenBalance, maxAmount]);

  // Calculate amount based on percentage
  const calculateAmount = (percentage: number, maxValue: number): string => {
    if (percentage <= 0 || maxValue <= 0) return "0";
    if (percentage >= 100) return maxValue.toFixed(6);

    const calculatedAmount = (percentage / 100) * maxValue;
    return calculatedAmount.toFixed(6);
  };

  // Handle percentage slider/button changes
  const handlePercentageChange = (newPercentage: number) => {
    const maxForAmount =
      mode === TransactionMode.DEPOSIT ? currentWalletTokenBalance : maxAmount;
    setAmount(calculateAmount(newPercentage, maxForAmount));
  };

  // Handle max balance button click
  const handleMaxBalance = () => {
    if (mode === TransactionMode.DEPOSIT && currentWalletTokenBalance > 0) {
      setAmount(currentWalletTokenBalance.toFixed(6));
    } else if (mode === TransactionMode.WITHDRAW && maxAmount > 0) {
      setAmount(maxAmount.toFixed(6));
    }
  };

  // Handle token selection change
  const handleTokenChange = (value: string | number) => {
    const marketIndex = Number(value);
    const selectedOption = tokenOptions.find(
      (option) => Number(option.value) === marketIndex
    );

    if (selectedOption) {
      const tokenSymbol = selectedOption.label;
      const newTokenSelectionInfo: TokenSelectionInfo = {
        symbol: tokenSymbol,
        mint: selectedOption.mint,
      };

      setTokenSelectionInfo(newTokenSelectionInfo);
      setSelectedMarketIndex(marketIndex);
      resetAmount();
    }
  };

  // Get wallet balance info for display
  const getWalletBalanceInfo = () => {
    if (mode === TransactionMode.DEPOSIT) {
      // For deposit mode, show wallet balance
      const tokenOption = tokenOptions.find(
        (t) => t.mint === tokenSelectionInfo.mint
      );

      if (tokenOption && "balanceFormatted" in tokenOption) {
        return {
          text: `${tokenOption.balanceFormatted} ${tokenSelectionInfo.symbol}`,
          dollarValue:
            tokenOption.dollarValue > 0
              ? tokenOption.dollarValue.toFixed(2)
              : null,
        };
      }

      return {
        text: `${currentWalletTokenBalance.toFixed(6)} ${
          tokenSelectionInfo.symbol
        }`,
        dollarValue: null,
      };
    } else {
      // For withdraw mode, show the max amount available
      return {
        text: `${maxAmount.toFixed(6)} ${tokenSelectionInfo.symbol}`,
        dollarValue: null,
      };
    }
  };

  // Validate if the form can be submitted
  const isValidAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return false;
    }

    const numericAmount = parseFloat(amount);

    if (mode === TransactionMode.DEPOSIT) {
      return numericAmount <= currentWalletTokenBalance;
    } else {
      return numericAmount <= maxAmount;
    }
  }, [amount, mode, currentWalletTokenBalance, maxAmount]);

  return {
    // Form state
    amount,
    percentage,

    // Form handlers
    handleTokenChange,
    handlePercentageChange,
    handleMaxBalance,
    setAmount,

    // Display helpers
    getWalletBalanceInfo,
    isValidAmount,
  };
};
