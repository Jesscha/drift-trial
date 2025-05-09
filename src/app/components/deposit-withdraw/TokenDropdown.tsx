import React, { useRef, useEffect, useState } from "react";
import { getTokenIconUrl } from "@/utils/assets";
import { DropdownOption } from "../CustomDropdown";
import { TransactionMode } from "@/app/stores/depositWithdrawStore";
import { ChevronDownSmallIcon, CheckIcon } from "../../assets/icons";

interface TokenDropdownProps {
  tokenSymbol: string; // This is the symbol of the token from tokenSelectionInfo.symbol
  tokenOptions: DropdownOption[];
  onTokenChange: (value: string | number, option: DropdownOption) => void;
  disabled?: boolean;
  mode: TransactionMode;
  subaccountTokenBalances?: {
    subaccountId: number;
    marketIndex: number;
    tokenBalance: number;
    tokenSymbol: string;
    mint: string;
    formattedBalance: string;
  }[];
  selectedSubaccountId?: number;
  currentTokenMint?: string | null;
}

// Extended DropdownOption for tokens with balance info
interface TokenOption extends DropdownOption {
  balance?: number;
  balanceFormatted?: string;
  dollarValue?: number;
}

export const TokenDropdown = ({
  tokenSymbol: token,
  tokenOptions,
  onTokenChange,
  disabled = false,
  mode,
  subaccountTokenBalances = [],
  selectedSubaccountId,
  currentTokenMint,
}: TokenDropdownProps) => {
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);

  // Find the current token option that matches the current token symbol or mint
  const currentTokenOption = tokenOptions.find((option) => {
    // If we have currentTokenMint, use it for exact matching
    if (currentTokenMint && option.mint === currentTokenMint) {
      return true;
    }

    // Fall back to label matching
    const optionLabel =
      typeof option.label === "string" ? option.label : String(option.label);
    return optionLabel === token;
  });

  // Close token dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tokenDropdownRef.current &&
        !tokenDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTokenDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
        className="h-full bg-neutrals-10 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-l-lg px-3 py-2 flex items-center text-sm font-medium"
        disabled={disabled}
      >
        <img
          src={getTokenIconUrl(token)}
          alt={token}
          className="w-4 h-4 mr-1.5 rounded-full"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src =
              "https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/unknown.svg";
          }}
        />
        <span>{token}</span>
        <div className="ml-1.5 relative w-4 h-4">
          <ChevronDownSmallIcon
            size="sm"
            className={`text-neutrals-60 dark:text-neutrals-40 transition-transform ${
              isTokenDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isTokenDropdownOpen && (
        <div
          className="absolute left-0 mt-1 z-10 w-52 bg-white dark:bg-neutrals-90 border border-neutrals-20 dark:border-neutrals-70 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          ref={tokenDropdownRef}
        >
          {tokenOptions.map((option) => {
            // Get the token symbol from the option label
            const optionToken =
              typeof option.label === "string"
                ? option.label
                : (option.label as unknown as string).toString();

            // Using mint to determine if selected, with fallback to label comparison
            const isSelected = currentTokenOption
              ? option.mint === currentTokenOption.mint
              : token === optionToken;

            const marketIndex = Number(option.value);

            // Get wallet balance if in deposit mode
            const walletTokenBalance = option as TokenOption;

            // Get subaccount balance if in withdraw mode
            let subaccountBalance = null;

            if (
              mode === TransactionMode.WITHDRAW &&
              selectedSubaccountId !== undefined &&
              subaccountTokenBalances.length > 0
            ) {
              // Find token balance for the selected subaccount and this market index
              subaccountBalance = subaccountTokenBalances.find(
                (balance) =>
                  balance.marketIndex === marketIndex &&
                  balance.subaccountId === selectedSubaccountId
              );
            }

            return (
              <button
                key={option.value}
                onClick={() => {
                  onTokenChange(option.value, option);
                  setIsTokenDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center hover:bg-neutrals-10 dark:hover:bg-neutrals-80 ${
                  isSelected
                    ? "bg-neutrals-10 dark:bg-neutrals-80 font-medium"
                    : ""
                }`}
              >
                {option.icon && (
                  <img
                    src={option.icon}
                    alt={optionToken}
                    className="w-4 h-4 mr-2 rounded-full"
                  />
                )}
                <div className="flex flex-col mr-auto">
                  <span className="text-sm">{optionToken}</span>

                  {/* Show appropriate balance based on mode */}
                  {mode === TransactionMode.DEPOSIT &&
                    walletTokenBalance &&
                    walletTokenBalance.balance &&
                    walletTokenBalance.balance > 0 && (
                      <span className="text-xs text-neutrals-60 dark:text-neutrals-40">
                        {walletTokenBalance.balanceFormatted}
                        {walletTokenBalance.dollarValue &&
                          walletTokenBalance.dollarValue > 0 &&
                          ` ($${walletTokenBalance.dollarValue.toFixed(2)})`}
                      </span>
                    )}

                  {mode === TransactionMode.WITHDRAW &&
                    subaccountBalance &&
                    subaccountBalance.tokenBalance > 0 && (
                      <span className="text-xs text-neutrals-60 dark:text-neutrals-40">
                        {subaccountBalance.formattedBalance}
                      </span>
                    )}
                </div>
                {isSelected && (
                  <div className="ml-auto relative w-4 h-4">
                    <CheckIcon size="sm" className="text-purple-50" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
