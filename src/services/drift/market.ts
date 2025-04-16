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
// Simple cache for market symbols
const marketSymbolCache: Map<number, string> = new Map();
const CACHE_TTL_MS = 3000; // 3 seconds

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
 * Gets the symbol/name for a market based on its index
 * @param marketIndex The index of the market
 * @returns The market symbol or a default name if not found
 */
export const getMarketSymbol = (marketIndex: number): string => {
  // Check cache first
  const cachedSymbol = marketSymbolCache.get(marketIndex);
  if (cachedSymbol) {
    return cachedSymbol;
  }

  const client = driftService.getClient();
  if (!client) return `Market #${marketIndex}`;

  try {
    // Get from perp markets
    const perpMarkets = client.getPerpMarketAccounts();
    const perpMarket = perpMarkets.find(
      (market) => market.marketIndex === marketIndex
    );

    if (perpMarket && perpMarket.name) {
      const name = String.fromCharCode(
        ...perpMarket.name.filter((byte: number) => byte !== 0)
      ).trim();

      // Cache the result only on success
      marketSymbolCache.set(marketIndex, name);

      return name;
    }
  } catch (err) {
    console.warn(`Failed to get market symbol for market ${marketIndex}:`, err);
  }

  // Return a default if not found (without caching the failure)
  return `Market #${marketIndex}`;
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
