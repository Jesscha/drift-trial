"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { deposit } from "../services/drift/deposit";
import { useTransactions } from "./hooks/useTransactions";
import { TransactionToasts } from "./components/TransactionToasts";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { TradingModal } from "./components/modal/TradingModal";
import { useActiveAccount } from "./providers/ActiveAccountProvider";
import { OrderType, PositionDirection } from "@drift-labs/sdk";
import { useState } from "react";
import { AccountsPositionsPanel } from "./components/accounts";
import { TxModalController } from "./components/TxModalController";

export default function Home() {
  const { connected } = useWallet();
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

  return (
    <main className="container mx-auto p-4">
      <TransactionToasts />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8">
          {connected && <AccountsPositionsPanel />}
        </div>

        <div className="md:col-span-4 ">
          {connected && <TxModalController />}
        </div>
      </div>
    </main>
  );
}
