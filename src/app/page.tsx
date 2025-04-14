"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUserAccounts } from "./hooks/useUserAccounts";
import { SettingsPanel } from "./components/settings";
import { deposit } from "../services/drift/deposit";
import { useTransactions } from "./hooks/useTransactions";
import { TransactionToasts } from "./components/TransactionToasts";
import { TransactionSuccessActionType } from "@/services/txTracker/txTracker";
import { Modal } from "./components/modal/Modal";
import { useModal } from "./hooks/useModal";
import { useParsedUserData } from "./hooks/useParsedUserData";
import useSWR from "swr";
import { BN, OrderType } from "@drift-labs/sdk";
import { AccountsPositionsPanel } from "./components/AccountsPositionsPanel";
import { TradingModal } from "./components/modal/TradingModal";
import { useActiveAccount } from "./hooks/useActiveAccount";
import { formatBN } from "./utils/number";
import DriftThemeDemo from "./components/DriftThemeDemo";
import ColorTest from "./components/ColorTest";

const useTest = () => {
  const { data, error, isLoading } = useSWR(
    "test",
    () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Map([[1, Math.random()]]));
        }, 1000);
      });
    },
    {
      refreshInterval: 1000,
    }
  );

  return { data, error, isLoading };
};

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { userAccount, isLoading, error, refreshUserAccount } =
    useUserAccounts();
  const { data } = useTest();

  const { trackTransaction } = useTransactions();
  const { isOpen, open, close } = useModal(false);
  const {
    isOpen: isThemeOpen,
    open: openTheme,
    close: closeTheme,
  } = useModal(false);
  const {
    isOpen: isColorTestOpen,
    open: openColorTest,
    close: closeColorTest,
  } = useModal(false);

  const handleDeposit = async () => {
    try {
      const txhash = await deposit({ amount: 0.1 });

      // Track transaction with success actions
      trackTransaction(txhash, "Deposit 0.1 SOL", [
        { type: TransactionSuccessActionType.UPDATE_USER_ACCOUNT },
      ]);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const { activeAccount, switchActiveAccount } = useActiveAccount();

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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8">
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 mb-6 text-neutrals-100 dark:text-neutrals-10">
            <h2 className="text-xl font-bold mb-4">Drift Protocol Dashboard</h2>
            <p className="mb-4 text-neutrals-60 dark:text-neutrals-30">
              Welcome to the Drift Protocol trading dashboard. Connect your
              wallet to start trading.
            </p>
            {connected && publicKey && (
              <div className="p-3 bg-neutrals-20 dark:bg-neutrals-70 rounded">
                <p>
                  Connected:{" "}
                  <span className="font-mono">{publicKey.toString()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Color Test Box */}
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 mb-6 text-neutrals-100 dark:text-neutrals-10">
            <h2 className="text-xl font-bold mb-4">Color Tests</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="p-2 bg-neutrals-10 dark:bg-neutrals-70">
                neutrals-10/70
              </div>
              <div className="p-2 bg-neutrals-20 dark:bg-neutrals-80">
                neutrals-20/80
              </div>
              <div className="p-2 bg-purple-50 text-white">purple-50</div>
              <div className="p-2 bg-red-50 text-white">red-50</div>
              <div className="p-2 bg-green-50 text-white">green-50</div>
            </div>
            <button
              onClick={openColorTest}
              className="bg-purple-50 hover:bg-purple-60 text-white px-4 py-2 rounded-md transition-colors"
            >
              Open Full Color Test
            </button>
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

          {connected && <AccountsPositionsPanel />}
        </div>

        <div className="md:col-span-4">
          <SettingsPanel />
        </div>
        <div className="md:col-span-12 flex space-x-4">
          <button
            onClick={handleDeposit}
            className="bg-purple-50 hover:bg-purple-60 text-white px-4 py-2 rounded-md transition-colors"
          >
            Deposit 0.1 SOL
          </button>
          <button
            onClick={open}
            className="bg-green-50 hover:bg-green-60 text-white px-4 py-2 rounded-md transition-colors"
          >
            Open Modal
          </button>
          <button
            onClick={openTheme}
            className="bg-primary-gradient text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            View Drift Theme Demo
          </button>
        </div>
      </div>

      <div>
        <p>
          Active Account: {activeAccount?.user?.userAccountPublicKey.toString()}
        </p>
        <p>Active Account ID: {activeAccount?.activeId}</p>
        {/* free collateral */}
        <p>Free Collateral: {formatBN(activeAccount?.freeCollateral, true)}</p>
      </div>

      <button onClick={() => switchActiveAccount(1)}>
        Switch to Account 1
      </button>

      {/* Trading Modal */}
      <TradingModal
        marketIndex={0}
        orderDirection="long"
        orderType={"limit"}
        isOpen={isOpen}
        onClose={close}
      />
    </main>
  );
}
