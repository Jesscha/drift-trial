"use client";

import { Subaccount } from "../../utils/mockData";
import { DepositWithdrawModal } from "../modal/DepositWithdrawModal";
import { useDepositWithdrawModal } from "../../hooks/useDepositWithdrawModal";

interface SubaccountPanelProps {
  subaccounts: Subaccount[];
  activeSubaccount: Subaccount;
  onSelectSubaccount: (subaccount: Subaccount) => void;
}

export default function SubaccountPanel({
  subaccounts,
  activeSubaccount,
  onSelectSubaccount,
}: SubaccountPanelProps) {
  const { isOpen, mode, subaccount, openDeposit, openWithdraw, close } =
    useDepositWithdrawModal();

  const handleDepositClick = (subaccount: Subaccount, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent subaccount selection when clicking the button
    openDeposit(subaccount);
  };

  const handleWithdrawClick = (subaccount: Subaccount, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent subaccount selection when clicking the button
    openWithdraw(subaccount);
  };

  return (
    <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 h-full">
      <h2 className="text-lg font-bold mb-4 text-neutrals-100 dark:text-neutrals-0 flex justify-between items-center">
        Subaccounts
        <span className="text-xs bg-neutrals-20 dark:bg-neutrals-70 text-neutrals-100 dark:text-neutrals-0 px-2 py-1 rounded">
          {subaccounts.length}/8
        </span>
      </h2>

      <div className="space-y-2">
        {subaccounts.map((account) => (
          <div
            key={account.id}
            onClick={() => onSelectSubaccount(account)}
            className={`
              p-3 rounded-lg cursor-pointer transition-colors
              ${
                activeSubaccount.id === account.id
                  ? "bg-purple-50 text-white"
                  : "bg-neutrals-20 dark:bg-neutrals-70 text-neutrals-100 dark:text-neutrals-0 hover:bg-neutrals-30 dark:hover:bg-neutrals-60"
              }
            `}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{account.name}</span>
              <span className="text-sm">
                ${account.totalValueUSD.toLocaleString()}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-80">
              {account.positions.length} positions · {account.openOrders.length}{" "}
              orders
            </div>

            {/* Deposit and Withdraw buttons */}
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={(e) => handleDepositClick(account, e)}
                className={`px-2 py-1 text-xs rounded ${
                  activeSubaccount.id === account.id
                    ? "bg-green-60 hover:bg-green-70 text-white"
                    : "bg-green-50 hover:bg-green-60 text-white"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={(e) => handleWithdrawClick(account, e)}
                className={`px-2 py-1 text-xs rounded ${
                  activeSubaccount.id === account.id
                    ? "bg-red-60 hover:bg-red-70 text-white"
                    : "bg-red-50 hover:bg-red-60 text-white"
                }`}
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}

        <button className="w-full p-3 mt-4 bg-neutrals-20 dark:bg-neutrals-70 text-neutrals-100 dark:text-neutrals-0 rounded-lg hover:bg-neutrals-30 dark:hover:bg-neutrals-60 flex items-center justify-center transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create New Subaccount
        </button>
      </div>

      {/* Deposit and Withdraw Modal */}
      <DepositWithdrawModal
        isOpen={isOpen}
        onClose={close}
        initialMode={mode}
        marketIndex={0} // Default to USDC market
        subaccountId={subaccount?.id}
        maxAmount={subaccount?.totalValueUSD || 0}
      />
    </div>
  );
}
