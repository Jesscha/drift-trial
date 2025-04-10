"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUserAccounts } from "./hooks/useUserAccounts";
import { SettingsPanel } from "./components/settings";
import { deposit } from "../services/drift/deposit";
import { useDriftClient } from "./hooks/useDriftClient";
import { useTransactions } from "./hooks/useTransactions";
import { TransactionToasts } from "./components/TransactionToasts";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { userAccount, isLoading, error, refreshUserAccount } =
    useUserAccounts();

  const { isInitialized } = useDriftClient();
  const { trackTransaction } = useTransactions();

  const handleDeposit = async () => {
    try {
      const txhash = await deposit({ amount: 0.1 });
      console.log("txhash", txhash);

      // Track transaction with success actions
      trackTransaction(txhash, "Deposit 0.1 SOL", [
        { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
      ]);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  return (
    <main className="container mx-auto p-4">
      {/* Transaction toast notifications */}
      <TransactionToasts />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-white">
            <h2 className="text-xl font-bold mb-4">Drift Protocol Dashboard</h2>
            <p className="mb-4">
              Welcome to the Drift Protocol trading dashboard. Connect your
              wallet to start trading.
            </p>
            {connected && publicKey && (
              <div className="p-3 bg-gray-700 rounded">
                <p>
                  Connected:{" "}
                  <span className="font-mono">{publicKey.toString()}</span>
                </p>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="bg-gray-800 rounded-lg p-4 text-white">
              <p>Loading account data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-800 rounded-lg p-4 text-white">
              <p>Error loading account data: {error.toString()}</p>
              <button
                onClick={() => refreshUserAccount()}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {userAccount && (
            <div className="bg-gray-800 rounded-lg p-4 text-white">
              <h3 className="text-lg font-bold mb-2">Account Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-gray-400">Total Collateral</p>
                  {/* <p className="font-bold">{userAccount.totalCollateral}</p> */}
                </div>
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-gray-400">Free Collateral</p>
                  {/* <p className="font-bold">{userAccount.freeCollateral}</p> */}
                </div>
              </div>
              <button
                onClick={() => refreshUserAccount()}
                className="mt-4 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>

        <div className="md:col-span-4">
          <SettingsPanel />
        </div>
        <button
          onClick={handleDeposit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Deposit 0.1 SOL
        </button>
      </div>
    </main>
  );
}
