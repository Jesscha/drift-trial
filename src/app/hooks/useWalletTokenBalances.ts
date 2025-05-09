import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { BN, QUOTE_PRECISION } from "@drift-labs/sdk";
import useSWR from "swr";
import { PublicKey, AccountInfo, ParsedAccountData } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useSpotMarketAccounts } from "./useSpotMarketAccounts";
import { getSpotOraclePrice } from "@/services/drift/market";
import driftService from "@/services/drift/client";
import { getTokenIconUrl } from "@/utils/assets";

// Type definitions
export interface TokenBalanceInfo {
  marketIndex: number;
  symbol: string;
  balance: number; // Raw balance
  balanceFormatted: string; // Formatted with proper decimals
  decimals: number;
  dollarValue: number; // USD value of the token balance
  tokenMint: string;
  icon?: string;
  priceUsd?: number; // Price per token in USD
}

// Define the token account structure
interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<ParsedAccountData>;
}

// Define the return type of the SWR fetch function
interface TokenBalancesData {
  tokenAccounts: TokenAccount[];
  solBalance: number;
}

/**
 * Hook to fetch and track token balances in the user's wallet
 * with dollar values based on current market prices
 */
export function useWalletTokenBalances() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { marketsList, isLoading: isLoadingMarkets } = useSpotMarketAccounts();

  // Fetch token accounts for the connected wallet
  const {
    data: tokenBalances,
    error,
    mutate,
  } = useSWR<TokenBalancesData | null>(
    publicKey ? `token-balances-${publicKey.toString()}` : null,
    async () => {
      if (!publicKey) return null;

      try {
        // Get all token accounts owned by this wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Get SOL balance (native token)
        const solBalance = await connection.getBalance(publicKey);

        // Process and return the balances
        return {
          tokenAccounts: tokenAccounts.value,
          solBalance,
        };
      } catch (error) {
        console.error("Error fetching token balances:", error);
        throw error;
      }
    },
    {
      refreshInterval: 15000, // Refresh every 15 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    }
  );

  // TODO: do not have to be separate swr, it is only making code complex
  const { data: oraclePrices } = useSWR<Record<number, BN | null>>(
    marketsList.length > 0 ? "wallet-oracle-prices" : null,
    async () => {
      const prices: Record<number, BN | null> = {};

      // Fetch prices for all spot markets in parallel
      await Promise.all(
        marketsList.map(async (market) => {
          try {
            const price = await getSpotOraclePrice(market.marketIndex);
            prices[market.marketIndex] = price;
          } catch (error) {
            console.error(
              `Error fetching price for market ${market.marketIndex}:`,
              error
            );
            prices[market.marketIndex] = null;
          }
        })
      );

      return prices;
    },
    {
      refreshInterval: 15000, // Refresh every 15 seconds
      revalidateOnFocus: true,
    }
  );

  // Process token balances with dollar values
  const processedBalances = useMemo(() => {
    if (!tokenBalances || !marketsList || isLoadingMarkets) {
      return [];
    }

    const balances: TokenBalanceInfo[] = [];
    const client = driftService.getClient();

    if (!client) {
      console.error("Drift client not initialized");
      return [];
    }

    // Process token accounts
    tokenBalances.tokenAccounts.forEach((account: TokenAccount) => {
      const parsedInfo = account.account.data.parsed.info;
      const mint = parsedInfo.mint;
      let amount = parsedInfo.tokenAmount.uiAmount;
      if (mint === "So11111111111111111111111111111111111111112") {
        amount = amount + tokenBalances.solBalance / 1e9;
      }

      const decimals = parsedInfo.tokenAmount.decimals;

      const market = marketsList.find((market) => {
        return market.mint === mint;
      });

      if (market) {
        // Default dollar value
        let dollarValue = 0;
        let priceUsd = 0;

        // Get price from oracle prices if available
        if (oraclePrices && oraclePrices[market.marketIndex]) {
          const price = oraclePrices[market.marketIndex];

          if (price) {
            priceUsd = price.div(QUOTE_PRECISION).toNumber();
            dollarValue = amount * priceUsd;
          }
        }

        // Get symbol from market data
        const symbol = market.metadata.baseAssetSymbol || "Unknown";

        balances.push({
          marketIndex: market.marketIndex,
          symbol,
          balance: amount,
          balanceFormatted: amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          }),
          decimals,
          dollarValue,
          priceUsd,
          tokenMint: mint,
          icon: getTokenIconUrl(symbol),
        });
      }
    });

    // Add SOL balance if available
    if (tokenBalances.solBalance !== undefined) {
      const solAmount = tokenBalances.solBalance / 1e9; // Convert lamports to SOL

      // Find SOL market if available
      const solMarket = marketsList.find(
        (m) => m.mint === "So11111111111111111111111111111111111111112"
      );

      let dollarValue = 0;
      let priceUsd = 0;

      if (solMarket && oraclePrices && oraclePrices[solMarket.marketIndex]) {
        const price = oraclePrices[solMarket.marketIndex];
        if (price) {
          priceUsd = price.div(QUOTE_PRECISION).toNumber();
          dollarValue = solAmount * priceUsd;
        }
      }

      balances.push({
        marketIndex: 1,
        symbol: "SOL",
        balance: solAmount,
        balanceFormatted: solAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        }),
        decimals: 9,
        dollarValue,
        priceUsd,
        tokenMint: "So11111111111111111111111111111111111111112", // Native SOL doesn't have a mint
        icon: getTokenIconUrl("sol"),
      });
    }

    return balances;
  }, [tokenBalances, marketsList, isLoadingMarkets, oraclePrices]);

  // Sort token balances by dollar value
  const sortedTokenBalances = useMemo(() => {
    if (!processedBalances.length) return [];

    // Create a copy to avoid mutating the original array
    return [...processedBalances].sort((a, b) => {
      // Sort by dollar value in descending order
      return b.dollarValue - a.dollarValue;
    });
  }, [processedBalances]);

  return {
    walletTokenBalances: sortedTokenBalances,
    walletTokensForDeposit: [],
    isParsing: false,
    error,
    isConnected: !!publicKey,
    solBalance: tokenBalances?.solBalance,
    refetch: mutate,
  };
}
