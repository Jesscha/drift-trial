"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ThemeToggle from "../ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { publicKey, connected } = useWallet();
  const [searchWallet, setSearchWallet] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWallet.trim()) {
      router.push(`/search?address=${encodeURIComponent(searchWallet.trim())}`);
    }
  };

  return (
    <header className="bg-neutrals-10 dark:bg-neutrals-80 p-4 shadow-md text-neutrals-100 dark:text-neutrals-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link
            href="/"
            className="text-neutrals-100 dark:text-neutrals-0 text-2xl font-bold hover:opacity-90"
          >
            Drift Protocol
          </Link>
          <nav className="ml-8 hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/"
                  className="text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                >
                  Markets
                </a>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                >
                  Wallet Search
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search wallet address..."
              className="bg-neutrals-20 dark:bg-neutrals-70 text-neutrals-100 dark:text-neutrals-10 px-3 py-2 rounded-l outline-none"
              value={searchWallet}
              onChange={(e) => setSearchWallet(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-50 text-white px-3 py-2 rounded-r hover:bg-purple-60 transition-colors"
            >
              Search
            </button>
          </form>

          {connected && publicKey && (
            <div className="flex items-center space-x-2 mr-2">
              <span className="text-neutrals-90 dark:text-neutrals-20">
                {publicKey?.toString().substring(0, 4)}...
                {publicKey
                  ?.toString()
                  .substring((publicKey?.toString().length || 0) - 4)}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <WalletMultiButton className="!bg-primary-gradient hover:!opacity-90" />
          </div>
        </div>
      </div>
    </header>
  );
}
