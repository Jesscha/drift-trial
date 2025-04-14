import { getPerpMarketAccounts } from "@/services/drift/market";
import { useDriftClient } from "./useDriftClient";
import useSWR from "swr";

export type MarketData = {
  name: string;
  marketIndex: number;
  isSpot: boolean;
  metadata: {
    decimals?: number;
    baseAssetSymbol?: string;
    quoteAssetSymbol?: string;
  };
};
export function usePerpMarketAccounts() {
  const { isInitialized } = useDriftClient();

  // Create a stable key for SWR cache
  const cacheKey = isInitialized ? "allMarketData" : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      const marketAccounts = await getPerpMarketAccounts();

      if (!marketAccounts) return {};

      const marketsMap = marketAccounts.reduce<Record<number, MarketData>>(
        (acc, marketAccount) => {
          const marketIndex = marketAccount.marketIndex;
          const name = marketAccount.name
            ? String.fromCharCode(
                ...marketAccount.name.filter((byte: number) => byte !== 0)
              )
            : `Market #${marketIndex}`;

          const metadata = {
            baseAssetSymbol: name,
            quoteAssetSymbol: "USD", // Perp markets use USD as quote
            decimals: marketAccount.amm?.pegMultiplier?.toString()
              ? Math.log10(parseInt(marketAccount.amm.pegMultiplier.toString()))
              : 6,
          };

          acc[marketIndex] = {
            name,
            marketIndex,
            isSpot: false,
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
