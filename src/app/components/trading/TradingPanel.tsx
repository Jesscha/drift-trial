"use client";

import { useState } from "react";
import { Subaccount, markets } from "../../utils/mockData";
import { useDrift } from "../../contexts/DriftContext";

interface TradingPanelProps {
  subaccount: Subaccount;
}

export default function TradingPanel({ subaccount }: TradingPanelProps) {
  // Note: subaccount parameter is used in the UI components for displaying account information
  const { driftClient, walletConnected } = useDrift();

  console.log("driftClient", driftClient);
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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  // Find the available balance for the current market asset
  const getAvailableBalance = () => {
    const asset = market.id.split("-")[0];
    const tokenBalance = subaccount.balances.find((b) => b.asset === asset);
    return tokenBalance ? tokenBalance.available : 0;
  };

  // Check if user has sufficient balance
  const hasSufficientBalance = () => {
    if (side === "Buy") {
      // For Buy orders, check if user has enough USDC
      const usdcBalance = subaccount.balances.find((b) => b.asset === "USDC");
      return usdcBalance && usdcBalance.available >= calculateTotal();
    } else {
      // For Sell orders, check if user has enough of the asset
      const assetBalance = getAvailableBalance();
      return assetBalance >= parseFloat(size);
    }
  };

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
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driftClient || !walletConnected) {
      setOrderStatus({
        message: "Please connect your wallet first",
        isError: true,
      });
      return;
    }

    if (!hasSufficientBalance()) {
      setOrderStatus({
        message: "Insufficient balance for this order",
        isError: true,
      });
      return;
    }

    try {
      setIsPlacingOrder(true);
      setOrderStatus(null);

      const orderParams = {
        market: market.id,
        type: orderType,
        side,
        size: parseFloat(size),
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
      };

      console.log("Placing order with Drift client:", orderParams);

      // In a real implementation, we would call the appropriate Drift SDK methods
      // For example:
      // For market orders:
      // await driftClient.placeAndTakeOrder({
      //   marketIndex: getMarketIndexById(market.id),
      //   direction: side === 'Buy' ? PositionDirection.LONG : PositionDirection.SHORT,
      //   baseAssetAmount: new BN(parseFloat(size) * PRECISION),
      //   reduceOnly: false
      // });

      // Simulate a delayed response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOrderStatus({
        message: "Order placed successfully",
        isError: false,
      });
    } catch (err) {
      console.error("Error placing order:", err);
      setOrderStatus({
        message: `Order failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
        isError: true,
      });
    } finally {
      setIsPlacingOrder(false);
    }
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

      <div className="mb-4 p-3 bg-gray-700 rounded">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Available Balance:</span>
          <div>
            <span className="text-white font-medium">
              {getAvailableBalance().toLocaleString()} {market.id.split("-")[0]}
            </span>
            {subaccount.balances.find((b) => b.asset === "USDC") && (
              <span className="text-white font-medium ml-3">
                {subaccount.balances
                  .find((b) => b.asset === "USDC")
                  ?.available.toLocaleString()}{" "}
                USDC
              </span>
            )}
          </div>
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

        {orderStatus && (
          <div
            className={`mb-4 p-2 rounded text-sm ${
              orderStatus.isError
                ? "bg-red-900 text-red-100"
                : "bg-green-900 text-green-100"
            }`}
          >
            {orderStatus.message}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={
              isPlacingOrder || !walletConnected || !hasSufficientBalance()
            }
            className={`w-full bg-orange-500 text-white py-3 rounded font-medium hover:bg-orange-600 ${
              isPlacingOrder || !walletConnected || !hasSufficientBalance()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {!walletConnected
              ? "Connect Wallet to Trade"
              : !hasSufficientBalance()
              ? "Insufficient Balance"
              : isPlacingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
