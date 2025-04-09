"use client";

import { Subaccount } from "../../utils/mockData";

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
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <h2 className="text-lg font-bold mb-4 text-white flex justify-between items-center">
        Subaccounts
        <span className="text-xs bg-gray-700 text-white px-2 py-1 rounded">
          {subaccounts.length}/8
        </span>
      </h2>

      <div className="space-y-2">
        {subaccounts.map((subaccount) => (
          <div
            key={subaccount.id}
            onClick={() => onSelectSubaccount(subaccount)}
            className={`
              p-3 rounded-lg cursor-pointer transition-colors
              ${
                activeSubaccount.id === subaccount.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }
            `}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{subaccount.name}</span>
              <span className="text-sm">
                ${subaccount.totalValueUSD.toLocaleString()}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-80">
              {subaccount.positions.length} positions ·{" "}
              {subaccount.openOrders.length} orders
            </div>
          </div>
        ))}

        <button className="w-full p-3 mt-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center">
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
    </div>
  );
}
