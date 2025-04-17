import { BN } from "@drift-labs/sdk";

/**
 * Cache structure to store oracle prices
 */
export interface OraclePriceCache {
  price: BN;
  timestamp: number;
}

/**
 * Standard time to live for cached market data in milliseconds
 */
export const CACHE_TTL_MS = 3000; // 3 seconds

/**
 * Market information with price data
 */
export interface MarketInfo {
  marketIndex: number;
  symbol: string;
  oraclePrice?: BN;
  bid?: BN;
  ask?: BN;
  lastTradePrice?: BN;
}
