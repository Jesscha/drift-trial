"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { deposit } from "../services/drift/deposit";
import { useTransactions } from "./hooks/useTransactions";
import { TransactionToasts } from "./components/TransactionToasts";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { TradingModal } from "./components/modal/TradingModal";
import { useActiveAccount } from "./providers/ActiveAccountProvider";
import { formatBN } from "./utils/number";
import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { useState } from "react";
import { AccountsPositionsPanel } from "./components/accounts";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { trackTransaction } = useTransactions();

  const [isOpen, setIsOpen] = useState(false);

  const handleTxModalOpen = () => {
    setIsOpen(true);
  };

  const handleDeposit = async () => {
    try {
      const txhash = await deposit({ amount: 0.1 });

      trackTransaction(txhash, "Deposit 0.1 SOL", [
        { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
      ]);
    } catch (error) {}
  };

  const {
    switchActiveAccount,
    getUserAccountPublicKey,
    getFreeCollateral,
    activeAccountId,
  } = useActiveAccount();

  return (
    <main className="container mx-auto p-4">
      <TransactionToasts />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8">
          {connected && <AccountsPositionsPanel />}
        </div>

        <div className="md:col-span-12 flex space-x-4">
          <button
            onClick={handleDeposit}
            className="bg-purple-50 hover:bg-purple-60 text-white px-4 py-2 rounded-md transition-colors"
          >
            Deposit 0.1 SOL
          </button>
          <button
            onClick={handleTxModalOpen}
            className="bg-green-50 hover:bg-green-60 text-white px-4 py-2 rounded-md transition-colors"
          >
            Open Modal
          </button>
        </div>
      </div>

      <div>
        <p>Active Account: {getUserAccountPublicKey()?.toString()}</p>
        <p>Active Account ID: {activeAccountId}</p>
        {/* free collateral */}
        <p>Free Collateral: {formatBN(getFreeCollateral(), true)}</p>
      </div>

      <button onClick={() => switchActiveAccount(1)}>
        Switch to Account 1
      </button>

      {/* Trading Modal */}
      <TradingModal
        marketIndex={0}
        orderDirection={PositionDirection.LONG}
        orderType={OrderType.MARKET}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </main>
  );
}
