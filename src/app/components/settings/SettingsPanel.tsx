"use client";

import { useSettingsStore } from "@/app/store";

export const SettingsPanel = () => {
  const {
    showNotifications,
    slippageTolerance,
    setShowNotifications,
    setSlippageTolerance,
  } = useSettingsStore();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-gray-500">
          Customize your trading experience
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Notifications Settings */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={showNotifications}
            onChange={(e) => setShowNotifications(e.target.checked)}
          />
          <label htmlFor="notifications" className="text-sm font-medium">
            Enable Notifications
          </label>
        </div>

        {/* Slippage Tolerance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Slippage Tolerance ({slippageTolerance}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippageTolerance}
            onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
