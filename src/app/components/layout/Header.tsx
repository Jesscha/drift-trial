"use client";

import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ThemeToggle from "../ThemeToggle";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [searchWallet, setSearchWallet] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWallet.trim()) {
      router.push(`/search?address=${encodeURIComponent(searchWallet.trim())}`);
      setSearchWallet(""); // Clear search after submitting
      setMobileMenuOpen(false); // Close mobile menu after search
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-neutrals-10 dark:bg-neutrals-80 p-4 shadow-md text-neutrals-100 dark:text-neutrals-10">
      <div className="container mx-auto">
        {/* Top bar with logo and mobile menu button */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-neutrals-100 dark:text-neutrals-0 text-2xl font-bold hover:opacity-90"
          >
            Drift Dashboard
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-neutrals-100 dark:text-neutrals-0"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1">
              <span
                className={`block h-0.5 w-full bg-current transform transition-transform duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-current transition-opacity duration-300 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-current transform transition-transform duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </div>
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link
                    href="/"
                    className={`transition-colors ${
                      isActive("/")
                        ? "text-purple-50 font-medium border-b-2 border-purple-50"
                        : "text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className={`transition-colors ${
                      isActive("/search")
                        ? "text-purple-50 font-medium border-b-2 border-purple-50"
                        : "text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                    }`}
                  >
                    Wallet Search
                  </Link>
                </li>
              </ul>
            </nav>

            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search wallet..."
                className="w-48 bg-neutrals-5 dark:bg-neutrals-90 text-neutrals-100 dark:text-neutrals-10 px-3 py-2 rounded-md border border-neutrals-20 dark:border-neutrals-70 focus:outline-none focus:ring-1 focus:ring-blue-100"
                value={searchWallet}
                onChange={(e) => setSearchWallet(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 bg-blue-100 hover:bg-blue-200 text-neutrals-100 px-3 py-2 rounded-md transition-colors font-medium"
              >
                Search
              </button>
            </form>

            <div className="flex items-center space-x-3">
              <WalletMultiButton className="!bg-primary-gradient hover:!opacity-90" />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile menu (dropdown) */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen
              ? "max-h-screen opacity-100 py-4"
              : "max-h-0 opacity-0 overflow-hidden py-0"
          }`}
        >
          <nav className="mb-4">
            <ul className="flex flex-col space-y-2">
              <li>
                <Link
                  href="/"
                  className={`block py-2 transition-colors ${
                    isActive("/")
                      ? "text-purple-50 font-medium border-l-4 border-purple-50 pl-2"
                      : "text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className={`block py-2 transition-colors ${
                    isActive("/search")
                      ? "text-purple-50 font-medium border-l-4 border-purple-50 pl-2"
                      : "text-neutrals-90 dark:text-neutrals-20 hover:text-purple-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wallet Search
                </Link>
              </li>
            </ul>
          </nav>

          <form onSubmit={handleSearch} className="flex mb-4">
            <input
              type="text"
              placeholder="Search wallet address..."
              className="flex-grow bg-neutrals-5 dark:bg-neutrals-90 text-neutrals-100 dark:text-neutrals-10 px-3 py-2 rounded-md border border-neutrals-20 dark:border-neutrals-70 focus:outline-none focus:ring-1 focus:ring-blue-100"
              value={searchWallet}
              onChange={(e) => setSearchWallet(e.target.value)}
            />
            <button
              type="submit"
              className="ml-2 bg-blue-100 hover:bg-blue-200 text-neutrals-100 px-3 py-2 rounded-md transition-colors font-medium"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-3">
            <WalletMultiButton className="!bg-primary-gradient hover:!opacity-90" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
