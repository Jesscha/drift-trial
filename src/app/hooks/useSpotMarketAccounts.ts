import { getSpotMarketAccounts } from "@/services/drift/market";
import { useDriftClient } from "./useDriftClient";
import useSWR from "swr";

export type SpotMarketData = {
  name: string;
  marketIndex: number;
  mint: string;
  metadata: {
    decimals?: number;
    baseAssetSymbol?: string;
    quoteAssetSymbol?: string;
  };
};

export function useSpotMarketAccounts() {
  const { isInitialized } = useDriftClient();

  // Create a stable key for SWR cache
  const cacheKey = isInitialized ? "allSpotMarketData" : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      const marketAccounts = getSpotMarketAccounts();

      if (!marketAccounts) return {};

      const marketsMap = marketAccounts.reduce<Record<number, SpotMarketData>>(
        (acc, marketAccount) => {
          const marketIndex = marketAccount.marketIndex;
          const name = marketAccount.name
            ? String.fromCharCode(
                ...marketAccount.name.filter((byte: number) => byte !== 0)
              )
            : `Spot Market #${marketIndex}`;

          const mint = marketAccount.mint.toBase58();

          const metadata = {
            baseAssetSymbol: name,
            quoteAssetSymbol: "USDC", // Spot markets typically use USDC as quote
            decimals: marketAccount.decimals || 6,
          };

          acc[marketIndex] = {
            name,
            marketIndex,
            mint,
            metadata,
          };

          return acc;
        },
        {}
      );

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
