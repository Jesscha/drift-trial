import { useState, useEffect, useCallback } from "react";
import { DriftClient } from "@drift-labs/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import driftService from "../services/drift/client";

export function useDriftClient() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, signAllTransactions, wallet } =
    useWallet();

  const [client, setClient] = useState<DriftClient | null>(
    driftService.getClient()
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(
    driftService.getIsInitialized()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const initializeDriftClient = useCallback(async () => {
    if (!publicKey || !signTransaction || !signAllTransactions || !wallet) {
      setError(new Error("Wallet connection incomplete"));
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const driftWallet = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };

      const newClient = await driftService.initialize(connection, driftWallet);
      return newClient;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to initialize Drift client:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signTransaction, signAllTransactions, wallet, connection]);

  useEffect(() => {
    // Set initial state
    setClient(driftService.getClient());
    setIsInitialized(driftService.getIsInitialized());

    // Set up event listeners
    const handleInitialized = (newClient: DriftClient) => {
      setClient(newClient);
      setIsInitialized(true);
      setIsLoading(false);
    };

    const handleDisconnected = () => {
      setClient(null);
      setIsInitialized(false);
      setIsLoading(false);
    };

    const handleLoading = () => {
      setIsLoading(true);
    };

    driftService.on("initialized", handleInitialized);
    driftService.on("disconnected", handleDisconnected);
    driftService.on("loading", handleLoading);

    // Clean up event listeners
    return () => {
      driftService.off("initialized", handleInitialized);
      driftService.off("disconnected", handleDisconnected);
      driftService.off("loading", handleLoading);
    };
  }, []);

  useEffect(() => {
    if (connected && publicKey && !isInitialized && !isLoading) {
      initializeDriftClient();
    }
  }, [connected, publicKey, isInitialized, isLoading, initializeDriftClient]);

  return {
    client,
    isInitialized,
    isLoading,
    error,
    disconnect: () => {
      driftService.disconnect();
    },
    reconnect: driftService.reconnect.bind(driftService),
  };
}
