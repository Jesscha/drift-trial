"use client";

import { BN } from "@drift-labs/sdk";
import { useMultipleOraclePrices } from "../hooks/useMultipleOraclePrices";

interface OraclePriceBoardProps {
  marketIndices: number[];
}

/**
 * Component to display oracle prices for multiple markets
 */
export function OraclePriceBoard({ marketIndices }: OraclePriceBoardProps) {
  const { priceData, isLoading, refresh, hasErrors } =
    useMultipleOraclePrices(marketIndices);

  // Format BN to display as USD value
  const formatPrice = (price: BN | null): string => {
    if (!price) return "N/A";
    return `$${(price.toNumber() / 1e9).toFixed(2)}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Oracle Price Dashboard</h2>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketIndices.map((marketIndex) => {
          const price = priceData[marketIndex]?.price;
          const error = priceData[marketIndex]?.error;

          return (
            <div
              key={`market-${marketIndex}`}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <h3 className="text-lg font-medium mb-2">
                Market #{marketIndex} Oracle Price
              </h3>

              {isLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-red-500">Error: {error.message}</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-bold">
                    {formatPrice(price)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
