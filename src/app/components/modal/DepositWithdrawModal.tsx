import React, { useEffect } from "react";
import { Modal } from "./Modal";
import {
  TransactionMode,
  useDepositWithdrawStore,
} from "@/app/stores/depositWithdrawStore";
import {
  ModalTabs,
  AmountInput,
  PercentageSelector,
  BalanceSection,
  SubmitButton,
  TransactionError,
} from "@/app/components/deposit-withdraw";
import { useDepositWithdrawData } from "@/app/hooks/deposit-withdraw";
import { CustomDropdown } from "@/app/components/CustomDropdown";
import { useActiveAccount } from "@/app/providers/ActiveAccountProvider";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "deposit" | "withdraw";
  marketIndex?: number;
  initialSubaccountId?: number;
  onTxStart?: () => void;
  onTxComplete?: () => void;
  walletBalance?: number;
}

export function DepositWithdrawModal({
  isOpen,
  onClose,
  initialMode = "deposit",
  marketIndex = 0,
  initialSubaccountId = 0,
}: DepositWithdrawModalProps) {
  const { initializeState, mode, tokenSelectionInfo, selectedMarketIndex } =
    useDepositWithdrawStore();

  const { activeAccountId, switchActiveAccount } = useActiveAccount();

  // Get data using the new data hook
  const { subaccountOptions, tokenOptions, subaccountTokenBalances } =
    useDepositWithdrawData();

  // Initialize state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      initializeState(
        initialMode === "deposit"
          ? TransactionMode.DEPOSIT
          : TransactionMode.WITHDRAW,
        marketIndex,
        initialSubaccountId
      );
    }
  }, [isOpen, initialMode, marketIndex, initialSubaccountId, initializeState]);

  // Handle subaccount selection
  const handleSubaccountChange = (value: string | number) => {
    const newSubaccountId = Number(value);
    switchActiveAccount(newSubaccountId);
  };

  // Check if any subaccount has the selected token for the current market index
  const hasTokenInSubaccounts = subaccountTokenBalances.some(
    (info) => info.tokenBalance > 0 && info.marketIndex === selectedMarketIndex
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 w-[400px]">
        <ModalTabs />

        {mode === TransactionMode.WITHDRAW && !hasTokenInSubaccounts && (
          <div className="text-xs text-orange-500 bg-orange-900/10 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-2 rounded-lg mb-1">
            You don't have any {tokenSelectionInfo.symbol} in your subaccounts.
            Select another token or deposit first.
          </div>
        )}

        <CustomDropdown
          label={
            mode === TransactionMode.DEPOSIT ? "Deposit to" : "Withdraw from"
          }
          options={subaccountOptions}
          value={activeAccountId}
          onChange={handleSubaccountChange}
          placeholder="Select subaccount..."
        />

        <AmountInput />

        <PercentageSelector />

        <BalanceSection />

        <TransactionError />

        <SubmitButton />
      </div>
    </Modal>
  );
}
