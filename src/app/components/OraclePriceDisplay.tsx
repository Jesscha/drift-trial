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
    <div className="p-4 border border-neutrals-20 dark:border-neutrals-70 rounded-lg shadow-sm bg-neutrals-0 dark:bg-neutrals-80">
      <h3 className="text-lg font-medium mb-2 text-neutrals-100 dark:text-neutrals-10">
        Market #{marketIndex} Oracle Price
      </h3>

      {isLoading ? (
        <div className="text-neutrals-60 dark:text-neutrals-40">Loading...</div>
      ) : error ? (
        <div className="text-red-60 dark:text-red-40">
          Error: {error.message}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold text-neutrals-100 dark:text-neutrals-0">
            {formatPrice(price)}
          </span>
          <button
            onClick={() => refresh()}
            className="text-sm px-3 py-1 bg-purple-50 hover:bg-purple-60 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
