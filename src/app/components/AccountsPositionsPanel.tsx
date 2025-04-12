import { useParsedUserData } from "../hooks/useParsedUserData";
import { formatBN } from "../utils/number";
import { useMarketAccounts } from "../hooks/useMarketAccounts";

export function AccountsPositionsPanel() {
  const {
    subaccounts,
    totalDepositAmount,
    totalUnsettledPnl,
    totalNetValue,
    isLoading,
    error,
  } = useParsedUserData();

  const { markets, isLoading: isLoadingMarkets } = useMarketAccounts();

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-white">
        <p>Loading accounts and positions data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-800 rounded-lg p-4 text-white">
        <p>Error loading accounts data: {error.toString()}</p>
      </div>
    );
  }

  if (!subaccounts || subaccounts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-white">
        <p>
          No accounts found. Please connect your wallet and create an account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Accounts & Positions</h2>

      {/* Overall Summary */}
      <div className="bg-gray-700 rounded-lg p-3 mb-4">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400">Total Deposits</p>
            <p className="font-bold">{formatBN(totalDepositAmount, true)}</p>
          </div>
          <div>
            <p className="text-gray-400">Unsettled PnL</p>
            <p className="font-bold">{formatBN(totalUnsettledPnl, true)}</p>
          </div>
          <div>
            <p className="text-gray-400">Net Value</p>
            <p className="font-bold">{formatBN(totalNetValue, true)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {subaccounts.map((subaccount) => (
          <div
            key={subaccount.subaccountId}
            className="bg-gray-700 rounded-lg p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                Subaccount #{subaccount.subaccountId}
              </h3>
              <div className="text-right">
                <p className="text-sm text-gray-400">Net Value</p>
                <p className="font-bold">
                  {formatBN(subaccount.netTotal, true)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm text-gray-400">Deposits</p>
                <p className="font-medium">
                  {formatBN(subaccount.depositAmount, true)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Unsettled PnL</p>
                <p className="font-medium">
                  {formatBN(subaccount.netUnsettledPnl, true)}
                </p>
              </div>
            </div>

            {/* Positions */}
            {subaccount.positions.length > 0 ? (
              <div>
                <h4 className="font-medium border-b border-gray-600 pb-1 mb-2">
                  Positions
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left py-1">Market</th>
                        <th className="text-right py-1">Base</th>
                        <th className="text-right py-1">Quote</th>
                        <th className="text-right py-1">Oracle Price</th>
                        <th className="text-right py-1">Unsettled PnL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subaccount.positions.map((position) => {
                        const oraclePrice = position.oraclePrice;
                        const marketData = markets[position.marketIndex];

                        return (
                          <tr
                            key={position.marketIndex}
                            className="border-b border-gray-600/30"
                          >
                            <td className="py-2">
                              {isLoadingMarkets
                                ? `Loading market #${position.marketIndex}...`
                                : marketData?.name ||
                                  `Market #${position.marketIndex}`}
                            </td>
                            <td className="text-right py-2">
                              {formatBN(position.baseAmount, false, 5)}
                            </td>
                            <td className="text-right py-2">
                              {formatBN(position.quoteAmount)}
                            </td>
                            <td className="text-right py-2">
                              {oraclePrice
                                ? formatBN(oraclePrice, true)
                                : "N/A"}
                            </td>
                            <td className="text-right py-2">
                              {position.unsettledPnl
                                ? formatBN(position.unsettledPnl, true)
                                : "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">No open positions</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
