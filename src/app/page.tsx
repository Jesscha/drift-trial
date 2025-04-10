"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUserAccounts } from "./hooks/useUserAccounts";
import { SettingsPanel } from "./components/settings";
import { deposit } from "../services/drift/deposit";
import { useDriftClient } from "./hooks/useDriftClient";
import { useTransactions } from "./hooks/useTransactions";
import { TransactionToasts } from "./components/TransactionToasts";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { Modal } from "./components/Modal";
import { useModal } from "./hooks/useModal";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { userAccount, isLoading, error, refreshUserAccount } =
    useUserAccounts();

  const { isInitialized } = useDriftClient();
  const { trackTransaction } = useTransactions();
  const { isOpen, open, close } = useModal(false);

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

  // Modal footer with action buttons
  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={close}
        className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Close
      </button>
      <button
        onClick={() => {
          // Handle action here
          close();
        }}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
      >
        Confirm
      </button>
    </div>
  );

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
        <div className="md:col-span-12 flex space-x-4">
          <button
            onClick={handleDeposit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Deposit 0.1 SOL
          </button>
          <button
            onClick={open}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Open Modal
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Drift Protocol Modal"
        footer={modalFooter}
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            This is your Drift Protocol modal. You can add any content here
            related to your blockchain operations.
          </p>

          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-medium text-white mb-2">Blockchain Actions:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Execute smart contract transactions</li>
              <li>View transaction history</li>
              <li>Manage token approvals</li>
              <li>Configure blockchain settings</li>
            </ul>
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter transaction amount"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}
