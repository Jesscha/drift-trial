"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TransactionToasts } from "./components/TransactionToasts";
import { AccountsPositionsPanel } from "./components/accounts";
import { TradingModalController } from "./components/TradingModalController";

export default function Home() {
  const { connected } = useWallet();

  return (
    <main className="container mx-auto p-4">
      <TransactionToasts />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {connected ? (
          <>
            <div className="md:col-span-8">
              <AccountsPositionsPanel />
            </div>
            <div className="md:col-span-4">
              <TradingModalController />
            </div>
          </>
        ) : (
          <div className="md:col-span-12">
            <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-8 text-center">
              <h1 className="text-2xl font-bold mb-4 text-neutrals-100 dark:text-neutrals-10">
                Welcome to Drift Dashboard
              </h1>
              <p className="text-neutrals-80 dark:text-neutrals-20 mb-6">
                Connect your Solana wallet to view your accounts and start
                trading
              </p>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-primary-gradient hover:!opacity-90" />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
