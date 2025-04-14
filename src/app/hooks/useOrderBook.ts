import { DRIFT_DLOB_ENDPOINT } from "@/constants";
import useSWR from "swr";

export const useOrderBook = (marketName?: string) => {
  const url = `${DRIFT_DLOB_ENDPOINT}/l2?marketName=${marketName?.trim()}&depth=10&includeVamm=true`;

  const { data, error, isLoading, mutate } = useSWR(
    marketName ? url : null,
    async () => {
      const response = await fetch(url);
      const data = await response.json();

      return data;
    }
  );

  return { data, error, isLoading, mutate };
};
