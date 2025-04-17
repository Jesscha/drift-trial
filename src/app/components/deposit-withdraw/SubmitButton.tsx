import React from "react";
import { getButtonText } from "../modal/DepositWithdrawModal.util";
import { useDepositWithdrawStore } from "@/app/stores/depositWithdrawStore";
import {
  useDepositWithdrawTransaction,
  useDepositWithdrawForm,
} from "@/app/hooks/deposit-withdraw";

export const SubmitButton = () => {
  const { mode } = useDepositWithdrawStore();
  const { isValidAmount } = useDepositWithdrawForm();
  const { handleSubmit, txStatus, isLoading, orderSubmitted } =
    useDepositWithdrawTransaction({
      onClose: () => {}, // This will be handled in the hook
    });

  const buttonText = getButtonText(isLoading, orderSubmitted, txStatus, mode);
  const isDisabled = isLoading || orderSubmitted || !isValidAmount;

  return (
    <button
      onClick={(e) => handleSubmit(e)}
      className={`w-full py-3 text-sm font-semibold text-white rounded-lg transition-colors ${
        isDisabled
          ? "bg-neutrals-20 cursor-not-allowed"
          : "bg-purple-50 hover:bg-purple-60"
      }`}
      disabled={isDisabled}
    >
      {buttonText}
    </button>
  );
};
