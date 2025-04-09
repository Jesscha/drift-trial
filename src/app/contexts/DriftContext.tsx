"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Wallet,
  DriftClient,
  BulkAccountLoader,
  DRIFT_PROGRAM_ID,
} from "@drift-labs/sdk";

// Define the context type
interface DriftContextType {
  driftClient: DriftClient | null;
  isInitializing: boolean;
  error: Error | null;
  walletConnected: boolean;
  walletPublicKey: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Create context with default values
const DriftContext = createContext<DriftContextType>({
  driftClient: null,
  isInitializing: false,
  error: null,
  walletConnected: false,
  walletPublicKey: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

// Hook to use the Drift context
export const useDrift = () => useContext(DriftContext);

interface DriftProviderProps {
  children: ReactNode;
}

export const DriftProvider: React.FC<DriftProviderProps> = ({ children }) => {
  const [driftClient, setDriftClient] = useState<DriftClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);
  console.log("walletPublicKey", walletPublicKey);

  // Function to initialize the Drift client
  const initializeDriftClient = async (walletToUse: Wallet) => {
    try {
      setIsInitializing(true);
      setError(null);

      // Connect to Solana devnet
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      // Create account loader
      const accountLoader = new BulkAccountLoader(
        connection,
        "confirmed",
        1000
      );

      // Create Drift client instance
      const client = new DriftClient({
        connection,
        wallet: walletToUse,
        programID: new PublicKey(DRIFT_PROGRAM_ID),
        accountSubscription: {
          type: "polling",
          accountLoader,
        },
      });

      // Initialize the client
      await client.subscribe();

      setDriftClient(client);
      return client;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to initialize Drift client:", error);
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  // Connect wallet (mock for now)
  const connectWallet = async () => {
    try {
      // For demo purposes, use a new Keypair
      // In a real app, this would integrate with a wallet provider like Phantom
      const keypair = Keypair.generate();
      const dummyWallet = new Wallet(keypair);
      console.log("dummyWallet", dummyWallet);

      setWalletConnected(true);
      setWalletPublicKey(keypair.publicKey.toString());

      // Initialize Drift client with the new wallet
      await initializeDriftClient(dummyWallet);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to connect wallet:", error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletPublicKey(null);

    // Cleanup: unsubscribe from the drift client if exists
    if (driftClient) {
      driftClient.unsubscribe();
      setDriftClient(null);
    }
  };

  // Context value
  const value = {
    driftClient,
    isInitializing,
    error,
    walletConnected,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
  };

  return (
    <DriftContext.Provider value={value}>{children}</DriftContext.Provider>
  );
};
