"use client";

import { useState } from "react";
import { Subaccount, markets } from "../../utils/mockData";

interface TradingPanelProps {
  subaccount: Subaccount;
}

export default function TradingPanel({ subaccount }: TradingPanelProps) {
  const [market, setMarket] = useState(markets[0]);
  const [orderType, setOrderType] = useState("Market");
  const [side, setSide] = useState("Buy");
  const [price, setPrice] = useState(market.price.toString());
  const [size, setSize] = useState("1");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [scaleOrdersEnabled, setScaleOrdersEnabled] = useState(false);
  const [scaleStart, setScaleStart] = useState("");
  const [scaleEnd, setScaleEnd] = useState("");
  const [scaleSteps, setScaleSteps] = useState("3");

  // Use subaccount information in component context
  const hasBalance = subaccount.balances.length > 0;

  // Handle market change and update price
  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMarket =
      markets.find((m) => m.id === e.target.value) || markets[0];
    setMarket(selectedMarket);
    setPrice(selectedMarket.price.toString());
  };

  // Calculate total cost
  const calculateTotal = () => {
    if (orderType === "Market") {
      return parseFloat(size) * market.price;
    } else {
      return parseFloat(size) * parseFloat(price || "0");
    }
  };

  // Handle order placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call the Drift SDK to place the order
    console.log("Order placed:", {
      market: market.id,
      type: orderType,
      side,
      size,
      price: orderType === "Market" ? market.price : parseFloat(price),
      takeProfit: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      stopLoss: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
      scaleOrders: scaleOrdersEnabled
        ? {
            start: parseFloat(scaleStart),
            end: parseFloat(scaleEnd),
            steps: parseInt(scaleSteps),
          }
        : undefined,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Trading</h2>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Current Price:</span>
          <span className="text-white font-medium">
            ${market.price.toLocaleString()}
          </span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Market</label>
            <select
              value={market.id}
              onChange={handleMarketChange}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Order Type
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setOrderType("Market")}
                className={`flex-1 py-2 rounded ${
                  orderType === "Market"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setOrderType("Limit")}
                className={`flex-1 py-2 rounded ${
                  orderType === "Limit"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                Limit
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Side</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSide("Buy")}
              className={`flex-1 py-3 rounded ${
                side === "Buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              Buy / Long
            </button>
            <button
              type="button"
              onClick={() => setSide("Sell")}
              className={`flex-1 py-3 rounded ${
                side === "Sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              Sell / Short
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              {orderType === "Market" ? "Market Price" : "Limit Price"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={orderType === "Market" ? market.price : price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={orderType === "Market"}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="absolute right-3 top-2 text-gray-400">USDC</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Size</label>
            <div className="relative">
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="absolute right-3 top-2 text-gray-400">
                {market.id.split("-")[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-gray-700 rounded p-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-medium">
              ${calculateTotal().toLocaleString()} USDC
            </span>
          </div>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-400 text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-1 transition-transform ${
                showAdvanced ? "rotate-90" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-3 bg-gray-700 rounded">
              {/* Take Profit */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tp-checkbox"
                  className="rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                  checked={!!takeProfitPrice}
                  onChange={(e) => {
                    if (!e.target.checked) setTakeProfitPrice("");
                    else
                      setTakeProfitPrice((parseFloat(price) * 1.05).toString());
                  }}
                />
                <label htmlFor="tp-checkbox" className="text-gray-300 text-sm">
                  Take Profit
                </label>
                {!!takeProfitPrice && (
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={takeProfitPrice}
                      onChange={(e) => setTakeProfitPrice(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded px-3 py-1 outline-none text-sm"
                    />
                    <span className="absolute right-3 top-1 text-gray-400 text-sm">
                      USDC
                    </span>
                  </div>
                )}
              </div>

              {/* Stop Loss */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sl-checkbox"
                  className="rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                  checked={!!stopLossPrice}
                  onChange={(e) => {
                    if (!e.target.checked) setStopLossPrice("");
                    else
                      setStopLossPrice((parseFloat(price) * 0.95).toString());
                  }}
                />
                <label htmlFor="sl-checkbox" className="text-gray-300 text-sm">
                  Stop Loss
                </label>
                {!!stopLossPrice && (
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded px-3 py-1 outline-none text-sm"
                    />
                    <span className="absolute right-3 top-1 text-gray-400 text-sm">
                      USDC
                    </span>
                  </div>
                )}
              </div>

              {/* Scaled Orders */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="scale-checkbox"
                    className="rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                    checked={scaleOrdersEnabled}
                    onChange={(e) => setScaleOrdersEnabled(e.target.checked)}
                  />
                  <label
                    htmlFor="scale-checkbox"
                    className="text-gray-300 text-sm"
                  >
                    Scale Orders
                  </label>
                </div>

                {scaleOrdersEnabled && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Start"
                        value={scaleStart}
                        onChange={(e) => setScaleStart(e.target.value)}
                        className="w-full bg-gray-800 text-white rounded px-3 py-1 outline-none text-sm"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="End"
                        value={scaleEnd}
                        onChange={(e) => setScaleEnd(e.target.value)}
                        className="w-full bg-gray-800 text-white rounded px-3 py-1 outline-none text-sm"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Steps"
                        value={scaleSteps}
                        onChange={(e) => setScaleSteps(e.target.value)}
                        className="w-full bg-gray-800 text-white rounded px-3 py-1 outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-medium ${
            side === "Buy"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
          disabled={!hasBalance}
        >
          {side === "Buy" ? "Buy / Long" : "Sell / Short"}{" "}
          {market.id.split("-")[0]}
        </button>
      </form>
    </div>
  );
}
