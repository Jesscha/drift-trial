import { DRIFT_DLOB_ENDPOINT } from "@/constants";
import useSWR from "swr";
export interface OrderBookEntry {
  price: string;
  size: string;
  sources?: {
    dlob?: string;
    vamm?: string;
  };
}
export interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  marketName: string;
  marketType: string;
  marketIndex: number;
  ts: number;
  slot: number;
  oracle: number;
  oracleData: {
    price: string;
    slot: string;
    confidence: string;
    hasSufficientNumberOfDataPoints: boolean;
    twap: string;
    twapConfidence: string;
  };
  marketSlot: number;
}

export const useOrderBook = (marketName?: string) => {
  const url = `${DRIFT_DLOB_ENDPOINT}/l2?marketName=${marketName?.trim()}&depth=10&includeVamm=true`;

  const { data, error, isLoading, mutate } = useSWR(
    marketName ? url : null,
    async () => {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      return data;
    }
  );

  return { data, error, isLoading, mutate };
};
