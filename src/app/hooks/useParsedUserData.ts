import { BASE_PRECISION, BN, UserAccount } from "@drift-labs/sdk";
import { useUserAccounts } from "./useUserAccounts";
import { useMemo } from "react";
import { getPerpOraclePrice } from "@/services/drift/market";
import useSWR from "swr";
import { useDriftClient } from "./useDriftClient";

// Type for parsed subaccount data
export type ParsedSubaccountData = {
  subaccountId: number;
  depositAmount: BN;
  netUnsettledPnl: BN;
  netTotal: BN;
  positions: {
    marketIndex: number;
    baseAmount: BN;
    quoteAmount: BN;
    lpShares: BN;
    unsettledPnl: BN | null;
    oraclePrice: BN | null;
  }[];
  rawUserAccount: UserAccount;
};

export type ParsedUserDataResult = {
  subaccounts: ParsedSubaccountData[];
  totalDepositAmount: BN | null;
  totalUnsettledPnl: BN | null;
  totalNetValue: BN | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
};

export function useParsedUserData(): ParsedUserDataResult {
  const { isInitialized } = useDriftClient();
  const {
    userAccount,
    isLoading: isUserLoading,
    error: userError,
  } = useUserAccounts();

  // Create a key for SWR cache that depends on userAccount data
  const swrKey = useMemo(() => {
    if (
      !isInitialized ||
      isUserLoading ||
      !userAccount ||
      userAccount.length === 0
    ) {
      return null;
    }

    // This ensures SWR will revalidate when userAccount changes
    return `parsedUserData-${userAccount
      .map((acc) => acc.subAccountId)
      .join("-")}`;
  }, [isInitialized, isUserLoading, userAccount]);

  const processUserData = async () => {
    if (!userAccount || userAccount.length === 0) {
      return {
        subaccounts: [],
        totalDepositAmount: null,
        totalUnsettledPnl: null,
        totalNetValue: null,
      };
    }

    try {
      const subaccountsData: ParsedSubaccountData[] = [];

      for (const account of userAccount) {
        const depositAmount = account.totalDeposits
          .sub(account.totalWithdraws)
          .add(account.settledPerpPnl);

        let netUnsettledPnl = new BN(0);
        const positions: {
          marketIndex: number;
          baseAmount: BN;
          quoteAmount: BN;
          lpShares: BN;
          unsettledPnl: BN | null;
          oraclePrice: BN | null;
        }[] = [];

        for (const position of account.perpPositions) {
          if (
            !position.baseAssetAmount.isZero() ||
            !position.quoteAssetAmount.isZero() ||
            !position.lpShares.isZero()
          ) {
            // Fetch price directly
            const oraclePrice = await getPerpOraclePrice(position.marketIndex);

            let positionUnsettledPnl: BN | null = null;

            if (oraclePrice) {
              const positionValue = position.baseAssetAmount
                .mul(oraclePrice)
                .div(BASE_PRECISION);

              positionUnsettledPnl = positionValue.add(
                position.quoteEntryAmount
              );

              netUnsettledPnl = netUnsettledPnl.add(positionUnsettledPnl);
            }

            positions.push({
              marketIndex: position.marketIndex,
              baseAmount: position.baseAssetAmount,
              quoteAmount: position.quoteAssetAmount,
              lpShares: position.lpShares,
              unsettledPnl: positionUnsettledPnl,
              oraclePrice: oraclePrice,
            });
          }
        }

        subaccountsData.push({
          subaccountId: account.subAccountId,
          depositAmount,
          netUnsettledPnl,
          netTotal: depositAmount.add(netUnsettledPnl),
          positions,
          rawUserAccount: account,
        });
      }

      // Calculate totals across all subaccounts
      let totalDepositAmount = new BN(0);
      let totalUnsettledPnl = new BN(0);

      subaccountsData.forEach((subaccount) => {
        totalDepositAmount = totalDepositAmount.add(subaccount.depositAmount);
        totalUnsettledPnl = totalUnsettledPnl.add(subaccount.netUnsettledPnl);
      });

      const totalNetValue = totalDepositAmount.add(totalUnsettledPnl);

      return {
        subaccounts: subaccountsData,
        totalDepositAmount,
        totalUnsettledPnl,
        totalNetValue,
      };
    } catch (error) {
      console.error("Error processing user data:", error);
      throw error;
    }
  };

  const { data, error, isLoading, mutate } = useSWR(swrKey, processUserData, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 5000, // Refresh every 5 seconds
    shouldRetryOnError: true,
    errorRetryCount: 3,
  });

  const result: ParsedUserDataResult = {
    subaccounts: data?.subaccounts || [],
    totalDepositAmount: data?.totalDepositAmount || null,
    totalUnsettledPnl: data?.totalUnsettledPnl || null,
    totalNetValue: data?.totalNetValue || null,
    isLoading: isUserLoading || isLoading,
    error: error
      ? error instanceof Error
        ? error
        : new Error(String(error))
      : userError
      ? userError instanceof Error
        ? userError
        : new Error(String(userError))
      : null,
    refresh: mutate,
  };

  return result;
}
