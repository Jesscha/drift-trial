"use client";

import React from "react";

const DriftThemeDemo: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-neutrals-100 dark:text-neutrals-20">
        Drift Theme Colors
      </h1>

      {/* Gradient Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutrals-90 dark:text-neutrals-30">
          Gradient Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-24 rounded-lg bg-primary-gradient flex items-center justify-center text-white font-medium">
            Primary Gradient
          </div>
          <div className="h-24 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-medium">
            Brand Gradient
          </div>
          <div className="h-24 rounded-lg bg-buy-gradient flex items-center justify-center text-white font-medium">
            Buy Gradient
          </div>
          <div className="h-24 rounded-lg bg-sell-gradient flex items-center justify-center text-white font-medium">
            Sell Gradient
          </div>
          <div className="h-24 rounded-lg bg-prize-gradient flex items-center justify-center text-neutrals-100 font-medium">
            Prize Gradient
          </div>
          <div className="h-24 rounded-lg bg-fuel-gradient flex items-center justify-center text-white font-medium">
            Fuel Gradient
          </div>
        </div>
      </section>

      {/* Color Palette - Purple */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutrals-90 dark:text-neutrals-30">
          Purple Palette
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].map((shade) => (
            <div key={shade} className="flex flex-col items-center">
              <div
                className={`h-16 w-full rounded-md bg-purple-${shade}`}
                style={{ backgroundColor: `var(--purple-${shade})` }}
              ></div>
              <span className="text-xs text-neutrals-70 dark:text-neutrals-40 mt-1">
                {shade}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Color Palette - Dark Blue */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutrals-90 dark:text-neutrals-30">
          Dark Blue Palette
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].map((shade) => (
            <div key={shade} className="flex flex-col items-center">
              <div
                className={`h-16 w-full rounded-md`}
                style={{ backgroundColor: `var(--darkBlue-${shade})` }}
              ></div>
              <span className="text-xs text-neutrals-70 dark:text-neutrals-40 mt-1">
                {shade}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* UI Component Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutrals-90 dark:text-neutrals-30">
          UI Component Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Transaction Card */}
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-neutrals-90 dark:text-neutrals-20">
                Transaction Details
              </h3>
              <span className="text-xs py-1 px-2 rounded-full bg-green-10 dark:bg-green-90 text-green-70 dark:text-green-20">
                Confirmed
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Amount
                </span>
                <span className="text-sm font-medium text-neutrals-90 dark:text-neutrals-20">
                  1.45 SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Fee
                </span>
                <span className="text-sm font-medium text-neutrals-90 dark:text-neutrals-20">
                  0.00001 SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  Date
                </span>
                <span className="text-sm font-medium text-neutrals-90 dark:text-neutrals-20">
                  May 12, 2023
                </span>
              </div>
            </div>
            <button className="mt-4 w-full py-2 rounded-md text-sm font-medium text-white bg-purple-50 hover:bg-purple-60 transition-colors">
              View on Explorer
            </button>
          </div>

          {/* Card 2: Market Data */}
          <div className="bg-neutrals-10 dark:bg-neutrals-80 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-neutrals-90 dark:text-neutrals-20">
                SOL/USD
              </h3>
              <span className="text-xs py-1 px-2 rounded-full bg-red-10 dark:bg-red-90 text-red-70 dark:text-red-20">
                -2.4%
              </span>
            </div>
            <div className="text-2xl font-bold text-neutrals-100 dark:text-neutrals-0 mb-3">
              $142.56
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  24h High
                </span>
                <span className="text-sm font-medium text-neutrals-90 dark:text-neutrals-20">
                  $148.32
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  24h Low
                </span>
                <span className="text-sm font-medium text-neutrals-90 dark:text-neutrals-20">
                  $140.11
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutrals-60 dark:text-neutrals-40">
                  24h Volume
                </span>
                <span className="text-sm font-medium text-neutrals-90 dark:text-neutrals-20">
                  $1.2B
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="py-2 rounded-md text-sm font-medium text-white bg-buy-gradient hover:opacity-90 transition-opacity">
                Buy
              </button>
              <button className="py-2 rounded-md text-sm font-medium text-white bg-sell-gradient hover:opacity-90 transition-opacity">
                Sell
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DriftThemeDemo;
