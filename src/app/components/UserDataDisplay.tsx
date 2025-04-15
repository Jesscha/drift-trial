"use client";

import { usePNLUserData, UserAccountWithPNL } from "../hooks/usePNLUserData";
import { BN } from "@drift-labs/sdk";
import { useState } from "react";

/**
 * Component to display detailed user data for all subaccounts
 */
export function UserDataDisplay() {
  const {
    subaccounts,
    totalDepositAmount,
    totalUnsettledPnl,
    totalNetValue,
    isLoading,
    error,
  } = usePNLUserData();

  const [activeSubaccountId, setActiveSubaccountId] = useState<number | null>(
    subaccounts.length > 0 ? subaccounts[0].subaccountId : null
  );

  // Format BN to display as USD value
  const formatUsd = (value: BN | null): string => {
    if (!value) return "N/A";
    return `$${(value.toNumber() / 1e9).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 text-neutrals-60 dark:text-neutrals-40">
        Loading user data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-60 dark:text-red-40">
        Error: {error.message}
      </div>
    );
  }

  if (subaccounts.length === 0) {
    return (
      <div className="p-6 text-neutrals-100 dark:text-neutrals-0">
        No user accounts found.
      </div>
    );
  }

  // Find the currently selected subaccount
  const activeSubaccount =
    activeSubaccountId !== null
      ? subaccounts.find((s) => s.subaccountId === activeSubaccountId)
      : subaccounts[0];

  return (
    <div className="p-6 text-neutrals-100 dark:text-neutrals-0">
      <h2 className="text-xl font-bold mb-6">User Portfolio Summary</h2>

      {/* Total Summary Card */}
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Total Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
              Total Deposits
            </span>
            <span className="text-xl font-bold">
              {formatUsd(totalDepositAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
              Total Unsettled PnL
            </span>
            <span
              className={`text-xl font-bold ${
                totalUnsettledPnl && totalUnsettledPnl.gt(new BN(0))
                  ? "text-green-50 dark:text-green-40"
                  : totalUnsettledPnl && totalUnsettledPnl.lt(new BN(0))
                  ? "text-red-60 dark:text-red-40"
                  : ""
              }`}
            >
              {formatUsd(totalUnsettledPnl)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
              Total Portfolio Value
            </span>
            <span className="text-xl font-bold">
              {formatUsd(totalNetValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Subaccount Selector */}
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Subaccounts</h3>
        <div className="flex flex-wrap gap-2">
          {subaccounts.map((subaccount) => (
            <button
              key={`subaccount-${subaccount.subaccountId}`}
              onClick={() => setActiveSubaccountId(subaccount.subaccountId)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                subaccount.subaccountId === activeSubaccountId
                  ? "bg-purple-50 hover:bg-purple-60 text-white"
                  : "bg-neutrals-20 dark:bg-neutrals-70 text-neutrals-100 dark:text-neutrals-0 hover:bg-neutrals-30 dark:hover:bg-neutrals-60"
              }`}
            >
              Subaccount #{subaccount.subaccountId}
            </button>
          ))}
        </div>
      </div>

      {activeSubaccount && (
        <>
          {/* Selected Subaccount Summary */}
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">
              Subaccount #{activeSubaccount.subaccountId} Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Deposits
                </span>
                <span className="text-xl font-bold">
                  {formatUsd(activeSubaccount.depositAmount)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Unsettled PnL
                </span>
                <span
                  className={`text-xl font-bold ${
                    activeSubaccount.netUnsettledPnl.gt(new BN(0))
                      ? "text-green-50 dark:text-green-40"
                      : activeSubaccount.netUnsettledPnl.lt(new BN(0))
                      ? "text-red-60 dark:text-red-40"
                      : ""
                  }`}
                >
                  {formatUsd(activeSubaccount.netUnsettledPnl)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Total Value
                </span>
                <span className="text-xl font-bold">
                  {formatUsd(activeSubaccount.netTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Positions Table */}
          {activeSubaccount.positions.length > 0 ? (
            <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">
                Subaccount #{activeSubaccount.subaccountId} Positions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-neutrals-20 dark:bg-neutrals-70">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutrals-60 dark:text-neutrals-40 uppercase">
                        Market
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutrals-60 dark:text-neutrals-40 uppercase">
                        Base Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutrals-60 dark:text-neutrals-40 uppercase">
                        Quote Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutrals-60 dark:text-neutrals-40 uppercase">
                        LP Shares
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutrals-60 dark:text-neutrals-40 uppercase">
                        Oracle Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-neutrals-60 dark:text-neutrals-40 uppercase">
                        Unsettled PnL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutrals-30 dark:divide-neutrals-60">
                    {activeSubaccount.positions.map((position) => (
                      <tr key={`position-${position.marketIndex}`}>
                        <td className="px-4 py-3">
                          Market #{position.marketIndex}
                        </td>
                        <td className="px-4 py-3">
                          {position.baseAmount.toString()}
                        </td>
                        <td className="px-4 py-3">
                          {position.quoteAmount.toString()}
                        </td>
                        <td className="px-4 py-3">
                          {position.lpShares.toString()}
                        </td>
                        <td className="px-4 py-3">
                          {formatUsd(position.oraclePrice)}
                        </td>
                        <td
                          className={`px-4 py-3 ${
                            position.unsettledPnl &&
                            position.unsettledPnl.gt(new BN(0))
                              ? "text-green-50 dark:text-green-40"
                              : position.unsettledPnl &&
                                position.unsettledPnl.lt(new BN(0))
                              ? "text-red-60 dark:text-red-40"
                              : ""
                          }`}
                        >
                          {formatUsd(position.unsettledPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg shadow-md p-6 mb-6">
              <p className="text-neutrals-60 dark:text-neutrals-40 italic">
                No positions found for Subaccount #
                {activeSubaccount.subaccountId}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
