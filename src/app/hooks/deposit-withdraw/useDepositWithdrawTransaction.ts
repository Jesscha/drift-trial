import { useEffect } from "react";
import {
  TransactionMode,
  useDepositWithdrawStore,
} from "@/app/stores/depositWithdrawStore";
import { deposit } from "@/services/drift/deposit";
import { withdraw } from "@/services/drift/withdraw";
import { useTransactions } from "@/app/hooks/useTransactions";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { useActiveAccount } from "@/app/providers/ActiveAccountProvider";

interface UseDepositWithdrawTransactionParams {
  onClose?: () => void;
  onTxStart?: () => void;
  onTxComplete?: () => void;
}

/**
 * Hook for handling deposit/withdraw transactions
 * Responsible for:
 * - Transaction submission
 * - Transaction status tracking
 * - Error handling
 * - Success callbacks
 */
export const useDepositWithdrawTransaction = ({
  onClose,
  onTxStart,
  onTxComplete,
}: UseDepositWithdrawTransactionParams = {}) => {
  const {
    mode,
    amount,
    selectedMarketIndex,
    reduceOnly,
    tokenSelectionInfo,
    isLoading,
    error,
    orderSubmitted,
    setIsLoading,
    setError,
    setOrderSubmitted,
    setTxSignature,
    resetState,
    txSignature,
  } = useDepositWithdrawStore();

  const { activeAccountId } = useActiveAccount();
  const { trackTransaction, transactions } = useTransactions();

  // Get transaction status if we have a signature
  const txStatus = txSignature
    ? transactions.find((tx) => tx.signature === txSignature)
    : null;

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const numericAmount = parseFloat(amount);

    setIsLoading(true);
    setError(null);
    setOrderSubmitted(true);

    // Notify parent about transaction start
    onTxStart?.();

    try {
      let signature: string | undefined;

      if (mode === TransactionMode.DEPOSIT) {
        const result = await deposit({
          amount: numericAmount,
          marketIndex: selectedMarketIndex,
          subAccountId: activeAccountId,
        });

        signature = extractSignature(result);
      } else {
        const result = await withdraw({
          amount: numericAmount,
          marketIndex: selectedMarketIndex,
          reduceOnly,
          subAccountId: activeAccountId,
        });

        signature = extractSignature(result);
      }

      // Track the transaction if we got a signature
      if (signature) {
        const actionDesc =
          mode === TransactionMode.DEPOSIT
            ? `Deposit ${numericAmount} ${tokenSelectionInfo.symbol} to subaccount ${activeAccountId}`
            : `Withdraw ${numericAmount} ${tokenSelectionInfo.symbol} from subaccount ${activeAccountId}`;

        trackTransaction(signature, actionDesc, [
          { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
          { type: TransactionSuccessActionType.REFRESH_ALL },
        ]);

        setTxSignature(signature);
      } else {
        setOrderSubmitted(false);
        setError("Transaction failed - no signature returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setOrderSubmitted(false);
    } finally {
      setIsLoading(false);
      onTxComplete?.();
    }
  };

  // Helper function to extract signature from different response formats
  const extractSignature = (result: any): string | undefined => {
    if (!result) return undefined;

    if (typeof result === "string") {
      return result;
    } else if (typeof result === "object") {
      return result.signature || result.txid || result.txSignature || undefined;
    }

    return undefined;
  };

  // Close modal when transaction is confirmed
  useEffect(() => {
    if (txStatus?.status === "confirmed") {
      // Wait a moment to show the confirmation before closing
      const timer = setTimeout(() => {
        onClose?.();
        // Reset state
        resetState();
      }, 2000);
      return () => clearTimeout(timer);
    }

    // If transaction failed, allow resubmitting
    if (txStatus?.status === "failed") {
      setOrderSubmitted(false);
    }
  }, [txStatus, onClose, resetState, setOrderSubmitted]);

  return {
    // Transaction state
    isLoading,
    error,
    orderSubmitted,
    txStatus,

    // Transaction action
    handleSubmit,
  };
};
