"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUserAccounts } from "./hooks/useUserAccounts";

export default function Home() {
  const { publicKey, connected } = useWallet();
  useUserAccounts();

  return (
    <main className="container mx-auto p-4">
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
        </div>

        <div className="md:col-span-4"></div>
      </div>
    </main>
  );
}
