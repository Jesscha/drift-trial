import { getPerpMarketAccount } from "@/services/drift/market";
import { useDriftClient } from "./useDriftClient";
import useSWR from "swr";
import driftService from "@/services/drift/client";

// Define a type for the market data
export type MarketData = {
  name: string;
  marketIndex: number;
  isSpot: boolean;
  // Additional metadata that could be expanded in the future
  metadata: {
    decimals?: number;
    baseAssetSymbol?: string;
    quoteAssetSymbol?: string;
  };
};

// Maximum number of perp market indices to check
// Drift typically uses market indices 0-22 for perps
const MAX_PERP_MARKET_INDEX = 30;

export function useMarketAccounts() {
  const { isInitialized } = useDriftClient();

  // Create a stable key for SWR cache
  const cacheKey = isInitialized ? "allMarketData" : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      const client = driftService.getClient();
      if (!client) throw new Error("Drift client not initialized");

      // Fetch all market accounts
      const marketsMap: Record<number, MarketData> = {};

      // Process each potential market index
      for (
        let marketIndex = 0;
        marketIndex <= MAX_PERP_MARKET_INDEX;
        marketIndex++
      ) {
        try {
          const marketAccount = await getPerpMarketAccount(marketIndex);

          // Skip if market doesn't exist
          if (!marketAccount) continue;

          // Get market name
          const name = marketAccount.name
            ? String.fromCharCode(
                ...marketAccount.name.filter((byte: number) => byte !== 0)
              )
            : `Market #${marketIndex}`;

          // Get market metadata
          const metadata = {
            baseAssetSymbol: name,
            quoteAssetSymbol: "USD", // Perp markets use USD as quote
            decimals: marketAccount.amm?.pegMultiplier?.toString()
              ? Math.log10(parseInt(marketAccount.amm.pegMultiplier.toString()))
              : 6,
          };

          // Store market data
          marketsMap[marketIndex] = {
            marketIndex,
            name,
            isSpot: false,
            metadata,
          };
        } catch (err) {
          console.error(`Error fetching data for market ${marketIndex}:`, err);
          // Continue to next market on error
        }
      }

      return marketsMap;
    },
    {
      errorRetryCount: 3,
    }
  );

  // Get an array of all markets data
  const marketsList = data ? Object.values(data) : [];

  return {
    markets: data || {},
    marketsList,
    isLoading,
    error,
    refreshMarkets: mutate,
  };
}
