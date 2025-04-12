import { BN } from "@drift-labs/sdk";
import driftService from "./client";

// Cache structure to store oracle prices
interface OraclePriceCache {
  price: BN;
  timestamp: number;
}

// Cache map to store market names

// Cache map for market accounts
const marketAccountCache: Map<number, any> = new Map();

// Cache map to store prices for different market indices
const oraclePriceCache: Map<number, OraclePriceCache> = new Map();
const CACHE_TTL_MS = 3000; // 3 seconds
const MAX_RETRIES = 3; // Maximum number of retry attempts
const RETRY_DELAY_MS = 500; // Delay between retries in milliseconds

/**
 * Sleep function to wait between retries
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gets the perp market account for a given market index
 * @param marketIndex The index of the perp market
 * @returns The perp market account or null if not found
 */
export const getPerpMarketAccount = async (
  marketIndex: number
): Promise<any | null> => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  // Check cache first
  if (marketAccountCache.has(marketIndex)) {
    return marketAccountCache.get(marketIndex)!;
  }

  try {
    // Get the perp market account
    const marketAccount = await client.getPerpMarketAccount(marketIndex);

    if (marketAccount) {
      // Cache the result
      marketAccountCache.set(marketIndex, marketAccount);
      return marketAccount;
    }
  } catch (error) {
    console.error(
      `Error fetching market account for index ${marketIndex}:`,
      error
    );
  }

  return null;
};

/**
 * Fetches oracle price for a specific perp market with caching and retry logic
 * @param marketIndex The index of the market to fetch
 * @returns Oracle price for the specified market
 */
export const getPerpOraclePrice = async (
  marketIndex: number
): Promise<BN | null> => {
  const client = driftService.getClient();
  if (!client) throw new Error("Drift client not initialized");

  // Check cache first
  const cachedData = oraclePriceCache.get(marketIndex);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return cachedData.price;
  }

  let attempts = 0;
  let lastError: any = null;

  // TODO: does it really need retry?
  while (attempts < MAX_RETRIES) {
    try {
      const data = await client.getOracleDataForPerpMarket(marketIndex);

      if (data?.price) {
        // Update cache with new data
        oraclePriceCache.set(marketIndex, {
          price: data.price,
          timestamp: now,
        });
        return data.price;
      } else {
        // If price is missing, treat it as a failure and retry
        attempts++;
        if (attempts < MAX_RETRIES) {
          console.warn(
            `Attempt ${attempts} failed for market ${marketIndex} - no price data, retrying...`
          );
          await sleep(RETRY_DELAY_MS);
        }
      }
    } catch (err) {
      lastError = err;
      attempts++;

      if (attempts < MAX_RETRIES) {
        console.warn(
          `Attempt ${attempts} failed for market ${marketIndex}, retrying...`
        );
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  console.warn(
    `Failed to fetch oracle data for market ${marketIndex} after ${MAX_RETRIES} attempts:`,
    lastError ? lastError : "No price data available"
  );
  return null;
};
