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
    <div className="bg-neutrals-0 dark:bg-neutrals-80 rounded-lg shadow-md border border-neutrals-20 dark:border-neutrals-70">
      <div className="p-4 border-b border-neutrals-20 dark:border-neutrals-70">
        <h2 className="text-xl font-bold text-neutrals-100 dark:text-neutrals-0">
          Settings
        </h2>
        <p className="text-sm text-neutrals-60 dark:text-neutrals-40">
          Customize your trading experience
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Notifications Settings */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications"
            className="h-4 w-4 rounded border-neutrals-30 dark:border-neutrals-60 text-purple-50 focus:ring-purple-40"
            checked={showNotifications}
            onChange={(e) => setShowNotifications(e.target.checked)}
          />
          <label
            htmlFor="notifications"
            className="text-sm font-medium text-neutrals-100 dark:text-neutrals-10"
          >
            Enable Notifications
          </label>
        </div>

        {/* Slippage Tolerance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutrals-100 dark:text-neutrals-10">
            Slippage Tolerance ({slippageTolerance}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={slippageTolerance}
            onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
            className="w-full accent-purple-50"
          />
          <div className="flex justify-between text-xs text-neutrals-60 dark:text-neutrals-40">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
