import { TransactionInfo } from "@/services/txTracker/txTracker";

/**
 * Format a numeric value with dollar sign if needed
 */
export const formatValue = (
  value: number | undefined,
  withDollarSign = false
): string => {
  if (value === undefined) return "N/A";

  const formattedValue = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return withDollarSign ? `$${formattedValue}` : formattedValue;
};

/**
 * Calculate percentage for the slider based on amount and max value
 */
export const calculatePercentage = (
  amount: string,
  maxAmount: number
): number => {
  if (!amount) return 0;
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) return 0;

  return maxAmount > 0 ? Math.min((amountNum / maxAmount) * 100, 100) : 0;
};

/**
 * Calculate amount based on percentage of max amount
 */
export const calculateAmount = (
  percentage: number,
  maxAmount: number
): string => {
  if (maxAmount <= 0) return "0.000000";
  return ((maxAmount * percentage) / 100).toFixed(6);
};

/**
 * Get button text based on transaction status
 */
export const getButtonText = (
  isLoading: boolean,
  orderSubmitted: boolean,
  txStatus: TransactionInfo | null | undefined,
  mode: string
) => {
  if (isLoading || orderSubmitted) {
    if (txStatus) {
      if (txStatus.status === "processing") return "Processing...";
      if (txStatus.status === "confirmed")
        return `${mode === "deposit" ? "Deposit" : "Withdrawal"} Confirmed!`;
      if (txStatus.status === "failed")
        return `${mode === "deposit" ? "Deposit" : "Withdrawal"} Failed`;
    }
    return "Submitting...";
  }
  return `Confirm ${mode === "deposit" ? "Deposit" : "Withdraw"}`;
};
