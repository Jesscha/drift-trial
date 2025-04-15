import React from "react";
import { PercentageSlider } from "@/app/components/PercentageSlider";
import {
  useDepositWithdrawData,
  useDepositWithdrawForm,
  useDepositWithdrawTransaction,
} from "@/app/hooks/deposit-withdraw";

export const PercentageSelector = () => {
  // Get data from the data hook
  const { maxAmount } = useDepositWithdrawData();

  // Get form handlers from the form hook
  const { percentage, handlePercentageChange } = useDepositWithdrawForm();

  // Get transaction state from the transaction hook
  const { isLoading, orderSubmitted } = useDepositWithdrawTransaction();

  const disabled = isLoading || orderSubmitted;

  return (
    <PercentageSlider
      percentage={percentage}
      onChange={handlePercentageChange}
      sliderHeight="sm"
      className="mb-2"
      disabled={disabled || maxAmount <= 0}
    />
  );
};
