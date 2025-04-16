import { useState } from "react";
import { formatBN } from "../../utils/number";
import { AccountSummary } from "./AccountSummary";
import { PositionsTable } from "./PositionsTable";
import { OrdersTable } from "./OrdersTable";
import { ChevronDownIcon } from "../../assets/icons";

interface AccountCardProps {
  account: any;
  markets: any;
  isLoadingMarkets: boolean;
  processingTx: number | null;
  onDeposit?: (account: any) => void;
  onWithdraw?: (account: any) => void;
  viewOnly?: boolean;
}

export function AccountCard({
  account,
  markets,
  isLoadingMarkets,
  processingTx,
  onDeposit,
  onWithdraw,
  viewOnly = false,
}: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeOrders = account.orders.filter(
    (order: any) => order.status && "open" in order.status
  );
  const accountName = String.fromCharCode(...account.name).trim();

  return (
    <div className="border border-neutrals-20 dark:border-neutrals-70 rounded-lg overflow-hidden shadow-sm">
      {/* Account Header */}
      <div
        className="bg-neutrals-5 dark:bg-neutrals-90 p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-full h-8 w-8 flex items-center justify-center">
            <span className="text-sm font-semibold text-purple-50">
              #{account.subAccountId}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-base">{accountName}</h3>
            <div className="flex items-center mt-1">
              <span className="text-xs px-2 py-0.5 bg-neutrals-10 dark:bg-neutrals-80 rounded-full text-neutrals-60 dark:text-neutrals-40">
                {account.perpPositions.length} positions
              </span>
              <span className="mx-1 text-xs text-neutrals-60 dark:text-neutrals-40">
                •
              </span>
              <span className="text-xs px-2 py-0.5 bg-neutrals-10 dark:bg-neutrals-80 rounded-full text-neutrals-60 dark:text-neutrals-40">
                {activeOrders.length} orders
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-xs text-neutrals-60 dark:text-neutrals-40">
              Net Value
            </p>
            <p className="font-bold">${formatBN(account.netTotal, true)}</p>
          </div>
          {!viewOnly && onDeposit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeposit(account);
              }}
              disabled={processingTx === account.subAccountId}
              className={`px-3 py-1.5 rounded-md text-sm ${
                processingTx === account.subAccountId
                  ? "bg-green-50/70 cursor-not-allowed"
                  : "bg-green-50 hover:bg-green-60"
              } text-white transition-colors font-medium`}
            >
              Deposit
            </button>
          )}
          {!viewOnly && onWithdraw && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw(account);
              }}
              disabled={processingTx === account.subAccountId}
              className={`px-3 py-1.5 rounded-md text-sm ${
                processingTx === account.subAccountId
                  ? "bg-red-50/70 cursor-not-allowed"
                  : "bg-red-50 hover:bg-red-60"
              } text-white transition-colors font-medium`}
            >
              Withdraw
            </button>
          )}
          <div className="w-5 h-5">
            <ChevronDownIcon
              size="md"
              className={`text-neutrals-60 dark:text-neutrals-40 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Account Details (expanded) */}
      {isExpanded && (
        <div className="p-5 bg-neutrals-5 dark:bg-neutrals-90">
          {/* Account Summary Details */}
          <AccountSummary
            depositAmount={account.depositAmount}
            netUnsettledPnl={account.netUnsettledPnl}
            netTotal={account.netTotal}
          />

          {/* Positions Section */}
          <div className="mt-6">
            <h4 className="text-base font-medium mb-3 text-neutrals-100 dark:text-neutrals-10">
              Positions
            </h4>
            <div className="overflow-x-auto bg-neutrals-10 dark:bg-neutrals-80 rounded-lg">
              <PositionsTable
                positions={account.perpPositions}
                markets={markets}
                isLoadingMarkets={isLoadingMarkets}
                viewOnly={viewOnly}
              />
            </div>
          </div>

          {/* Orders Section */}
          <div className="mt-6">
            <h4 className="text-base font-medium mb-3 text-neutrals-100 dark:text-neutrals-10">
              Orders
            </h4>
            <div className="overflow-x-auto bg-neutrals-10 dark:bg-neutrals-80 rounded-lg">
              <OrdersTable
                orders={activeOrders}
                markets={markets}
                isLoadingMarkets={isLoadingMarkets}
                viewOnly={viewOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
