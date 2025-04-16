import {
  BASE_PRECISION,
  BN,
  PerpPosition,
  PublicKey,
  UserAccount,
} from "@drift-labs/sdk";
import { useUserAccounts } from "./useUserAccounts";
import { useMemo } from "react";
import { getPerpOraclePrice } from "@/services/drift/market";
import useSWR from "swr";

export type PerpPositionWithPNL = PerpPosition & {
  unsettledPnl: BN | null;
  oraclePrice: BN | null;
};

// Type for parsed subaccount data
export type UserAccountWithPNL = Omit<UserAccount, "perpPositions"> & {
  depositAmount: BN;
  netUnsettledPnl: BN;
  netTotal: BN;
  perpPositions: PerpPositionWithPNL[];
};

export type PNLUserDataResult = {
  subaccounts: UserAccountWithPNL[];
  totalDepositAmount: BN | null;
  totalUnsettledPnl: BN | null;
  totalNetValue: BN | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
};

export function usePNLUserData(
  publicKey?: PublicKey | null
): PNLUserDataResult {
  const {
    userAccount,
    isLoading: isUserLoading,
    error: userError,
  } = useUserAccounts(publicKey);

  const swrKey = useMemo(() => {
    if (
      isUserLoading ||
      !userAccount ||
      !publicKey ||
      userAccount.length === 0
    ) {
      return null;
    }

    return `parsedUserData-${publicKey.toBase58()}`;
  }, [isUserLoading, userAccount]);

  const injectOraclePriceToUserAccounts = async () => {
    if (!userAccount || userAccount.length === 0) {
      return {
        subaccounts: [],
        totalDepositAmount: null,
        totalUnsettledPnl: null,
        totalNetValue: null,
      };
    }

    try {
      const subaccountsData: UserAccountWithPNL[] = [];

      for (const account of userAccount) {
        const depositAmount = account.totalDeposits
          .sub(account.totalWithdraws)
          .add(account.settledPerpPnl);

        let netUnsettledPnl = new BN(0);
        const positions: PerpPositionWithPNL[] = [];

        for (const position of account.perpPositions) {
          if (
            !position.baseAssetAmount.isZero() &&
            !position.quoteAssetAmount.isZero()
          ) {
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
              ...position,
              unsettledPnl: positionUnsettledPnl,
              oraclePrice: oraclePrice,
            });
          }
        }
        const netTotal = depositAmount.add(netUnsettledPnl);

        subaccountsData.push({
          ...account,
          depositAmount,
          netUnsettledPnl,
          netTotal,
          perpPositions: positions,
        });
      }

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

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    injectOraclePriceToUserAccounts,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Refresh every 5 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  const result: PNLUserDataResult = {
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
