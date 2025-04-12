"use client";

import { useMultipleOraclePrices } from "../hooks/useMultipleOraclePrices";
import { BN } from "@drift-labs/sdk";

interface OraclePriceDisplayProps {
  marketIndex: number;
}

/**
 * Component to display oracle price for a specific market
 */
export function OraclePriceDisplay({ marketIndex }: OraclePriceDisplayProps) {
  const { priceData, isLoading, refresh } = useMultipleOraclePrices([
    marketIndex,
  ]);

  const price = priceData[marketIndex]?.price || null;
  const error = priceData[marketIndex]?.error || null;

  // Format BN to display as USD value
  const formatPrice = (price: BN | null): string => {
    if (!price) return "N/A";

    // Assuming price is normalized to 9 decimal places per Drift SDK conventions
    return `$${(price.toNumber() / 1e9).toFixed(2)}`;
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-medium mb-2">
        Market #{marketIndex} Oracle Price
      </h3>

      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error.message}</div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold">{formatPrice(price)}</span>
          <button
            onClick={() => refresh()}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
