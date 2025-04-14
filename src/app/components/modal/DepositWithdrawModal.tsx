import React, { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { deposit } from "@/services/drift/deposit";
import { withdraw } from "@/services/drift/withdraw";
import { useTransactions } from "@/app/hooks/useTransactions";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import {
  useParsedUserData,
  ParsedSubaccountData,
} from "@/app/hooks/useParsedUserData";
import { PercentageSlider } from "@/app/components/PercentageSlider";
import { useSpotMarketAccounts } from "@/app/hooks/useSpotMarketAccounts";
import { useDriftClient } from "@/app/hooks/useDriftClient";
import {
  CustomDropdown,
  DropdownOption,
} from "@/app/components/CustomDropdown";
import { useWalletTokenBalances } from "@/app/hooks/useWalletTokenBalances";
import { useActiveAccount } from "@/app/hooks/useActiveAccount";
import { BN } from "@drift-labs/sdk";

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
  onTxStart,
  onTxComplete,
  walletBalance = 0,
}: DepositWithdrawModalProps) {
  const { subaccounts, isLoading: isLoadingSubaccounts } = useParsedUserData();
  const { activeAccount } = useActiveAccount();
  const [selectedSubaccountId, setSelectedSubaccountId] =
    useState<number>(initialSubaccountId);
  const [mode, setMode] = useState<"deposit" | "withdraw">(initialMode);
  const [amount, setAmount] = useState<string>("");
  const [reduceOnly, setReduceOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackTransaction } = useTransactions();
  const [token, setToken] = useState<string>("USDC");
  const [selectedMarketIndex, setSelectedMarketIndex] =
    useState<number>(marketIndex);
  const { marketsList, isLoading: isLoadingMarkets } = useSpotMarketAccounts();
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);

  // State for transaction tracking
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const { tokenBalances } = useWalletTokenBalances();

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

  // Set default token when marketsList is loaded - ONLY on first load
  useEffect(() => {
    // This should run only once when marketsList is loaded
    if (
      marketsList.length > 0 &&
      token === "USDC" &&
      selectedMarketIndex === marketIndex
    ) {
      const defaultMarket = marketsList.find(
        (market) => market.marketIndex === marketIndex
      );
      if (defaultMarket) {
        const tokenSymbol =
          defaultMarket.metadata.baseAssetSymbol ||
          defaultMarket.name ||
          "USDC";
        setToken(tokenSymbol);
        setSelectedMarketIndex(defaultMarket.marketIndex);
      }
    }
  }, [marketsList, marketIndex, selectedMarketIndex, token]);

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Update selected subaccount when initialSubaccountId prop changes or modal opens
  useEffect(() => {
    setSelectedSubaccountId(initialSubaccountId);
    // Reset amount and error when modal opens with a different subaccount
    setAmount("");
    setError(null);
  }, [initialSubaccountId, isOpen]);

  // Find the currently selected subaccount data
  const selectedSubaccount = subaccounts?.find(
    (acc) => acc.subaccountId === selectedSubaccountId
  );

  // Function to get token balances in each subaccount
  const getSubaccountTokenBalances = React.useMemo(() => {
    console.log("getSubaccountTokenBalances", subaccounts, selectedMarketIndex);
    if (!subaccounts || (!selectedMarketIndex && selectedMarketIndex !== 0))
      return [];

    return subaccounts.map((subaccount) => {
      // Access the raw user account to get spot positions
      const rawAccount = subaccount.rawUserAccount;

      // Try to find the spot position for the selected token
      const spotPosition = rawAccount.spotPositions.find(
        (position) => position.marketIndex === selectedMarketIndex
      );

      console.log(
        "spotPosition",
        spotPosition?.marketIndex,
        spotPosition?.scaledBalance.toString()
      );

      let tokenBalance = 0;

      if (spotPosition && !spotPosition.scaledBalance.isZero()) {
        // Convert scaled balance to actual token amount
        // This depends on how the specific token's balance is represented
        const scaledBalance = spotPosition.scaledBalance;
        const marketAccount = marketsList.find(
          (m) => m.marketIndex === selectedMarketIndex
        );
        const decimals = marketAccount?.metadata.decimals || 6;

        // Convert the BN to a number with appropriate decimal scaling
        tokenBalance =
          parseFloat(scaledBalance.toString()) / Math.pow(10, decimals);
      }

      return {
        subaccountId: subaccount.subaccountId,
        tokenBalance,
        tokenSymbol: token,
        formattedBalance: tokenBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        }),
      };
    });
  }, [subaccounts, selectedMarketIndex, token, marketsList]);

  // Sort subaccounts by token balance for better UX
  const sortedSubaccountTokenBalances = React.useMemo(() => {
    return [...getSubaccountTokenBalances].sort(
      (a, b) => b.tokenBalance - a.tokenBalance
    );
  }, [getSubaccountTokenBalances]);

  // Update max withdraw amount calculation to use User.getWithdrawalLimit
  const maxAmount = React.useMemo(() => {
    if (mode === "withdraw" && selectedSubaccountId !== undefined) {
      // First check if we have the raw token balance
      const subaccountTokenInfo = getSubaccountTokenBalances.find(
        (info) => info.subaccountId === selectedSubaccountId
      );

      // Get the withdrawal limit from the User class if activeAccount is available
      if (activeAccount?.user && selectedMarketIndex !== undefined) {
        try {
          // Get the withdrawal limit using the SDK method
          const withdrawalLimit = activeAccount.user.getWithdrawalLimit(
            selectedMarketIndex,
            true
          );

          console.log(
            "withdrawalLimit",
            withdrawalLimit.toString(),
            selectedMarketIndex,
            reduceOnly
          );

          // Get the market for decimal conversion
          const marketAccount = marketsList.find(
            (m) => m.marketIndex === selectedMarketIndex
          );
          const decimals = marketAccount?.metadata.decimals || 6;

          // Convert BN to number with appropriate decimal precision
          const withdrawalLimitNumber =
            parseFloat(withdrawalLimit.toString()) / Math.pow(10, decimals);

          // Compare with token balance and return the smallest value
          const userTokenBalance = subaccountTokenInfo?.tokenBalance || 0;

          // Return the minimum of user's balance and the calculated withdrawal limit
          return Math.min(userTokenBalance, withdrawalLimitNumber);
        } catch (err) {
          console.error("Error calculating withdrawal limit:", err);
          // Fall back to basic balance if there's an error
          return subaccountTokenInfo?.tokenBalance || 0;
        }
      }

      // If activeAccount is not available, fall back to the basic token balance
      return subaccountTokenInfo?.tokenBalance || 0;
    } else if (selectedSubaccount?.depositAmount) {
      return parseFloat(selectedSubaccount.depositAmount.toString()) / 1e6;
    }
    return 0;
  }, [
    mode,
    selectedSubaccountId,
    getSubaccountTokenBalances,
    selectedSubaccount,
    activeAccount,
    selectedMarketIndex,
    reduceOnly,
    marketsList,
  ]);

  // Get asset balance from selected subaccount
  const assetBalance = maxAmount;

  // Get account net value from selected subaccount
  const accountNetValue = selectedSubaccount?.netTotal
    ? parseFloat(selectedSubaccount.netTotal.toString()) / 1e6
    : 0;

  // Default APR value (this could be fetched from an API or passed as prop)
  const assetYield = 4.21;

  // Enhance the subaccount dropdown options with token balance info
  const subaccountOptions: DropdownOption[] = React.useMemo(() => {
    if (!subaccounts || subaccounts.length === 0) return [];

    return subaccounts.map((acc) => {
      let label = `Subaccount #${acc.subaccountId}`;
      let description = `${formatValue(acc.netTotal / 1e6, true)} Net Value`;

      // Add token balance info if in withdraw mode
      if (mode === "withdraw") {
        const tokenInfo = getSubaccountTokenBalances.find(
          (info) => info.subaccountId === acc.subaccountId
        );

        if (tokenInfo && tokenInfo.tokenBalance > 0) {
          description = `${tokenInfo.formattedBalance} ${token} - ${description}`;
        } else {
          description = `No ${token} - ${description}`;
        }
      }

      return {
        value: acc.subaccountId,
        label,
        description,
        hasToken:
          mode === "withdraw"
            ? getSubaccountTokenBalances.find(
                (info) => info.subaccountId === acc.subaccountId
              )?.tokenBalance > 0
            : true,
      };
    });
  }, [subaccounts, mode, getSubaccountTokenBalances, token]);

  // Handle subaccount selection
  const handleSubaccountChange = (value: string | number) => {
    const newSubaccountId = Number(value);
    setSelectedSubaccountId(newSubaccountId);

    // Reset amount and error when changing subaccounts
    setAmount("");
    setError(null);
  };

  // Get token icon URL with special case for BONK
  const getTokenIconUrl = (tokenSymbol: string | undefined) => {
    // Handle undefined or empty token symbol
    if (!tokenSymbol)
      return "https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/unknown.svg";

    // Convert token symbol to lowercase and trim
    const symbol = tokenSymbol.toLowerCase().trim();

    // Special case for BONK token
    if (symbol === "bonk") {
      return "https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/bonk.webp";
    }

    // Default case for all other tokens
    return `https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/${symbol}.svg`;
  };

  // Convert spot market data to dropdown options
  const tokenOptions: DropdownOption[] = React.useMemo(() => {
    if (!marketsList || marketsList.length === 0) return [];

    // Create options from market list, filtering out USDC-1 and JLP-1

    // Filter out duplicate mints by taking the first occurrence of each mint
    const uniqueMarkets = marketsList.reduce((acc, market) => {
      // Check if we already have a market with this mint
      const existingMarket = acc.find((m) => m.mint === market.mint);
      if (!existingMarket) {
        acc.push(market);
      }
      return acc;
    }, [] as typeof marketsList);

    const baseOptions = uniqueMarkets.map((market) => ({
      value: market.marketIndex,
      label: market.metadata.baseAssetSymbol || market.name,
      mint: market.mint,
      icon: getTokenIconUrl(market.metadata.baseAssetSymbol || market.name),
      dollarValue: 0, // Default value to be updated if we have wallet data
    }));

    // If we have token balances from wallet, prioritize tokens that the user has
    if (tokenBalances && tokenBalances.length > 0) {
      // First enrich options with dollar values from wallet balances
      const enrichedOptions = baseOptions.map((option) => {
        const matchingToken = tokenBalances.find(
          (token) => token.tokenMint === option.mint
        );

        return {
          ...option,
          mint: matchingToken?.tokenMint || "",
          dollarValue: matchingToken?.dollarValue || 0,
          balance: matchingToken?.balance || 0,
          balanceFormatted: matchingToken?.balanceFormatted || "0",
        };
      });

      return enrichedOptions.sort((a, b) => b.dollarValue - a.dollarValue);
    }

    return baseOptions;
  }, [marketsList, tokenBalances]);

  // Handle token selection
  const handleTokenChange = (
    value: string | number,
    option: DropdownOption
  ) => {
    const marketIndex = Number(value);
    const selectedMarket = marketsList.find(
      (market) => market.marketIndex === marketIndex
    );

    if (selectedMarket) {
      const tokenSymbol =
        selectedMarket.metadata.baseAssetSymbol ||
        selectedMarket.name ||
        "USDC";
      setToken(tokenSymbol);
      setSelectedMarketIndex(marketIndex);
    }

    // Reset amount and error when changing tokens
    setAmount("");
    setError(null);
  };

  // Find current wallet balance for selected token
  const currentWalletTokenBalance = React.useMemo(() => {
    if (!tokenBalances || tokenBalances.length === 0) return walletBalance;

    const tokenInfo = tokenBalances.find(
      (t) => t.symbol.toLowerCase() === token.toLowerCase()
    );

    return tokenInfo ? tokenInfo.balance : walletBalance;
  }, [tokenBalances, token, walletBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      if (mode === "deposit") {
        const result = await deposit({
          amount: numericAmount,
          marketIndex: selectedMarketIndex,
          subAccountId: selectedSubaccountId,
        });

        // Handle different possible response formats
        if (result) {
          if (typeof result === "string") {
            signature = result;
          } else if (typeof result === "object") {
            // Try to extract signature from various formats
            signature =
              (result as any).signature ||
              (result as any).txid ||
              (result as any).txSignature ||
              undefined;
          }
        }
      } else {
        const result = await withdraw({
          amount: numericAmount,
          marketIndex: selectedMarketIndex,
          reduceOnly,
          subAccountId: selectedSubaccountId,
        });

        // Handle different possible response formats
        if (result) {
          if (typeof result === "string") {
            signature = result;
          } else if (typeof result === "object") {
            // Try to extract signature from various formats
            signature =
              (result as any).signature ||
              (result as any).txid ||
              (result as any).txSignature ||
              undefined;
          }
        }
      }

      // Track the transaction if we got a signature
      if (signature) {
        const actionDesc =
          mode === "deposit"
            ? `Deposit ${numericAmount} ${token} to subaccount ${selectedSubaccountId}`
            : `Withdraw ${numericAmount} ${token} from subaccount ${selectedSubaccountId}`;

        trackTransaction(signature, actionDesc, [
          { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
          { type: TransactionSuccessActionType.REFRESH_ALL },
        ]);

        setTxSignature(signature);
      } else {
        setOrderSubmitted(false);
      }

      // Reset form on success
      setAmount("");
      // onClose will be handled by useEffect when transaction is confirmed
    } catch (err) {
      console.error("Transaction failed:", err);
      setError(err instanceof Error ? err.message : "Transaction failed");
      setOrderSubmitted(false);
      // Notify parent that transaction is complete (even if it failed)
      onTxComplete?.();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle 50% button click
  const handleHalfBalance = () => {
    if (mode === "deposit" && currentWalletTokenBalance > 0) {
      setAmount((currentWalletTokenBalance / 2).toFixed(6));
    } else if (mode === "withdraw" && maxAmount > 0) {
      setAmount((maxAmount / 2).toFixed(6));
    }
  };

  // Function to handle MAX button click
  const handleMaxBalance = () => {
    if (mode === "deposit" && currentWalletTokenBalance > 0) {
      setAmount(currentWalletTokenBalance.toFixed(6));
    } else if (mode === "withdraw" && maxAmount > 0) {
      setAmount(maxAmount.toFixed(6));
    }
  };

  // Close modal when transaction is confirmed
  const { transactions } = useTransactions();

  // Get transaction status if we have a signature
  const txStatus = React.useMemo(() => {
    if (!txSignature) return null;
    return transactions.find((tx) => tx.signature === txSignature);
  }, [txSignature, transactions]);

  // Close modal when transaction is confirmed
  useEffect(() => {
    if (txStatus?.status === "confirmed") {
      // Wait a moment to show the confirmation before closing
      const timer = setTimeout(() => {
        onClose();
        // Reset state
        setOrderSubmitted(false);
        setTxSignature(null);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // If transaction failed, allow resubmitting
    if (txStatus?.status === "failed") {
      setOrderSubmitted(false);
    }
  }, [txStatus, onClose]);

  // Function to get button text based on transaction status
  const getButtonText = () => {
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

  // Choose theme color based on mode
  const themeColor = "purple";

  // Calculate percentage for the slider
  const getPercentage = () => {
    if (!amount) return 0;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;

    if (mode === "deposit") {
      return currentWalletTokenBalance > 0
        ? Math.min((amountNum / currentWalletTokenBalance) * 100, 100)
        : 0;
    } else {
      return maxAmount > 0 ? Math.min((amountNum / maxAmount) * 100, 100) : 0;
    }
  };

  const handlePercentageChange = (percentage: number) => {
    if (mode === "deposit" && currentWalletTokenBalance > 0) {
      setAmount(((currentWalletTokenBalance * percentage) / 100).toFixed(6));
    } else if (mode === "withdraw" && maxAmount > 0) {
      setAmount(((maxAmount * percentage) / 100).toFixed(6));
    }
  };

  // Render wallet balance with token info when available
  const renderWalletBalance = () => {
    if (mode === "deposit") {
      const tokenInfo = tokenBalances?.find(
        (t) => t.symbol.toLowerCase() === token.toLowerCase()
      );

      if (tokenInfo) {
        return (
          <span className="font-medium flex items-center">
            <span>
              {tokenInfo.balanceFormatted} {token}
            </span>
            {tokenInfo.dollarValue > 0 && (
              <span className="text-xs text-neutrals-60 dark:text-neutrals-40 ml-1">
                (${tokenInfo.dollarValue.toFixed(2)})
              </span>
            )}
          </span>
        );
      }

      return `${currentWalletTokenBalance.toFixed(6)} ${token}`;
    } else {
      // For withdraw mode, show the selected token balance in the current subaccount
      const subaccountTokenInfo = getSubaccountTokenBalances.find(
        (info) => info.subaccountId === selectedSubaccountId
      );

      if (subaccountTokenInfo) {
        return `${subaccountTokenInfo.formattedBalance} ${token}`;
      }

      return `0.000000 ${token}`;
    }
  };

  // Add reduce-only toggle for withdrawals

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4 w-[400px]">
        <div className="flex border-b border-neutrals-20 dark:border-neutrals-70">
          <button
            className={`px-4 py-2 font-medium flex-1 transition-colors relative ${
              mode === "deposit"
                ? "text-purple-50"
                : "text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
            }`}
            onClick={() => setMode("deposit")}
          >
            Deposit
            {mode === "deposit" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium flex-1 transition-colors relative ${
              mode === "withdraw"
                ? "text-purple-50"
                : "text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
            }`}
            onClick={() => setMode("withdraw")}
          >
            Withdraw
            {mode === "withdraw" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
            )}
          </button>
        </div>

        {/* Token Balances overview for withdraw mode */}

        {/* Warning when no subaccount has the selected token */}
        {mode === "withdraw" &&
          !sortedSubaccountTokenBalances.some(
            (info) => info.tokenBalance > 0
          ) && (
            <div className="text-xs text-orange-500 bg-orange-900/10 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-2 rounded-lg mb-1">
              You don't have any {token} in your subaccounts. Select another
              token or deposit first.
            </div>
          )}

        {/* Subaccount Selector using CustomDropdown */}
        <CustomDropdown
          label={mode === "deposit" ? "Deposit to" : "Withdraw from"}
          options={subaccountOptions}
          value={selectedSubaccountId}
          onChange={handleSubaccountChange}
          placeholder="Select subaccount..."
          disabled={isLoadingSubaccounts}
        />

        {/* Amount with integrated token selector */}
        <div>
          <div className="text-xs text-neutrals-80 dark:text-neutrals-30 mb-1.5">
            Amount
          </div>
          <div className="flex mb-3">
            {/* Token selector dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                className="h-full bg-neutrals-10 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-l-lg px-3 py-2 flex items-center text-sm font-medium"
                disabled={isLoadingMarkets || isLoading || orderSubmitted}
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
                <svg
                  className="ml-1.5 w-4 h-4 text-neutrals-60 dark:text-neutrals-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
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
                    const isSelected = token === optionToken;

                    // Get wallet balance if available
                    const walletTokenBalance = tokenBalances?.find(
                      (tb) => tb.tokenMint === option.mint
                    );

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleTokenChange(option.value, option);
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
                          {walletTokenBalance &&
                            walletTokenBalance.balance > 0 && (
                              <span className="text-xs text-neutrals-60 dark:text-neutrals-40">
                                {walletTokenBalance.balanceFormatted}
                                {walletTokenBalance.dollarValue > 0 &&
                                  ` ($${walletTokenBalance.dollarValue.toFixed(
                                    2
                                  )})`}
                              </span>
                            )}
                        </div>
                        {isSelected && (
                          <svg
                            className="ml-auto w-4 h-4 text-purple-50"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input field */}
            <div className="flex-1 relative overflow-hidden bg-neutrals-10 dark:bg-neutrals-80 border border-neutrals-20 dark:border-neutrals-70 rounded-r-lg">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                min="0"
                step="0.000001"
                placeholder="0.000000"
                className={`w-full h-full py-2 px-2 bg-transparent text-sm text-neutrals-100 dark:text-white focus:outline-none focus:border-${themeColor}-50`}
                disabled={isLoading || orderSubmitted}
              />
            </div>
          </div>

          {/* Wallet balance */}
          <div className="flex justify-between items-center text-xs mb-2">
            <div className="flex items-center">
              <span className="text-neutrals-80 dark:text-neutrals-30">
                {mode === "deposit"
                  ? "Wallet balance"
                  : "Available to withdraw"}
              </span>
            </div>
            <div className="flex items-center">
              {renderWalletBalance()}
              <button
                onClick={handleMaxBalance}
                className="ml-1 text-xs text-purple-50 font-medium hover:opacity-80"
                disabled={mode === "withdraw" && maxAmount <= 0}
              >
                MAX
              </button>
            </div>
          </div>

          {mode === "withdraw" &&
            activeAccount?.user &&
            (() => {
              // Calculate if the withdrawal limit is less than the user's balance
              const subaccountTokenInfo = getSubaccountTokenBalances.find(
                (info) => info.subaccountId === selectedSubaccountId
              );
              const userTokenBalance = subaccountTokenInfo?.tokenBalance || 0;

              // Only show warning if the max withdrawal is less than the user's balance
              if (maxAmount < userTokenBalance && userTokenBalance > 0) {
                return (
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
                      {!reduceOnly &&
                        "Enable 'Reduce Only' for safer withdrawals."}
                    </span>
                  </div>
                );
              }
              return null;
            })()}

          {/* Percentage Selector buttons */}
          <div className="flex justify-between mb-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handlePercentageChange(percent)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors
                  ${
                    getPercentage() === percent
                      ? "bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 text-white"
                      : "bg-neutrals-10 dark:bg-neutrals-80 text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
                  }`}
                disabled={
                  isLoading ||
                  orderSubmitted ||
                  (mode === "withdraw" && maxAmount <= 0)
                }
              >
                {percent}%
              </button>
            ))}
          </div>

          {/* Percentage Slider - Using the new component */}
          <PercentageSlider
            percentage={getPercentage()}
            onChange={handlePercentageChange}
            sliderHeight="sm"
            className="mb-2"
            disabled={
              isLoading ||
              orderSubmitted ||
              (mode === "withdraw" && maxAmount <= 0)
            }
          />
        </div>

        {/* Asset information in panel */}
        <div className="bg-neutrals-5 dark:bg-neutrals-90 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neutrals-60 dark:text-neutrals-40">
              Asset Balance
            </span>
            <span>
              {assetBalance.toFixed(6)} {token}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutrals-60 dark:text-neutrals-40">
              Net Account Balance (USD)
            </span>
            <span>${accountNetValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="text-xs text-red-50 bg-red-900/10 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2 rounded-lg flex items-start">
            <svg
              className="h-3 w-3 text-red-50 mr-1 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Transaction status */}
        {txStatus?.status === "failed" && (
          <div className="text-xs text-red-500 bg-red-900/10 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-2 rounded-lg">
            Transaction failed: {txStatus.error || "Unknown error"}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className={`w-full py-3 text-sm font-semibold text-white rounded-lg transition-colors ${
            isLoading || orderSubmitted
              ? "bg-neutrals-60 cursor-not-allowed"
              : `bg-${themeColor}-50 hover:bg-${themeColor}-60`
          }`}
          disabled={
            isLoading ||
            orderSubmitted ||
            !amount ||
            isNaN(parseFloat(amount)) ||
            parseFloat(amount) <= 0
          }
        >
          {getButtonText()}
        </button>
      </div>
    </Modal>
  );
}

// Helper function to format values with dollar sign
function formatValue(
  value: number | undefined,
  withDollarSign = false
): string {
  if (value === undefined) return "N/A";

  const formattedValue = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return withDollarSign ? `$${formattedValue}` : formattedValue;
}
