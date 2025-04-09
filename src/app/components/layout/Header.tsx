"use client";

import { useState } from "react";
import { useDrift } from "../../contexts/DriftContext";

export default function Header() {
  const {
    walletConnected,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
    isInitializing,
  } = useDrift();
  const [searchWallet, setSearchWallet] = useState("");

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would fetch data for the entered wallet
    console.log(`Searching for wallet: ${searchWallet}`);
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-white text-2xl font-bold">Drift Protocol</h1>
          <nav className="ml-8 hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-white hover:text-orange-400">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-orange-400">
                  Markets
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-orange-400">
                  Portfolio
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search wallet address..."
              className="bg-gray-700 text-white px-3 py-2 rounded-l outline-none"
              value={searchWallet}
              onChange={(e) => setSearchWallet(e.target.value)}
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-3 py-2 rounded-r hover:bg-orange-600"
            >
              Search
            </button>
          </form>

          {walletConnected ? (
            <div className="flex items-center space-x-2">
              <span className="text-white">
                {walletPublicKey?.substring(0, 4)}...
                {walletPublicKey?.substring((walletPublicKey?.length || 0) - 4)}
              </span>
              <button
                onClick={handleDisconnect}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isInitializing}
              className={`bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ${
                isInitializing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isInitializing ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
