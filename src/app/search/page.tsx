"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { usePNLUserData } from "../hooks/usePNLUserData";
import { AccountsPositionsPanel } from "../components/accounts/Accounts";
import { TransactionToasts } from "../components/TransactionToasts";

export default function SearchPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read the address query parameter on initial load
  useEffect(() => {
    const addressParam = searchParams.get("address");
    if (addressParam) {
      setWalletAddress(addressParam);
      validateAndSetPublicKey(addressParam);
    }
  }, [searchParams]);

  const validateAndSetPublicKey = (address: string) => {
    setError(null);
    try {
      if (!address.trim()) {
        setError("Please enter a wallet address");
        return;
      }

      // Validate and create PublicKey
      const pubkey = new PublicKey(address);
      setPublicKey(pubkey);
    } catch (err) {
      setError("Invalid wallet address");
    }
  };

  const handleSearch = () => {
    validateAndSetPublicKey(walletAddress);

    // Update URL with search parameter for shareability
    if (walletAddress.trim()) {
      const url = `/search?address=${encodeURIComponent(walletAddress.trim())}`;
      router.push(url, { scroll: false });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <main className="container mx-auto p-4">
      <TransactionToasts />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Search panel - appears first on mobile, right on desktop */}
        <div className="md:col-span-4 md:order-2">
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-6 text-neutrals-100 dark:text-neutrals-10">
            <h1 className="text-2xl mb-4">Wallet Search</h1>
            <p className="mb-4">
              Enter a Solana wallet address to view its sub-accounts
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={walletAddress}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter wallet address"
                className="w-full bg-neutrals-20 dark:bg-neutrals-70 rounded-md p-2 text-neutrals-100 dark:text-neutrals-10 border border-neutrals-30 dark:border-neutrals-60 focus:outline-none focus:ring-2 focus:ring-purple-50"
              />
              <button
                onClick={handleSearch}
                className="w-full bg-purple-50 hover:bg-purple-60 text-white px-4 py-2 rounded-md transition-colors"
              >
                Search
              </button>
            </div>

            {error && (
              <div className="text-red-60 dark:text-red-30 mb-4">{error}</div>
            )}
          </div>
        </div>

        {/* Results panel - appears second on mobile, left on desktop */}
        <div className="md:col-span-8 md:order-1">
          {publicKey ? (
            <div>
              <div className="mb-4 bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 text-neutrals-100 dark:text-neutrals-10">
                <h2 className="text-xl font-bold mb-2">Viewing Wallet</h2>
                <p className="font-mono break-all">{publicKey.toString()}</p>
              </div>

              <WalletSubAccounts publicKey={publicKey} />
            </div>
          ) : (
            <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-6 text-neutrals-100 dark:text-neutrals-10 h-40 flex items-center justify-center">
              <p className="text-lg text-neutrals-60 dark:text-neutrals-40">
                Search for a wallet address to view its sub-accounts
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function WalletSubAccounts({ publicKey }: { publicKey: PublicKey }) {
  const {
    subaccounts,
    totalDepositAmount,
    totalUnsettledPnl,
    totalNetValue,
    isLoading,
    error,
  } = usePNLUserData(publicKey);

  if (isLoading) {
    return (
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 text-neutrals-100 dark:text-neutrals-10">
        <p>Loading accounts and positions data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-10 dark:bg-red-90 rounded-lg p-4 text-red-70 dark:text-red-20">
        <p>Error loading accounts data: {error.toString()}</p>
      </div>
    );
  }

  if (!subaccounts || subaccounts.length === 0) {
    return (
      <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 text-neutrals-100 dark:text-neutrals-10">
        <p>No accounts found for this wallet address.</p>
      </div>
    );
  }

  return <AccountsPositionsPanel publicKeyOverride={publicKey} />;
}
