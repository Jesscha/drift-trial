"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  Wallet,
  DriftClient,
  BulkAccountLoader,
  DRIFT_PROGRAM_ID,
} from "@drift-labs/sdk";
import {
  useWallet,
  WalletProvider,
  ConnectionProvider,
  useConnection,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  CloverWalletAdapter,
  TorusWalletAdapter,
  MathWalletAdapter,
  Coin98WalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

interface DriftContextType {
  driftClient: DriftClient | null;
  isInitializing: boolean;
  error: Error | null;
  walletConnected: boolean;
  walletPublicKey: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const DriftContext = createContext<DriftContextType>({
  driftClient: null,
  isInitializing: false,
  error: null,
  walletConnected: false,
  walletPublicKey: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useDrift = () => useContext(DriftContext);

const DriftAdapterWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { connection } = useConnection();
  const {
    publicKey,
    connected,
    disconnect,
    connect,
    wallet,
    signTransaction,
    signAllTransactions,
  } = useWallet();

  const [driftClient, setDriftClient] = useState<DriftClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      setWalletPublicKey(publicKey.toString());
    } else {
      setWalletPublicKey(null);
    }
  }, [publicKey]);

  const initializeDriftClient = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      setError(new Error("Wallet connection incomplete"));
      return null;
    }

    try {
      setIsInitializing(true);
      setError(null);

      const accountLoader = new BulkAccountLoader(
        connection,
        "confirmed",
        1000
      );

      const driftWallet: Wallet = {
        publicKey,
        signTransaction,
        signAllTransactions,
        payer: new Keypair(),
        signVersionedTransaction: async (tx) => {
          throw new Error("signVersionedTransaction not implemented");
        },
        signAllVersionedTransactions: async (txs) => {
          throw new Error("signAllVersionedTransactions not implemented");
        },
      };

      const client = new DriftClient({
        connection,
        wallet: driftWallet,
        programID: new PublicKey(DRIFT_PROGRAM_ID),
        accountSubscription: {
          type: "polling",
          accountLoader,
        },
      });

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

  const connectWallet = async () => {
    try {
      if (!wallet) {
        throw new Error("No wallet selected");
      }

      await connect();

      if (connected && publicKey) {
        await initializeDriftClient();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    if (driftClient) {
      driftClient.unsubscribe();
      setDriftClient(null);
    }

    disconnect();
  };

  useEffect(() => {
    if (connected && publicKey && !driftClient) {
      initializeDriftClient();
    }
  }, [connected, publicKey]);

  // Context value
  const value = {
    driftClient,
    isInitializing,
    error,
    walletConnected: connected,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
  };

  return (
    <DriftContext.Provider value={value}>{children}</DriftContext.Provider>
  );
};

interface DriftProviderProps {
  children: ReactNode;
}

export const DriftProvider: React.FC<DriftProviderProps> = ({ children }) => {
  // Set up wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
    new CloverWalletAdapter(),
    new TorusWalletAdapter(),
    new MathWalletAdapter(),
    new Coin98WalletAdapter(),
  ];

  const endpoint = "https://api.devnet.solana.com";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <DriftAdapterWrapper>{children}</DriftAdapterWrapper>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
