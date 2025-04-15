"use client";

import React, { ReactNode } from "react";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
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
import { DriftClientProvider } from "@/app/providers/DriftClientProvider";
import { TransactionProvider } from "@/app/providers/TransactionProvider";

import "@solana/wallet-adapter-react-ui/styles.css";

export const Providers = ({ children }: { children: ReactNode }) => {
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

  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ||
    "https://api.devnet.solana.com";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <DriftClientProvider>
            <TransactionProvider>{children}</TransactionProvider>
          </DriftClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
