import { useMemo } from "react";
import {
  useDepositWithdrawStore,
  TransactionMode,
} from "@/app/stores/depositWithdrawStore";
import { usePNLUserData } from "@/app/hooks/usePNLUserData";
import { useActiveAccount } from "@/app/providers/ActiveAccountProvider";
import { useSpotMarketAccounts } from "@/app/hooks/useSpotMarketAccounts";
import { useWalletTokenBalances } from "@/app/hooks/useWalletTokenBalances";
import { useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@drift-labs/sdk";
import { formatBN } from "../../utils/number";
import { getTokenIconUrl } from "@/utils/assets";

/**
 * Hook for managing all data-related aspects of deposit/withdraw functionality
 * Responsible for:
 * - Fetching and providing subaccount data
 * - Fetching and providing token balances
 * - Calculating available amounts for deposit/withdraw
 * - Providing token information
 */
export const useDepositWithdrawData = () => {
  const { publicKey } = useWallet();
  const { mode, tokenSelectionInfo, selectedMarketIndex, reduceOnly } =
    useDepositWithdrawStore();

  const { subaccounts, isLoading: isLoadingSubaccounts } =
    usePNLUserData(publicKey);
  const { activeAccount, getWithdrawalLimit, activeAccountId } =
    useActiveAccount();
  const { marketsList } = useSpotMarketAccounts();
  const { walletTokenBalances } = useWalletTokenBalances();

  // Get all subaccount token balances
  const subaccountTokenBalances = useMemo(() => {
    if (!subaccounts || !marketsList || marketsList.length === 0) return [];

    const result = [];

    for (const subaccount of subaccounts) {
      for (const market of marketsList) {
        const spotPosition = subaccount.spotPositions.find(
          (position) => position.marketIndex === market.marketIndex
        );

        let tokenBalance = 0;
        const tokenSymbol = market.metadata.baseAssetSymbol || market.name;
        const mint = market.mint;

        if (spotPosition && !spotPosition.scaledBalance.isZero()) {
          const scaledBalance = spotPosition.scaledBalance;
          const decimals = market.metadata.decimals || 6;
          tokenBalance = parseFloat(formatBN(scaledBalance, false, decimals));
        }

        if (tokenBalance > 0) {
          result.push({
            subaccountId: subaccount.subAccountId,
            marketIndex: market.marketIndex,
            tokenBalance,
            tokenSymbol,
            mint,
            formattedBalance: tokenBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            }),
          });
        }
      }
    }

    return result;
  }, [subaccounts, marketsList]);

  // Sort token balances by amount
  const sortedSubaccountTokenBalances = useMemo(() => {
    return [...subaccountTokenBalances].sort(
      (a, b) => b.tokenBalance - a.tokenBalance
    );
  }, [subaccountTokenBalances]);

  // Get currently selected subaccount
  const selectedSubaccount = useMemo(
    () => subaccounts?.find((acc) => acc.subAccountId === activeAccountId),
    [subaccounts, activeAccountId]
  );

  // Determine the current token's mint address
  const currentTokenMint = useMemo(() => {
    if (tokenSelectionInfo.mint) return tokenSelectionInfo.mint;

    if (!marketsList || !tokenSelectionInfo.symbol) return null;

    const market = marketsList.find(
      (m) =>
        (m.metadata.baseAssetSymbol || m.name).toLowerCase() ===
        tokenSelectionInfo.symbol.toLowerCase()
    );
    return market?.mint || null;
  }, [marketsList, tokenSelectionInfo]);

  // Get wallet balance for the selected token
  const currentWalletTokenBalance = useMemo(() => {
    const tokenInfo = walletTokenBalances.find(
      (t) => t.tokenMint === tokenSelectionInfo.mint
    );

    return tokenInfo ? tokenInfo.balance : 0;
  }, [walletTokenBalances, tokenSelectionInfo.mint]);

  // Calculate maximum available amount for transaction
  const maxAmount = useMemo(() => {
    if (mode === TransactionMode.WITHDRAW && activeAccountId !== undefined) {
      const subaccountTokenInfo = subaccountTokenBalances.find(
        (info) =>
          info.subaccountId === activeAccountId &&
          info.marketIndex === selectedMarketIndex
      );

      if (activeAccount && selectedMarketIndex !== undefined) {
        try {
          const withdrawalLimit =
            getWithdrawalLimit?.(selectedMarketIndex, true) || new BN(0);

          const marketAccount = marketsList.find(
            (m) => m.marketIndex === selectedMarketIndex
          );
          const decimals = marketAccount?.metadata.decimals || 6;

          const withdrawalLimitNumber = withdrawalLimit
            ? parseFloat(withdrawalLimit.toString()) / Math.pow(10, decimals)
            : 0;

          const userTokenBalance = subaccountTokenInfo?.tokenBalance || 0;

          return Math.min(userTokenBalance, withdrawalLimitNumber);
        } catch (err) {
          console.error("Error fetching deposit withdrawal data:", err);
          return subaccountTokenInfo?.tokenBalance || 0;
        }
      }

      return subaccountTokenInfo?.tokenBalance || 0;
    } else if (mode === TransactionMode.DEPOSIT) {
      return currentWalletTokenBalance;
    }

    return 0;
  }, [
    mode,
    activeAccountId,
    subaccountTokenBalances,
    selectedSubaccount,
    activeAccount,
    selectedMarketIndex,
    reduceOnly,
    marketsList,
    getWithdrawalLimit,
    currentWalletTokenBalance,
  ]);

  // Calculate if withdrawal is limited by protocol limits
  const isWithdrawalLimited = useMemo(() => {
    if (mode === TransactionMode.WITHDRAW && activeAccountId !== undefined) {
      const subaccountTokenInfo = subaccountTokenBalances.find(
        (info) =>
          info.subaccountId === activeAccountId &&
          info.marketIndex === selectedMarketIndex
      );
      const userTokenBalance = subaccountTokenInfo?.tokenBalance || 0;

      return maxAmount < userTokenBalance && userTokenBalance > 0;
    }
    return false;
  }, [
    mode,
    activeAccountId,
    subaccountTokenBalances,
    maxAmount,
    selectedMarketIndex,
  ]);

  // Get all available tokens as dropdown options
  const tokenOptions = useMemo(() => {
    if (!marketsList || marketsList.length === 0) return [];

    const uniqueMarkets = marketsList.reduce((acc, market) => {
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

    if (mode === TransactionMode.DEPOSIT) {
      // For DEPOSIT mode: prioritize tokens that the user has in their wallet
      if (walletTokenBalances && walletTokenBalances.length > 0) {
        // First enrich options with dollar values from wallet balances
        const enrichedOptions = baseOptions.map((option) => {
          const matchingToken = walletTokenBalances.find(
            (token) => token.tokenMint === option.mint
          );

          return {
            ...option,
            mint: matchingToken?.tokenMint || option.mint,
            dollarValue: matchingToken?.dollarValue || 0,
            balance: matchingToken?.balance || 0,
            balanceFormatted: matchingToken?.balanceFormatted || "0",
          };
        });

        return enrichedOptions.sort((a, b) => b.dollarValue - a.dollarValue);
      }

      return baseOptions;
    } else {
      // For WITHDRAW mode: prioritize tokens that exist in the selected subaccount
      if (subaccountTokenBalances.length > 0 && activeAccountId !== undefined) {
        // Get tokens that are available in the selected subaccount
        const subaccountTokens = subaccountTokenBalances.filter(
          (tokenInfo) =>
            tokenInfo.subaccountId === activeAccountId &&
            tokenInfo.tokenBalance > 0
        );

        // Enrich options with subaccount balances
        const enrichedOptions = baseOptions.map((option) => {
          const marketIndex = Number(option.value);

          // Find the matching token by market index
          const matchingToken = subaccountTokens.find(
            (token) => token.marketIndex === marketIndex
          );

          return {
            ...option,
            subaccountBalance: matchingToken?.tokenBalance || 0,
            subaccountBalanceFormatted: matchingToken?.formattedBalance || "0",
          };
        });

        // Sort by subaccount balance, placing tokens with balances first
        return enrichedOptions.sort((a, b) => {
          // First priority: tokens with balances come first
          if (a.subaccountBalance > 0 !== b.subaccountBalance > 0) {
            return b.subaccountBalance > 0 ? 1 : -1;
          }

          // Second priority: sort by balance amount
          return (b.subaccountBalance || 0) - (a.subaccountBalance || 0);
        });
      }

      return baseOptions;
    }
  }, [
    marketsList,
    walletTokenBalances,
    mode,
    subaccountTokenBalances,
    activeAccountId,
  ]);

  // Get subaccount net value and other relevant data
  const accountNetValue = useMemo(
    () =>
      selectedSubaccount?.netTotal
        ? parseFloat(selectedSubaccount.netTotal.toString()) / 1e6
        : 0,
    [selectedSubaccount]
  );

  // Get subaccount options for UI dropdowns
  const subaccountOptions = useMemo(() => {
    if (!subaccounts || subaccounts.length === 0) return [];

    return subaccounts.map((acc) => {
      return {
        value: acc.subAccountId,
        label: String.fromCharCode(...acc.name).trim(),
      };
    });
  }, [subaccounts]);

  return {
    // Loading states
    isLoadingSubaccounts,

    // Data sources
    subaccounts,
    selectedSubaccount,
    subaccountTokenBalances,
    sortedSubaccountTokenBalances,
    currentTokenMint,
    currentWalletTokenBalance,

    // Calculated values
    maxAmount,
    accountNetValue,
    isWithdrawalLimited,

    // UI options
    tokenOptions,
    subaccountOptions,
  };
};
