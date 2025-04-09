"use client";

import { useState } from "react";
import Header from "./layout/Header";
import SubaccountPanel from "./subaccounts/SubaccountPanel";
import SubaccountDetails from "./subaccounts/SubaccountDetails";
import TradingPanel from "./trading/TradingPanel";
import { mockSubaccounts } from "../utils/mockData";

export default function DriftDashboard() {
  const [activeSubaccount, setActiveSubaccount] = useState(mockSubaccounts[0]);
  const [activeTab, setActiveTab] = useState("balances");

  return (
    <div className="w-full flex flex-col bg-gray-900 text-white min-h-screen">
      <Header />

      <div className="flex flex-col md:flex-row p-4 gap-4 flex-grow">
        <div className="w-full md:w-1/4">
          <SubaccountPanel
            subaccounts={mockSubaccounts}
            activeSubaccount={activeSubaccount}
            onSelectSubaccount={setActiveSubaccount}
          />
        </div>

        <div className="w-full md:w-3/4 flex flex-col gap-4">
          <SubaccountDetails
            subaccount={activeSubaccount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <TradingPanel subaccount={activeSubaccount} />
        </div>
      </div>
    </div>
  );
}
