import { BN, PerpMarketAccount, SpotMarketAccount } from "@drift-labs/sdk";
import driftService from "./client";

// Cache structure to store oracle prices
interface OraclePriceCache {
  price: BN;
  timestamp: number;
}

// Cache map to store prices for different market indices
const perpOraclePriceCache: Map<number, OraclePriceCache> = new Map();
const spotOraclePriceCache: Map<number, OraclePriceCache> = new Map();
const CACHE_TTL_MS = 3000; // 3 seconds

/**
 * Sleep function to wait between retries
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getPerpMarketAccounts = (): PerpMarketAccount[] | null => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  // Get the perp market account
  const marketAccount = client.getPerpMarketAccounts();

  return marketAccount;
};

export const getSpotMarketAccounts = (): SpotMarketAccount[] | null => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  const marketAccount = client.getSpotMarketAccounts();

  return marketAccount;
};

/**
 * Fetches oracle price for a specific perp market with caching and retry logic
 * @param marketIndex The index of the market to fetch
 * @returns Oracle price for the specified market
 */
export const getPerpOraclePrice = (marketIndex: number): BN | null => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  // Check cache first
  const cachedData = perpOraclePriceCache.get(marketIndex);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return cachedData.price;
  }

  try {
    const data = client.getOracleDataForPerpMarket(marketIndex);

    if (data?.price) {
      // Update cache with new data
      perpOraclePriceCache.set(marketIndex, {
        price: data.price,
        timestamp: now,
      });
      return data.price;
    }
  } catch (err) {
    console.warn(`Failed to fetch oracle data for market ${marketIndex}:`, err);
  }

  return null;
};

/**
 * Fetches oracle price for a specific spot market with caching and retry logic
 * @param marketIndex The index of the market to fetch
 * @returns Oracle price for the specified market
 */
export const getSpotOraclePrice = (marketIndex: number): BN | null => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  // Check cache first
  const cachedData = spotOraclePriceCache.get(marketIndex);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return cachedData.price;
  }

  try {
    const data = client.getOracleDataForSpotMarket(marketIndex);

    if (data?.price) {
      // Update cache with new data
      spotOraclePriceCache.set(marketIndex, {
        price: data.price,
        timestamp: now,
      });
      return data.price;
    }
  } catch (err) {
    console.warn(
      `Failed to fetch oracle data for spot market ${marketIndex}:`,
      err
    );
  }

  return null;
};
