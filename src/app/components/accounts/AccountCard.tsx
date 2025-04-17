import { useState } from "react";
import { formatBN } from "../../utils/number";
import { PositionsTable } from "./PositionsTable";
import { OrdersTable } from "./OrdersTable";
import { ChevronDownIcon } from "../../assets/icons";
import { UserAccountWithPNL } from "../../hooks/usePNLUserData";
import { MarketData } from "../../hooks/usePerpMarketAccounts";

interface AccountCardProps {
  account: UserAccountWithPNL;
  markets: Record<number, MarketData>;
  isLoadingMarkets: boolean;
  processingTx: number | null;
  onDeposit?: (account: UserAccountWithPNL) => void;
  onWithdraw?: (account: UserAccountWithPNL) => void;
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
    (order) => order.status && "open" in order.status
  );
  const accountName = String.fromCharCode(...account.name).trim();

  return (
    <div className="border border-neutrals-20 dark:border-neutrals-70 rounded-lg overflow-hidden shadow-sm">
      <div
        className="bg-neutrals-5 dark:bg-neutrals-90 p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-80">
            <h3 className="font-medium text-base">{accountName}</h3>
            <div className="flex items-center mt-1">
              <span className="text-xs px-2 py-0.5 bg-neutrals-10 dark:bg-neutrals-70 rounded-full text-neutrals-60 dark:text-neutrals-40">
                {account.perpPositions.length} positions
              </span>
              <span className="mx-1 text-xs text-neutrals-60 dark:text-neutrals-40">
                •
              </span>
              <span className="text-xs px-2 py-0.5 bg-neutrals-10 dark:bg-neutrals-70 rounded-full text-neutrals-60 dark:text-neutrals-40">
                {activeOrders.length} orders
              </span>
            </div>
          </div>
          <div className="flex w-full justify-around">
            <div className="mr-4">
              <p className="text-xs text-neutrals-60 dark:text-neutrals-40">
                Deposit
              </p>
              <p className="font-medium">
                ${formatBN(account.depositAmount, true)}
              </p>
            </div>
            <div className="mr-4">
              <p className="text-xs text-neutrals-60 dark:text-neutrals-40">
                Unsettled PnL
              </p>
              <p
                className={`font-medium ${
                  parseFloat(account.netUnsettledPnl.toString()) >= 0
                    ? "text-green-50"
                    : "text-red-50"
                }`}
              >
                ${formatBN(account.netUnsettledPnl, true)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutrals-60 dark:text-neutrals-40">
                Net Value
              </p>
              <p>${formatBN(account.netTotal, true)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!viewOnly && onDeposit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeposit(account);
              }}
              disabled={processingTx === account.subAccountId}
              className={`px-3 py-1.5 rounded-md text-sm ${
                processingTx === account.subAccountId
                  ? "bg-blue-100/70 cursor-not-allowed"
                  : "bg-blue-100 hover:bg-blue-200"
              } text-neutrals-100 transition-colors font-medium`}
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
                  ? "bg-blue-100/70 cursor-not-allowed"
                  : "bg-blue-100 hover:bg-blue-200"
              } text-neutrals-100 transition-colors font-medium`}
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
          {/* Positions Section */}
          <div>
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
