import { useState } from "react";
import { formatBN } from "../../utils/number";
import { AccountSummary } from "./AccountSummary";
import { PositionsTable } from "./PositionsTable";
import { OrdersTable } from "./OrdersTable";

interface AccountCardProps {
  account: any;
  markets: any;
  isLoadingMarkets: boolean;
  processingTx: number | null;
  onDeposit: (account: any) => void;
  onWithdraw: (account: any) => void;
}

export function AccountCard({
  account,
  markets,
  isLoadingMarkets,
  processingTx,
  onDeposit,
  onWithdraw,
}: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeOrders = account.orders.filter(
    (order: any) => order.status && "open" in order.status
  );

  return (
    <div className="border border-neutrals-30 dark:border-neutrals-60 rounded-lg overflow-hidden">
      {/* Account Header */}
      <div
        className="bg-neutrals-20 dark:bg-neutrals-70 p-3 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <h3 className="font-bold mr-2">Subaccount #{account.subAccountId}</h3>
          <span className="text-xs px-2 py-0.5 bg-neutrals-30 dark:bg-neutrals-60 rounded-full">
            {account.perpPositions.length} positions • {activeOrders.length}{" "}
            orders
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-xs text-neutrals-60 dark:text-neutrals-40">
              Net Value
            </p>
            <p className="font-bold">{formatBN(account.netTotal, true)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeposit(account);
            }}
            disabled={processingTx === account.subAccountId}
            className={`px-3 py-1 rounded text-sm ${
              processingTx === account.subAccountId
                ? "bg-green-60 opacity-70 cursor-not-allowed"
                : "bg-green-50 hover:bg-green-60"
            } text-white transition-colors`}
          >
            Deposit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw(account);
            }}
            disabled={processingTx === account.subAccountId}
            className={`px-3 py-1 rounded text-sm ${
              processingTx === account.subAccountId
                ? "bg-red-60 opacity-70 cursor-not-allowed"
                : "bg-red-50 hover:bg-red-60"
            } text-white transition-colors`}
          >
            Withdraw
          </button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Account Details (expanded) */}
      {isExpanded && (
        <div className="p-4">
          {/* Account Summary Details */}
          <AccountSummary
            depositAmount={account.depositAmount}
            netUnsettledPnl={account.netUnsettledPnl}
            netTotal={account.netTotal}
          />

          {/* Positions Section */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Positions</h4>
            <div className="overflow-x-auto">
              <PositionsTable
                positions={account.perpPositions}
                markets={markets}
                isLoadingMarkets={isLoadingMarkets}
              />
            </div>
          </div>

          {/* Orders Section */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Orders</h4>
            <div className="overflow-x-auto">
              <OrdersTable
                orders={activeOrders}
                markets={markets}
                isLoadingMarkets={isLoadingMarkets}
              />
            </div>
          </div>

          {/* Action button to create new positions/orders */}
          <div className="mt-4 flex justify-center">
            {!account.perpPositions.length && !activeOrders.length && (
              <button className="px-4 py-2 bg-blue-50 hover:bg-blue-60 text-white rounded transition-colors">
                Open a Position
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
