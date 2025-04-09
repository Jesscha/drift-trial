"use client";

import { Subaccount } from "../../utils/mockData";

interface SubaccountDetailsProps {
  subaccount: Subaccount;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SubaccountDetails({
  subaccount,
  activeTab,
  setActiveTab,
}: SubaccountDetailsProps) {
  // Calculate total PnL for positions
  const totalPnL = subaccount.positions.reduce(
    (sum, position) => sum + position.pnl,
    0
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="border-b border-gray-700 mb-4">
        <ul className="flex space-x-4">
          <li>
            <button
              onClick={() => setActiveTab("balances")}
              className={`pb-2 px-1 ${
                activeTab === "balances"
                  ? "text-orange-500 border-b-2 border-orange-500 font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Balances
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("positions")}
              className={`pb-2 px-1 ${
                activeTab === "positions"
                  ? "text-orange-500 border-b-2 border-orange-500 font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Positions
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-2 px-1 ${
                activeTab === "orders"
                  ? "text-orange-500 border-b-2 border-orange-500 font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Open Orders
            </button>
          </li>
        </ul>
      </div>

      {/* Balances Tab */}
      {activeTab === "balances" && (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-2">Asset</th>
                  <th className="px-4 py-2">Available</th>
                  <th className="px-4 py-2">In Orders</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">USD Value</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subaccount.balances.map((token, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 text-white"
                  >
                    <td className="px-4 py-3 font-medium">{token.asset}</td>
                    <td className="px-4 py-3">
                      {token.available.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {token.inOrders.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {token.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      ${token.usdValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                          Deposit
                        </button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                          Withdraw
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-white">
                  <td colSpan={4} className="px-4 py-3 text-right font-medium">
                    Total Portfolio Value:
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ${subaccount.totalValueUSD.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === "positions" && (
        <div>
          {subaccount.positions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No positions open
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-2">Market</th>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Entry Price</th>
                    <th className="px-4 py-2">Mark Price</th>
                    <th className="px-4 py-2">PnL</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subaccount.positions.map((position, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 text-white"
                    >
                      <td className="px-4 py-3 font-medium">
                        {position.market}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          position.size.includes("L")
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {position.size}
                      </td>
                      <td className="px-4 py-3">
                        ${position.entryPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ${position.markPrice.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          position.pnl >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        ${position.pnl.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-white">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-right font-medium"
                    >
                      Total Unrealized PnL:
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        totalPnL >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      ${totalPnL.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          {subaccount.openOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No open orders
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-2">Market</th>
                    <th className="px-4 py-2">Side</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subaccount.openOrders.map((order, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 text-white"
                    >
                      <td className="px-4 py-3 font-medium">{order.market}</td>
                      <td
                        className={`px-4 py-3 ${
                          order.side === "Long"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {order.side}
                      </td>
                      <td className="px-4 py-3">{order.type}</td>
                      <td className="px-4 py-3">{order.size}</td>
                      <td className="px-4 py-3">
                        ${order.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.status === "Open"
                              ? "bg-blue-900 text-blue-300"
                              : order.status === "Triggered"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-green-900 text-green-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
