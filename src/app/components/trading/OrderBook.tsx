import { OrderBookData, OrderBookEntry } from "@/app/hooks/useOrderBook";
import React, { useMemo } from "react";
import { LoadingSpinnerIcon } from "@/app/assets/icons";
import { formatNumber } from "@/utils/formatting";

interface OrderBookProps {
  orderBookData?: OrderBookData;
  isLoading?: boolean;
  onPriceClick?: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  orderBookData,
  isLoading,
  onPriceClick,
}) => {
  const maxSize = useMemo(() => {
    if (!orderBookData) return 1;
    const allSizes = [
      ...orderBookData.asks.map((ask) => parseInt(ask.size)),
      ...orderBookData.bids.map((bid) => parseInt(bid.size)),
    ];
    return Math.max(...allSizes, 1);
  }, [orderBookData]);

  if (isLoading || !orderBookData) {
    return (
      <div className="w-[300px] h-full flex items-center justify-center text-neutrals-20 dark:text-neutrals-40">
        <LoadingSpinnerIcon size="sm" />
      </div>
    );
  }

  const formatPrice = (priceStr: string | number): string => {
    const priceNum =
      typeof priceStr === "string"
        ? parseInt(priceStr) / 1000000
        : priceStr / 1000000;
    return formatNumber(priceNum, 4);
  };

  const formatSize = (sizeStr: string): string => {
    const sizeNum = parseInt(sizeStr) / 1000000000;
    return formatNumber(sizeNum, 2);
  };

  const getSizePercentage = (sizeStr: string): number => {
    const size = parseInt(sizeStr);
    return (size / maxSize) * 100;
  };

  const calculateMidpoint = (): number => {
    if (orderBookData.asks.length === 0 || orderBookData.bids.length === 0) {
      return parseInt(orderBookData.oracle.toString());
    }

    return (
      (parseInt(orderBookData.asks[0].price) +
        parseInt(orderBookData.bids[0].price)) /
      2
    );
  };

  const handlePriceClick = (price: string) => {
    if (onPriceClick) {
      onPriceClick(parseInt(price) / 1e6);
    }
  };

  return (
    <div className="w-[300px] h-full font-mono text-sm select-none">
      <div className="grid grid-cols-2 border-b border-neutrals-20 dark:border-neutrals-70 py-1">
        <div className="px-4 font-medium text-neutrals-60 dark:text-neutrals-40">
          Price
        </div>
        <div className="px-4 text-right font-medium text-neutrals-60 dark:text-neutrals-40">
          Size
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "40%" }}>
        {[...orderBookData.asks]
          .reverse()
          .map((ask: OrderBookEntry, index: number) => (
            <div
              key={`ask-${index}`}
              className="py-0.5 hover:bg-neutrals-10 dark:hover:bg-neutrals-70 relative"
            >
              <div
                className="absolute top-0 bottom-0 left-0 bg-red-20 dark:bg-red-90 z-0"
                style={{ width: `${getSizePercentage(ask.size)}%` }}
              />
              <div className="grid grid-cols-2 relative z-10">
                <div
                  className="px-4 text-red-60 dark:text-red-40 cursor-pointer hover:underline"
                  onClick={() => handlePriceClick(ask.price)}
                >
                  {formatPrice(ask.price)}
                </div>
                <div className="px-4 text-right text-neutrals-60 dark:text-neutrals-40">
                  {formatSize(ask.size)}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-2 py-1 bg-blueGrey-10 dark:bg-blueGrey-90 border-y border-blueGrey-20 dark:border-blueGrey-80">
        <div className="px-4 flex items-center space-x-2">
          <span className="font-semibold text-neutrals-100 dark:text-neutrals-0">
            {formatPrice(orderBookData.oracle.toString())}
          </span>
          <span className="text-neutrals-50 dark:text-neutrals-40 text-xs">
            {formatPrice(calculateMidpoint())}
          </span>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "40%" }}>
        {orderBookData.bids.map((bid: OrderBookEntry, index: number) => (
          <div
            key={`bid-${index}`}
            className="py-0.5 hover:bg-neutrals-10 dark:hover:bg-neutrals-70 relative"
          >
            <div
              className="absolute top-0 bottom-0 left-0 bg-green-20 dark:bg-green-90 z-0"
              style={{ width: `${getSizePercentage(bid.size)}%` }}
            />
            <div className="grid grid-cols-2 relative z-10">
              <div
                className="px-4 text-green-50 dark:text-green-40 cursor-pointer hover:underline"
                onClick={() => handlePriceClick(bid.price)}
              >
                {formatPrice(bid.price)}
              </div>
              <div className="px-4 text-right text-neutrals-60 dark:text-neutrals-40">
                {formatSize(bid.size)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
