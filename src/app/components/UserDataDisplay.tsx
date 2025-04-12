"use client";

import {
  useParsedUserData,
  ParsedSubaccountData,
} from "../hooks/useParsedUserData";
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
  } = useParsedUserData();

  const [activeSubaccountId, setActiveSubaccountId] = useState<number | null>(
    subaccounts.length > 0 ? subaccounts[0].subaccountId : null
  );

  // Format BN to display as USD value
  const formatUsd = (value: BN | null): string => {
    if (!value) return "N/A";
    return `$${(value.toNumber() / 1e9).toFixed(2)}`;
  };

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading user data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  if (subaccounts.length === 0) {
    return <div className="p-6">No user accounts found.</div>;
  }

  // Find the currently selected subaccount
  const activeSubaccount =
    activeSubaccountId !== null
      ? subaccounts.find((s) => s.subaccountId === activeSubaccountId)
      : subaccounts[0];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">User Portfolio Summary</h2>

      {/* Total Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Total Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Deposits</span>
            <span className="text-xl font-bold">
              {formatUsd(totalDepositAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Unsettled PnL</span>
            <span
              className={`text-xl font-bold ${
                totalUnsettledPnl && totalUnsettledPnl.gt(new BN(0))
                  ? "text-green-600"
                  : totalUnsettledPnl && totalUnsettledPnl.lt(new BN(0))
                  ? "text-red-600"
                  : ""
              }`}
            >
              {formatUsd(totalUnsettledPnl)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Portfolio Value</span>
            <span className="text-xl font-bold">
              {formatUsd(totalNetValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Subaccount Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Subaccounts</h3>
        <div className="flex flex-wrap gap-2">
          {subaccounts.map((subaccount) => (
            <button
              key={`subaccount-${subaccount.subaccountId}`}
              onClick={() => setActiveSubaccountId(subaccount.subaccountId)}
              className={`px-4 py-2 rounded font-medium ${
                subaccount.subaccountId === activeSubaccountId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">
              Subaccount #{activeSubaccount.subaccountId} Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Deposits</span>
                <span className="text-xl font-bold">
                  {formatUsd(activeSubaccount.depositAmount)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Unsettled PnL</span>
                <span
                  className={`text-xl font-bold ${
                    activeSubaccount.netUnsettledPnl.gt(new BN(0))
                      ? "text-green-600"
                      : activeSubaccount.netUnsettledPnl.lt(new BN(0))
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {formatUsd(activeSubaccount.netUnsettledPnl)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Value</span>
                <span className="text-xl font-bold">
                  {formatUsd(activeSubaccount.netTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Positions Table */}
          {activeSubaccount.positions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">
                Subaccount #{activeSubaccount.subaccountId} Positions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Market
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Base Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quote Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        LP Shares
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Oracle Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Unsettled PnL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
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
                              ? "text-green-600"
                              : position.unsettledPnl &&
                                position.unsettledPnl.lt(new BN(0))
                              ? "text-red-600"
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <p className="text-gray-500">
                No active positions found in Subaccount #
                {activeSubaccount.subaccountId}.
              </p>
            </div>
          )}

          {/* Raw Account Data (Collapsible) */}
          <details className="bg-white rounded-lg shadow-md p-6">
            <summary className="text-lg font-medium cursor-pointer focus:outline-none">
              Raw Subaccount #{activeSubaccount.subaccountId} Data
            </summary>
            <div className="mt-4 overflow-x-auto">
              <pre className="text-xs p-4 bg-gray-50 rounded-md">
                {JSON.stringify(
                  activeSubaccount.rawUserAccount,
                  (key, value) => {
                    // Convert BN to string for better readability
                    if (
                      value &&
                      typeof value === "object" &&
                      value.constructor &&
                      value.constructor.name === "BN"
                    ) {
                      return value.toString();
                    }
                    return value;
                  },
                  2
                )}
              </pre>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
