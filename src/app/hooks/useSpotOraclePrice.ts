import { BN } from "@drift-labs/sdk";
import useSWR from "swr";
import { getSpotOraclePrice } from "@/services/drift/market";
import { useDriftClient } from "./useDriftClient";

/**
 * Hook to fetch and cache oracle price for a specific spot market
 * @param marketIndex The market index to fetch the oracle price for
 * @param refreshInterval Optional refresh interval in milliseconds (default: 5000ms)
 * @returns Object containing oracle price data, loading state, error, and refresh function
 */
export function useSpotOraclePrice(
  marketIndex: number,
  refreshInterval = 5000
) {
  const { isInitialized } = useDriftClient();

  const {
    data: oraclePrice,
    error,
    isLoading,
    mutate,
  } = useSWR<BN | null>(
    isInitialized ? `spotOraclePrice-${marketIndex}` : null,
    async () => {
      try {
        return await getSpotOraclePrice(marketIndex);
      } catch (err) {
        console.error(
          `Error fetching spot oracle price for market ${marketIndex}:`,
          err
        );
        throw err;
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: refreshInterval,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      dedupingInterval: 3000, // Deduplicate requests within 1 second
    }
  );

  return {
    oraclePrice,
    isLoading,
    error,
    refreshOraclePrice: mutate,
  };
}
